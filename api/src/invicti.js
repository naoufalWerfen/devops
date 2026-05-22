/**
 * invicti.js — Cliente REST para Invicti AppSec Inventory API + caché en PostgreSQL
 *
 * Autenticación via X-Auth header con token del .env
 * Base URL configurable via INVICTI_API_BASE_URL
 */

const { pool } = require('./db');

const BASE_URL = (process.env.INVICTI_API_BASE_URL || '').replace(/\/+$/, '');
const TOKEN = process.env.INVICTI_API_TOKEN || '';

async function invictiGet(path, query = {}) {
  if (!BASE_URL || !TOKEN) {
    throw new Error('Invicti no configurado: faltan INVICTI_API_BASE_URL o INVICTI_API_TOKEN');
  }

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') qs.append(k, v);
  }
  const sep = qs.toString() ? '?' : '';
  const url = `${BASE_URL}${path}${sep}${qs}`;

  const res = await fetch(url, {
    headers: {
      'X-Auth': TOKEN,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Invicti API ${res.status}: ${text.slice(0, 300)}`);
  }

  return res.json();
}

// ── Applications ──────────────────────────────────────────────────────────
async function getApplications(pageSize = 100, pageNumber = 1) {
  return invictiGet('/api/inventory/v1/applications', {
    pageSize,
    pageNumber,
    includeAssetCount: true,
  });
}

async function getApplication(id) {
  return invictiGet(`/api/inventory/v1/applications/${encodeURIComponent(id)}`, {
    includeAssetCount: true,
  });
}

// ── Assets ────────────────────────────────────────────────────────────────
async function getAssets(filters = {}) {
  return invictiGet('/api/inventory/v1/assets', {
    pageSize: filters.pageSize || 100,
    pageNumber: filters.pageNumber || 1,
    ...(filters.applicationId && { applicationId: filters.applicationId }),
    ...(filters.assetType && { assetType: filters.assetType }),
    ...(filters.name && { name: filters.name }),
  });
}

async function getAsset(id) {
  return invictiGet(`/api/inventory/v1/assets/${encodeURIComponent(id)}`);
}

async function getAssetStats(id) {
  return invictiGet(`/api/inventory/v1/assets/stats/${encodeURIComponent(id)}`);
}

// ── Vulnerabilities ───────────────────────────────────────────────────────
async function getVulnerabilities(filters = {}) {
  const query = {
    pageSize: filters.pageSize || 50,
    pageNumber: filters.pageNumber || 1,
  };
  if (filters.assetId) query.assetId = filters.assetId;
  if (filters.vulnerabilityStatus) query.vulnerabilityStatus = filters.vulnerabilityStatus;
  if (filters.vulnerabilitySeverities) query.vulnerabilitySeverities = filters.vulnerabilitySeverities;
  return invictiGet('/api/inventory/v1/vulnerabilities', query);
}

async function getVulnerability(id) {
  return invictiGet(`/api/inventory/v1/vulnerabilities/${encodeURIComponent(id)}`);
}

// ── Scans ─────────────────────────────────────────────────────────────────
async function getScanVulnerabilities(scanId) {
  return invictiGet(`/api/inventory/v1/scans/${encodeURIComponent(scanId)}/vulnerabilities`);
}

// ── Technologies ──────────────────────────────────────────────────────────
async function getTechnologies(pageSize = 100, pageNumber = 1) {
  return invictiGet('/api/inventory/v1/technologies', { pageSize, pageNumber });
}

// ── Workspaces ────────────────────────────────────────────────────────────
async function getWorkspaces() {
  return invictiGet('/api/inventory/v1/workspaces', { pageSize: 50 });
}

// ── Environments ──────────────────────────────────────────────────────────
async function getEnvironments() {
  return invictiGet('/api/inventory/v1/environments', { pageSize: 100 });
}

// ── Summary (agregado) ───────────────────────────────────────────────────
async function getSummary() {
  const [apps, assets, vulns, workspaces] = await Promise.all([
    getApplications(1, 1).catch(() => ({ pageInfo: { totalCount: 0 } })),
    getAssets({ pageSize: 1 }).catch(() => ({ pageInfo: { totalCount: 0 } })),
    getVulnerabilities({ pageSize: 1 }).catch(() => ({ pageInfo: { totalCount: 0 } })),
    getWorkspaces().catch(() => ({ items: [] })),
  ]);

  // Aggregate severity from workspaces
  const severity = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const w of (workspaces.items || [])) {
    const sc = w.stats?.severityCounts;
    if (sc) {
      severity.critical += sc.critical || 0;
      severity.high += sc.high || 0;
      severity.medium += sc.medium || 0;
      severity.low += sc.low || 0;
      severity.info += sc.info || 0;
    }
  }

  return {
    totalApplications: apps.pageInfo?.totalCount || 0,
    totalAssets: assets.pageInfo?.totalCount || 0,
    totalVulnerabilities: vulns.pageInfo?.totalCount || 0,
    severity,
  };
}

function isConfigured() {
  return !!(BASE_URL && TOKEN);
}

// ══════════════════════════════════════════════════════════════════════════
// Database cache — sync from Invicti API and query locally
// ══════════════════════════════════════════════════════════════════════════

/**
 * Fetch ALL pages of a paginated Invicti endpoint
 */
async function fetchAllPages(path, extraQuery = {}, pageSize = 100) {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await invictiGet(path, { ...extraQuery, pageSize, pageNumber: page });
    const items = data.items || [];
    all.push(...items);
    totalPages = data.pageInfo?.totalPages || 1;
    page++;
  } while (page <= totalPages);
  return all;
}

/**
 * Sync all assets and vulnerabilities from Invicti API into the local DB
 */
async function syncToDatabase() {
  const logRes = await pool.query(
    `INSERT INTO invicti_sync_log (status) VALUES ('running') RETURNING id`
  );
  const logId = logRes.rows[0].id;

  try {
    // 1. Fetch all assets
    const assets = await fetchAllPages('/api/inventory/v1/assets');

    // 2. Fetch all vulnerabilities
    const vulns = await fetchAllPages('/api/inventory/v1/vulnerabilities', {}, 100);

    // 3. Upsert assets
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Clear old data
      await client.query('DELETE FROM invicti_vulnerabilities');
      await client.query('DELETE FROM invicti_assets');

      for (const a of assets) {
        const originTypes = (a.assetOrigins || []).flatMap(o => o.originTypes || []);
        const url = a.assetDetail?.url || a.assetDetail?.path || null;
        await client.query(
          `INSERT INTO invicti_assets (id, name, asset_type, url, environment, business_impact, origin_types, is_demo, raw)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name, asset_type = EXCLUDED.asset_type, url = EXCLUDED.url,
             environment = EXCLUDED.environment, business_impact = EXCLUDED.business_impact,
             origin_types = EXCLUDED.origin_types, is_demo = EXCLUDED.is_demo,
             raw = EXCLUDED.raw, synced_at = NOW()`,
          [a.id, a.name, a.assetType, url, a.environmentId, a.businessImpact,
           originTypes, a.isDemo || false, JSON.stringify(a)]
        );
      }

      for (const v of vulns) {
        await client.query(
          `INSERT INTO invicti_vulnerabilities
             (id, asset_id, name, severity, status, confirmed, is_retestable,
              cvss3_score, cvss3_vector, cwe, cve, source_system,
              first_seen, last_seen, url, parameter, raw)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name, severity = EXCLUDED.severity, status = EXCLUDED.status,
             confirmed = EXCLUDED.confirmed, is_retestable = EXCLUDED.is_retestable,
             cvss3_score = EXCLUDED.cvss3_score, cvss3_vector = EXCLUDED.cvss3_vector,
             cwe = EXCLUDED.cwe, cve = EXCLUDED.cve, source_system = EXCLUDED.source_system,
             first_seen = EXCLUDED.first_seen, last_seen = EXCLUDED.last_seen,
             url = EXCLUDED.url, parameter = EXCLUDED.parameter,
             raw = EXCLUDED.raw, synced_at = NOW()`,
          [
            v.id, v.assetId, v.name, v.severity, v.status,
            v.confirmed || false, v.isRetestable || false,
            v.score?.cvss3?.score || null, v.score?.cvss3?.vector || null,
            v.classification?.cwe || [], v.classification?.cve || [],
            v.source?.system || null,
            v.firstSeen || null, v.lastSeen || null,
            v.dast?.url || v.sast?.filePath || null,
            v.dast?.parameter || null,
            JSON.stringify(v),
          ]
        );
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    // 4. Update sync log
    await pool.query(
      `UPDATE invicti_sync_log SET finished_at = NOW(), assets_count = $1, vulns_count = $2, status = 'success' WHERE id = $3`,
      [assets.length, vulns.length, logId]
    );

    return { assets: assets.length, vulnerabilities: vulns.length };
  } catch (err) {
    await pool.query(
      `UPDATE invicti_sync_log SET finished_at = NOW(), status = 'error', error = $1 WHERE id = $2`,
      [err.message, logId]
    );
    throw err;
  }
}

// ── DB Queries (cached data) ─────────────────────────────────────────────

async function getCachedSummary() {
  const [assetRes, vulnRes, sevRes] = await Promise.all([
    pool.query('SELECT COUNT(*) AS count FROM invicti_assets'),
    pool.query('SELECT COUNT(*) AS count FROM invicti_vulnerabilities'),
    pool.query(`SELECT severity, COUNT(*) AS count FROM invicti_vulnerabilities GROUP BY severity`),
  ]);
  const severity = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const r of sevRes.rows) {
    if (severity.hasOwnProperty(r.severity)) severity[r.severity] = parseInt(r.count);
  }
  return {
    totalAssets: parseInt(assetRes.rows[0].count),
    totalVulnerabilities: parseInt(vulnRes.rows[0].count),
    severity,
  };
}

/**
 * Actionable dashboard data — everything you need at a glance
 */
async function getCachedDashboard() {
  const [
    summaryRes,
    urgentRes,
    assetsAtRiskRes,
    openBySevRes,
    oldestOpenRes,
    recentRes,
    topCweRes,
  ] = await Promise.all([
    // 1. Totals
    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM invicti_assets) AS total_assets,
        (SELECT COUNT(*) FROM invicti_vulnerabilities) AS total_vulns,
        (SELECT COUNT(*) FROM invicti_vulnerabilities WHERE status = 'open') AS open_vulns,
        (SELECT COUNT(*) FROM invicti_vulnerabilities WHERE confirmed = true) AS confirmed_vulns,
        (SELECT COUNT(*) FROM invicti_vulnerabilities WHERE severity IN ('critical','high') AND status = 'open') AS urgent_count
    `),
    // 2. Top 10 urgent: critical/high + open + confirmed, ordered by CVSS desc
    pool.query(`
      SELECT v.id, v.name, v.severity, v.status, v.confirmed, v.cvss3_score,
             v.url, v.parameter, v.first_seen, v.last_seen,
             v.cwe, a.name AS asset_name, a.url AS asset_url,
             EXTRACT(DAY FROM NOW() - v.first_seen)::int AS days_open
      FROM invicti_vulnerabilities v
      LEFT JOIN invicti_assets a ON a.id = v.asset_id
      WHERE v.severity IN ('critical','high') AND v.status = 'open'
      ORDER BY
        CASE v.severity WHEN 'critical' THEN 0 ELSE 1 END,
        v.confirmed DESC,
        v.cvss3_score DESC NULLS LAST,
        v.first_seen ASC
      LIMIT 15
    `),
    // 3. Assets with most critical+high open vulns
    pool.query(`
      SELECT a.id, a.name, a.url, a.asset_type,
             COUNT(*) FILTER (WHERE v.severity = 'critical') AS critical,
             COUNT(*) FILTER (WHERE v.severity = 'high') AS high,
             COUNT(*) FILTER (WHERE v.severity = 'medium') AS medium,
             COUNT(*) AS total_vulns
      FROM invicti_assets a
      JOIN invicti_vulnerabilities v ON v.asset_id = a.id AND v.status = 'open'
      GROUP BY a.id, a.name, a.url, a.asset_type
      ORDER BY critical DESC, high DESC, medium DESC
      LIMIT 10
    `),
    // 4. Open vulns by severity (for chart)
    pool.query(`
      SELECT severity, COUNT(*) AS count
      FROM invicti_vulnerabilities WHERE status = 'open'
      GROUP BY severity
    `),
    // 5. Oldest unresolved vulns (technical debt)
    pool.query(`
      SELECT v.id, v.name, v.severity, v.cvss3_score, v.url, v.first_seen,
             a.name AS asset_name,
             EXTRACT(DAY FROM NOW() - v.first_seen)::int AS days_open
      FROM invicti_vulnerabilities v
      LEFT JOIN invicti_assets a ON a.id = v.asset_id
      WHERE v.status = 'open' AND v.severity IN ('critical','high','medium')
      ORDER BY v.first_seen ASC
      LIMIT 10
    `),
    // 6. Recently discovered (last 30 days)
    pool.query(`
      SELECT v.id, v.name, v.severity, v.confirmed, v.cvss3_score, v.url,
             v.first_seen, a.name AS asset_name
      FROM invicti_vulnerabilities v
      LEFT JOIN invicti_assets a ON a.id = v.asset_id
      WHERE v.first_seen >= NOW() - INTERVAL '30 days' AND v.status = 'open'
      ORDER BY v.first_seen DESC
      LIMIT 10
    `),
    // 7. Top CWE weaknesses
    pool.query(`
      SELECT unnest(cwe) AS cwe_id, COUNT(*) AS count
      FROM invicti_vulnerabilities
      WHERE status = 'open'
      GROUP BY cwe_id
      ORDER BY count DESC
      LIMIT 8
    `),
  ]);

  const totals = summaryRes.rows[0];
  const openBySev = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const r of openBySevRes.rows) {
    if (openBySev.hasOwnProperty(r.severity)) openBySev[r.severity] = parseInt(r.count);
  }

  return {
    totals: {
      assets: parseInt(totals.total_assets),
      vulns: parseInt(totals.total_vulns),
      openVulns: parseInt(totals.open_vulns),
      confirmedVulns: parseInt(totals.confirmed_vulns),
      urgentCount: parseInt(totals.urgent_count),
    },
    openBySeverity: openBySev,
    urgent: urgentRes.rows,
    assetsAtRisk: assetsAtRiskRes.rows,
    oldestOpen: oldestOpenRes.rows,
    recent: recentRes.rows,
    topCwe: topCweRes.rows,
  };
}

