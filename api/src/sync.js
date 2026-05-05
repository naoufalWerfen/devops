/**
 * Sync — Carga la config de proyectos en la DB y consulta endoflife.date
 */
const { pool } = require('./db');
const { getEolInfo } = require('./endoflife');
const config = require('../config/projects.json');

async function syncServers() {
  const results = [];
  for (const s of config.servers) {
    const { rows } = await pool.query(
      `INSERT INTO servers (name, hostname, ip, os, os_version, cpu, cpu_count, ram_gb, disk_gb, disk_usage_pct, uptime_days, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW())
       ON CONFLICT (name) DO UPDATE SET
         hostname=$2, ip=$3, os=$4, os_version=$5, cpu=$6, cpu_count=$7,
         ram_gb=$8, disk_gb=$9, disk_usage_pct=$10, uptime_days=$11, updated_at=NOW()
       RETURNING id`,
      [s.name, s.hostname, s.ip, s.os, s.os_version, s.cpu, s.cpu_count, s.ram_gb, s.disk_gb, s.disk_usage_pct, s.uptime_days]
    );
    results.push({ name: s.name, id: rows[0].id });
  }
  return results;
}

async function syncProjects(serverMap) {
  const results = [];
  for (const p of config.projects) {
    const serverId = serverMap[p.server] || null;
    const { rows } = await pool.query(
      `INSERT INTO projects (name, label, description, server_id, environment, url, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6, NOW())
       ON CONFLICT (name) DO UPDATE SET
         label=$2, description=$3, server_id=$4, environment=$5, url=$6, updated_at=NOW()
       RETURNING id`,
      [p.name, p.label, p.description, serverId, p.environment, p.url]
    );
    const projectId = rows[0].id;

    // Upsert stack components
    for (const comp of p.stack) {
      await pool.query(
        `INSERT INTO stack_components (project_id, product, product_label, current_version, category, updated_at)
         VALUES ($1,$2,$3,$4,$5, NOW())
         ON CONFLICT (project_id, product) DO UPDATE SET
           product_label=$3, current_version=$4, category=$5, updated_at=NOW()`,
        [projectId, comp.product, comp.label, comp.version, comp.category]
      );
    }
    results.push({ name: p.name, id: projectId, components: p.stack.length });
  }
  return results;
}

async function syncEol() {
  // Recoger todos los componentes únicos
  const { rows: components } = await pool.query(
    'SELECT DISTINCT product, current_version FROM stack_components'
  );

  const results = [];
  for (const comp of components) {
    console.log(`  → endoflife.date: ${comp.product} ${comp.current_version}`);
    const info = await getEolInfo(comp.product, comp.current_version);

    if (info.found) {
      await pool.query(
        `INSERT INTO eol_status (product, cycle, release_date, eol_date, is_eol, latest_version, latest_date, is_lts, eoas_date, is_eoas, is_maintained, fetched_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW())
         ON CONFLICT (product, cycle) DO UPDATE SET
           release_date=$3, eol_date=$4, is_eol=$5, latest_version=$6, latest_date=$7,
           is_lts=$8, eoas_date=$9, is_eoas=$10, is_maintained=$11, fetched_at=NOW()`,
        [info.product, info.cycle, info.releaseDate, info.eolDate, info.isEol, info.latestVersion, info.latestDate, info.isLts, info.eoasDate, info.isEoas, info.isMaintained]
      );
    }

    results.push(info);
    // Rate limit: pequeña pausa entre llamadas
    await new Promise((r) => setTimeout(r, 300));
  }
  return results;
}

async function runFullSync() {
  const { rows: [log] } = await pool.query(
    "INSERT INTO sync_log (status) VALUES ('running') RETURNING id"
  );

  try {
    console.log('[sync] Sincronizando servidores...');
    const servers = await syncServers();
    const serverMap = Object.fromEntries(servers.map((s) => [s.name, s.id]));

    console.log('[sync] Sincronizando proyectos y stack...');
    const projects = await syncProjects(serverMap);

    console.log('[sync] Consultando endoflife.date...');
    const eol = await syncEol();

    const details = { servers: servers.length, projects: projects.length, eol: eol.length };
    await pool.query(
      "UPDATE sync_log SET status='success', finished_at=NOW(), details=$2 WHERE id=$1",
      [log.id, JSON.stringify(details)]
    );
    console.log('[sync] Completado:', details);
    return details;
  } catch (err) {
    await pool.query(
      "UPDATE sync_log SET status='error', finished_at=NOW(), details=$2 WHERE id=$1",
      [log.id, JSON.stringify({ error: err.message })]
    );
    throw err;
  }
}

module.exports = { runFullSync };
