const express = require('express');
const { pool } = require('./db');
const { runFullSync } = require('./sync');
const { validateAudit, importAudit } = require('./import');
const { runRemoteAudit } = require('./remote-audit');
const { syncVulnerabilities, checkVulnerabilities } = require('./vulnerability');
const { processChat } = require('./chat');
const jenkins = require('./jenkins');
const invicti = require('./invicti');

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/health
// ---------------------------------------------------------------------------
router.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/servers — Lista todos los servidores
// ---------------------------------------------------------------------------
router.get('/servers', async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM servers ORDER BY name'
  );
  res.json(rows);
});

// ---------------------------------------------------------------------------
// GET /api/projects — Lista todos los proyectos con su servidor
// ---------------------------------------------------------------------------
router.get('/projects', async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT p.*, s.name AS server_name, s.hostname, s.ip, s.os, s.os_version,
           s.cpu_count, s.ram_gb, s.disk_gb, s.disk_usage_pct
    FROM projects p
    LEFT JOIN servers s ON p.server_id = s.id
    ORDER BY p.name
  `);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// GET /api/projects/:name — Detalle de un proyecto con stack + EOL
// ---------------------------------------------------------------------------
router.get('/projects/:name', async (req, res) => {
  const { rows: [project] } = await pool.query(
    `SELECT p.*, s.name AS server_name, s.hostname, s.ip, s.os, s.os_version,
            s.cpu, s.cpu_count, s.ram_gb, s.disk_gb, s.disk_usage_pct, s.uptime_days
     FROM projects p
     LEFT JOIN servers s ON p.server_id = s.id
     WHERE p.name = $1`,
    [req.params.name]
  );
  if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

  const { rows: stack } = await pool.query(
    `SELECT sc.*, es.release_date, es.eol_date, es.is_eol, es.latest_version,
            es.latest_date, es.is_lts, es.eoas_date, es.is_eoas, es.is_maintained, es.fetched_at
     FROM stack_components sc
     LEFT JOIN eol_status es ON sc.product = es.product
       AND es.cycle = (
         SELECT cycle FROM eol_status
         WHERE product = sc.product
         ORDER BY fetched_at DESC LIMIT 1
       )
     WHERE sc.project_id = $1
     ORDER BY sc.category, sc.product`,
    [project.id]
  );

  res.json({ ...project, stack });
});

// ---------------------------------------------------------------------------
// GET /api/stack — Vista global del stack con estado EOL
// ---------------------------------------------------------------------------
router.get('/stack', async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT sc.product, sc.product_label, sc.current_version, sc.category,
           COALESCE(p.name, s2.name) AS project_name,
           COALESCE(p.label, s2.name) AS project_label,
           es.is_eol, es.eol_date, es.latest_version, es.latest_date,
           es.is_lts, es.is_eoas, es.eoas_date, es.release_date,
           es.is_maintained, es.fetched_at,
           vs.osv_count, vs.osv_critical, vs.osv_high, vs.osv_medium, vs.osv_low,
           vs.snyk_total, vs.snyk_critical, vs.snyk_high, vs.snyk_upgrade,
           vs.fetched_at AS vuln_fetched_at
    FROM stack_components sc
    LEFT JOIN projects p ON sc.project_id = p.id
    LEFT JOIN servers s2 ON sc.server_id = s2.id
    LEFT JOIN vuln_status vs ON vs.product = sc.product AND vs.version = sc.current_version
    LEFT JOIN eol_status es ON sc.product = es.product
      AND es.cycle = (
        SELECT e2.cycle FROM eol_status e2
        WHERE e2.product = sc.product
          AND (
            e2.cycle = sc.current_version
            OR e2.cycle = split_part(sc.current_version, '.', 1) || '.' || split_part(sc.current_version, '.', 2)
            OR e2.cycle = split_part(sc.current_version, '.', 1)
          )
        ORDER BY
          CASE WHEN e2.cycle = sc.current_version THEN 0
               WHEN e2.cycle = split_part(sc.current_version, '.', 1) || '.' || split_part(sc.current_version, '.', 2) THEN 1
               ELSE 2 END,
          e2.fetched_at DESC
        LIMIT 1
      )
    WHERE (p.id IS NOT NULL OR s2.id IS NOT NULL)
    ORDER BY sc.product, COALESCE(p.name, s2.name)
  `);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// GET /api/eol — Todos los datos EOL almacenados