async function getCachedAssets(filters = {}) {
  let sql = 'SELECT id, name, asset_type, url, environment, business_impact, origin_types, is_demo, synced_at FROM invicti_assets WHERE 1=1';
  const params = [];
  if (filters.assetType) {
    params.push(filters.assetType);
    sql += ` AND asset_type = $${params.length}`;
  }
  sql += ' ORDER BY name';
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function getCachedVulnerabilities(filters = {}) {
  let sql = `SELECT v.id, v.name, v.severity, v.status, v.confirmed, v.is_retestable,
                    v.cvss3_score, v.cwe, v.cve, v.source_system,
                    v.first_seen, v.last_seen, v.url, v.parameter,
                    a.name AS asset_name
             FROM invicti_vulnerabilities v
             LEFT JOIN invicti_assets a ON a.id = v.asset_id
             WHERE 1=1`;
  const params = [];
  if (filters.severity) {
    params.push(filters.severity);
    sql += ` AND v.severity = $${params.length}`;
  }
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND v.status = $${params.length}`;
  }
  if (filters.assetId) {
    params.push(filters.assetId);
    sql += ` AND v.asset_id = $${params.length}`;
  }
  sql += ' ORDER BY CASE v.severity WHEN \'critical\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 WHEN \'low\' THEN 4 ELSE 5 END, v.last_seen DESC';
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function getCachedVulnerabilityDetail(id) {
  const { rows } = await pool.query(
    `SELECT v.*, a.name AS asset_name, a.url AS asset_url
     FROM invicti_vulnerabilities v
     LEFT JOIN invicti_assets a ON a.id = v.asset_id
     WHERE v.id = $1`, [id]
  );
  return rows[0] || null;
}

async function getLastSync() {
  const { rows } = await pool.query(
    'SELECT * FROM invicti_sync_log ORDER BY id DESC LIMIT 1'
  );
  return rows[0] || null;
}

async function hasCachedData() {
  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM invicti_assets');
  return parseInt(rows[0].count) > 0;
}

module.exports = {
  invictiGet,
  getApplications,
  getApplication,
  getAssets,
  getAsset,
  getAssetStats,
  getVulnerabilities,
  getVulnerability,
  getScanVulnerabilities,
  getTechnologies,
  getWorkspaces,
  getEnvironments,
  getSummary,
  isConfigured,
  // DB cache
  syncToDatabase,
  getCachedSummary,
  getCachedDashboard,
  getCachedAssets,
  getCachedVulnerabilities,
  getCachedVulnerabilityDetail,
  getLastSync,
  hasCachedData,
};