// ---------------------------------------------------------------------------
router.get('/eol', async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM eol_status ORDER BY product, cycle'
  );
  res.json(rows);
});

// ---------------------------------------------------------------------------
// POST /api/sync — Dispara sincronización manual
// ---------------------------------------------------------------------------
router.post('/sync', async (_req, res) => {
  try {
    const result = await runFullSync();
    res.json({ status: 'ok', ...result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/sync/status — Último estado de sincronización
// ---------------------------------------------------------------------------
router.get('/sync/status', async (_req, res) => {
  const { rows: [last] } = await pool.query(
    'SELECT * FROM sync_log ORDER BY id DESC LIMIT 1'
  );
  res.json(last || { status: 'never' });
});

// ---------------------------------------------------------------------------
// POST /api/vuln/check — Chequear vulnerabilidades de todo el stack
// ---------------------------------------------------------------------------
router.post('/vuln/check', async (_req, res) => {
  try {
    const results = await syncVulnerabilities();
    res.json({ status: 'ok', checked: results.length, results });
  } catch (err) {
    console.error('[vuln/check] Error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/vuln — Todos los datos de vulnerabilidades almacenados
// ---------------------------------------------------------------------------
router.get('/vuln', async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM vuln_status ORDER BY osv_count DESC, product'
  );
  res.json(rows);
});

// ---------------------------------------------------------------------------
// POST /api/import — Importar JSON de server-audit.sh
// ---------------------------------------------------------------------------
router.post('/import', async (req, res) => {
  const data = req.body;
  const error = validateAudit(data);
  if (error) {
    return res.status(400).json({ status: 'error', message: error });
  }
  try {
    const result = await importAudit(data);
    res.json({ status: 'ok', ...result });
  } catch (err) {
    console.error('[import] Error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/servers/:name — Detalle completo de un servidor
// ---------------------------------------------------------------------------
router.get('/servers/:name', async (req, res) => {
  const { rows: [server] } = await pool.query(
    'SELECT * FROM servers WHERE name = $1',
    [req.params.name]
  );
  if (!server) return res.status(404).json({ error: 'Servidor no encontrado' });

  const [stackRes, servicesRes, portsRes, sslRes, fpmRes, vhostsRes] = await Promise.all([
    pool.query(
      `SELECT sc.*, es.is_eol, es.eol_date, es.latest_version, es.latest_date, es.is_lts, es.is_maintained, es.fetched_at
       FROM stack_components sc
       LEFT JOIN eol_status es ON sc.product = es.product
         AND es.cycle = (SELECT cycle FROM eol_status WHERE product = sc.product ORDER BY fetched_at DESC LIMIT 1)
       WHERE sc.server_id = $1
       ORDER BY sc.category, sc.product`, [server.id]),
    pool.query('SELECT name, state, sub FROM server_services WHERE server_id=$1 ORDER BY name', [server.id]),
    pool.query('SELECT port, process FROM server_ports WHERE server_id=$1 ORDER BY port', [server.id]),
    pool.query('SELECT file, expires, subject FROM server_ssl_certs WHERE server_id=$1', [server.id]),
    pool.query('SELECT pool, pm, max_children FROM server_phpfpm_pools WHERE server_id=$1', [server.id]),
    pool.query('SELECT hostname FROM server_vhosts WHERE server_id=$1 ORDER BY hostname', [server.id]),
  ]);

  res.json({
    ...server,
    stack: stackRes.rows,
    services: servicesRes.rows,
    listening_ports: portsRes.rows,
    ssl_certificates: sslRes.rows,
    php_fpm_pools: fpmRes.rows,
    vhosts: vhostsRes.rows.map(r => r.hostname),
  });
});

// ---------------------------------------------------------------------------
// GET /api/imports — Historial de importaciones (servidores con scan_date)
// ---------------------------------------------------------------------------
router.get('/imports', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT name, ip, os_pretty, environment, scan_date, updated_at
     FROM servers WHERE scan_date IS NOT NULL
     ORDER BY updated_at DESC`
  );
  res.json(rows);
});

// ---------------------------------------------------------------------------
// POST /api/audit/remote — Ejecutar auditoría remota por SSH
//   Body: { host, username, password?, privateKey?, serverName, environment }
//   Autenticación: contraseña O certificado PEM (privateKey)
//   SEGURIDAD: credenciales solo se usan en memoria, NUNCA se almacenan
// ---------------------------------------------------------------------------
router.post('/audit/remote', async (req, res) => {
  const { host, username, password, privateKey, serverName, environment } = req.body;

  // Validaciones
  if (!host || !username) {
    return res.status(400).json({
      status: 'error',
      message: 'Se requieren host y username',
    });
  }
  if (!password && !privateKey) {
    return res.status(400).json({
      status: 'error',
      message: 'Se requiere password o privateKey (certificado PEM)',
    });
  }
  if (!serverName) {
    return res.status(400).json({
      status: 'error',
      message: 'Se requiere serverName',
    });
  }
  if (!environment || !['test', 'demo', 'prod', 'staging'].includes(environment)) {
    return res.status(400).json({
      status: 'error',
      message: 'environment debe ser: test, demo, prod o staging',
    });
  }

  // Sanitizar inputs contra inyección de comandos
  const safePattern = /^[a-zA-Z0-9._-]+$/;
  if (!safePattern.test(serverName)) {
    return res.status(400).json({
      status: 'error',
      message: 'serverName solo puede contener letras, números, puntos, guiones y guiones bajos',
    });
  }

  try {
    const steps = [];
    const result = await runRemoteAudit({
      host,
      username,
      password,       // solo en memoria, se descarta al terminar
      privateKey,     // solo en memoria, se descarta al terminar
      serverName,
      environment,
      onProgress: (step, message) => {
        steps.push({ step, message, time: new Date().toISOString() });
      },
    });
    // Las variables con credenciales salen del scope aquí

    res.json({ status: 'ok', steps, ...result });
  } catch (err) {
    console.error('[audit/remote] Error:', err.message);
    res.json({ status: 'error', message: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/chat — Asistente virtual DevOps (OpenAI)
//   Body: { messages: [{ role: 'user'|'assistant', content: string }] }
// ---------------------------------------------------------------------------
router.post('/chat', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de messages' });
  }

  // Validar que solo contenga roles permitidos
  const allowedRoles = new Set(['user', 'assistant']);
  for (const msg of messages) {
    if (!allowedRoles.has(msg.role) || typeof msg.content !== 'string') {
      return res.status(400).json({ error: 'Cada mensaje debe tener role (user|assistant) y content (string)' });
    }
  }

  // Limitar historial a los últimos 20 mensajes
  const trimmed = messages.slice(-20);

  try {
    const { reply, traces } = await processChat(trimmed);
    res.json({ reply, traces });
  } catch (err) {
    console.error('[chat] Error:', err.message);
    if (err.message.includes('OPENAI_API_KEY')) {
      return res.status(503).json({ error: 'El asistente no está configurado. Falta OPENAI_API_KEY.' });
    }
    res.status(500).json({ error: 'Error procesando el mensaje.' });
  }
});

// ---------------------------------------------------------------------------
// Jenkins Transports
// ---------------------------------------------------------------------------

// GET /api/jenkins/projects — Lista proyectos Jenkins con conteo de jobs
router.get('/jenkins/projects', async (_req, res) => {
  try {
    const rows = await jenkins.getProjects();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jenkins/jobs?project=xxx — Lista jobs (filtro opcional por proyecto)
router.get('/jenkins/jobs', async (req, res) => {
  try {
    const rows = await jenkins.getJobs(req.query.project || null);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jenkins/jobs/:id/status — Estado en tiempo real de un job
router.get('/jenkins/jobs/:id/status', async (req, res) => {
  try {
    const { rows: [job] } = await pool.query(
      'SELECT job_path FROM jenkins_jobs WHERE id = $1', [req.params.id]
    );
    if (!job) return res.status(404).json({ error: 'Job no encontrado' });
    const status = await jenkins.getJobStatus(job.job_path);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jenkins/jobs/:id/builds — Historial de builds en tiempo real
router.get('/jenkins/jobs/:id/builds', async (req, res) => {
  try {
    const { rows: [job] } = await pool.query(
      'SELECT job_path FROM jenkins_jobs WHERE id = $1', [req.params.id]
    );
    if (!job) return res.status(404).json({ error: 'Job no encontrado' });
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    const builds = await jenkins.getBuildHistory(job.job_path, limit);
    res.json(builds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jenkins/jobs/:id/builds/:number/log — Log de consola de un build
router.get('/jenkins/jobs/:id/builds/:number/log', async (req, res) => {
  try {
    const { rows: [job] } = await pool.query(
      'SELECT job_path FROM jenkins_jobs WHERE id = $1', [req.params.id]
    );
    if (!job) return res.status(404).json({ error: 'Job no encontrado' });
    const buildNumber = parseInt(req.params.number, 10);
    if (isNaN(buildNumber)) return res.status(400).json({ error: 'Número de build inválido' });
    const log = await jenkins.getBuildLog(job.job_path, buildNumber);
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jenkins/project/:name/status — Estado de todos los jobs de un proyecto
router.get('/jenkins/project/:name/status', async (req, res) => {
  try {
    const results = await jenkins.getProjectStatus(req.params.name);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jenkins/jobs/:id/trigger — Triggear un build (SOLO desde dashboard)
router.post('/jenkins/jobs/:id/trigger', async (req, res) => {
  try {
    const result = await jenkins.triggerBuild(parseInt(req.params.id, 10));
    res.json(result);
  } catch (err) {
    console.error('[jenkins/trigger] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jenkins/tokens — Metadatos de tokens (NUNCA valores)
router.get('/jenkins/tokens', async (_req, res) => {
  try {
    const rows = await jenkins.getTokens();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================================================================
// Invicti AppSec Inventory (cached in DB)
// ===========================================================================

// GET /api/invicti/status — Check config + cache state
router.get('/invicti/status', async (_req, res) => {
  try {
    const lastSync = await invicti.getLastSync();
    const hasCached = await invicti.hasCachedData();
    res.json({
      configured: invicti.isConfigured(),
      hasCachedData: hasCached,
      lastSync: lastSync ? { at: lastSync.finished_at, assets: lastSync.assets_count, vulns: lastSync.vulns_count, status: lastSync.status } : null,
    });
  } catch (err) {
    res.json({ configured: invicti.isConfigured(), hasCachedData: false, lastSync: null });
  }
});

// POST /api/invicti/sync — Fetch from Invicti API and cache in DB
router.post('/invicti/sync', async (_req, res) => {
  try {
    const result = await invicti.syncToDatabase();
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invicti/summary — From cache
router.get('/invicti/summary', async (_req, res) => {
  try {
    const data = await invicti.getCachedSummary();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invicti/assets — From cache
router.get('/invicti/assets', async (req, res) => {
  try {
    const rows = await invicti.getCachedAssets({
      assetType: req.query.assetType,
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invicti/dashboard — Actionable dashboard data
router.get('/invicti/dashboard', async (req, res) => {
  try {
    const data = await invicti.getCachedDashboard();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invicti/assets/:id/stats — Live from API
router.get('/invicti/assets/:id/stats', async (req, res) => {
  try {
    const data = await invicti.getAssetStats(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invicti/vulnerabilities — From cache
router.get('/invicti/vulnerabilities', async (req, res) => {
  try {
    const rows = await invicti.getCachedVulnerabilities({
      severity: req.query.severity,
      status: req.query.status,
      assetId: req.query.assetId,
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invicti/vulnerabilities/:id — From cache (raw JSON)
router.get('/invicti/vulnerabilities/:id', async (req, res) => {
  try {
    const row = await invicti.getCachedVulnerabilityDetail(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    // Return the raw JSONB for full detail
    res.json(row.raw || row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invicti/cwe/:id — CWE enrichment data (cached from MITRE API)
router.get('/invicti/cwe/:id', async (req, res) => {
  try {
    const data = await invicti.getCweData(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invicti/technologies — Live from API
router.get('/invicti/technologies', async (req, res) => {
  try {
    const data = await invicti.getTechnologies(
      parseInt(req.query.pageSize) || 100,
      parseInt(req.query.pageNumber) || 1
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invicti/environments — Live from API
router.get('/invicti/environments', async (_req, res) => {
  try {
    const data = await invicti.getEnvironments();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invicti/workspaces — Live from API
router.get('/invicti/workspaces', async (_req, res) => {
  try {
    const data = await invicti.getWorkspaces();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
