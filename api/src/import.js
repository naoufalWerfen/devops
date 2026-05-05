/**
 * Importación de JSON generado por server-audit.sh
 */
const { pool } = require('./db');
const { getEolInfo } = require('./endoflife');

/**
 * Valida la estructura mínima del JSON de auditoría
 */
function validateAudit(data) {
  if (!data || typeof data !== 'object') {
    return 'JSON inválido';
  }
  if (!data.server || !data.server.name) {
    return 'Falta server.name — usa: bash server-audit.sh -n NOMBRE_SERVIDOR';
  }
  if (!data.server.ip) {
    return 'Falta server.ip';
  }
  if (!Array.isArray(data.stack)) {
    return 'Falta el array stack[]';
  }
  return null;
}

/**
 * Importa un JSON de server-audit.sh en la base de datos.
 * Upsert: si el servidor ya existe, actualiza sus datos.
 */
async function importAudit(data) {
  const s = data.server;
  const hw = data.hardware || {};
  const up = data.uptime || {};

  // 1. Upsert servidor
  const { rows: [server] } = await pool.query(
    `INSERT INTO servers (
       name, hostname, fqdn, ip, os, os_version, os_id, os_pretty,
       kernel, arch, cpu, cpu_count,
       ram_gb, ram_used_gb, ram_available_gb,
       swap_total_gb, swap_used_gb, swap_usage_pct,
       disk_gb, disk_used_gb, disk_usage_pct,
       uptime_days, environment, scan_date, raw_json, updated_at
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
       $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25, NOW()
     )
     ON CONFLICT (name) DO UPDATE SET
       hostname=$2, fqdn=$3, ip=$4, os=$5, os_version=$6, os_id=$7, os_pretty=$8,
       kernel=$9, arch=$10, cpu=$11, cpu_count=$12,
       ram_gb=$13, ram_used_gb=$14, ram_available_gb=$15,
       swap_total_gb=$16, swap_used_gb=$17, swap_usage_pct=$18,
       disk_gb=$19, disk_used_gb=$20, disk_usage_pct=$21,
       uptime_days=$22, environment=$23, scan_date=$24, raw_json=$25, updated_at=NOW()
     RETURNING id`,
    [
      s.name, s.hostname || s.name, s.fqdn || null, s.ip,
      s.os || null, s.os_version || null, s.os_id || null, s.os_pretty || null,
      s.kernel || null, s.arch || null,
      hw.cpu || null, hw.cpu_count || 1,
      hw.ram_total_gb || null, hw.ram_used_gb || null, hw.ram_available_gb || null,
      hw.swap_total_gb || null, hw.swap_used_gb || null, hw.swap_usage_pct || null,
      hw.disk_total_gb || null, hw.disk_used_gb || null, hw.disk_usage_pct || null,
      up.days || null, s.environment || 'test',
      data.scan_date || new Date().toISOString(),
      JSON.stringify(data),
    ]
  );

  const serverId = server.id;

  // 2. Stack components (vinculados al servidor)
  let stackCount = 0;
  for (const comp of data.stack || []) {
    if (!comp.product || !comp.version) continue;
    await pool.query(
      `INSERT INTO stack_components (server_id, project_id, product, product_label, current_version, category, path, updated_at)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (server_id, product) WHERE server_id IS NOT NULL
       DO UPDATE SET product_label=$3, current_version=$4, category=$5, path=$6, updated_at=NOW()`,
      [serverId, comp.product, comp.label || comp.product, comp.version, comp.category || null, comp.path || null]
    );
    stackCount++;
  }

  // 3. Servicios
  await pool.query('DELETE FROM server_services WHERE server_id=$1', [serverId]);
  for (const svc of data.services || []) {
    if (!svc.name) continue;
    await pool.query(
      `INSERT INTO server_services (server_id, name, state, sub) VALUES ($1,$2,$3,$4)
       ON CONFLICT (server_id, name) DO UPDATE SET state=$3, sub=$4`,
      [serverId, svc.name, svc.state || null, svc.sub || null]
    );
  }

  // 4. Puertos
  await pool.query('DELETE FROM server_ports WHERE server_id=$1', [serverId]);
  for (const p of data.listening_ports || []) {
    if (!p.port) continue;
    await pool.query(
      `INSERT INTO server_ports (server_id, port, process) VALUES ($1,$2,$3)
       ON CONFLICT (server_id, port) DO UPDATE SET process=$3`,
      [serverId, p.port, p.process || null]
    );
  }

  // 5. SSL
  await pool.query('DELETE FROM server_ssl_certs WHERE server_id=$1', [serverId]);
  for (const cert of data.ssl_certificates || []) {
    if (!cert.file) continue;
    await pool.query(
      `INSERT INTO server_ssl_certs (server_id, file, expires, subject) VALUES ($1,$2,$3,$4)
       ON CONFLICT (server_id, file) DO UPDATE SET expires=$3, subject=$4`,
      [serverId, cert.file, cert.expires || null, cert.subject || null]
    );
  }

  // 6. PHP-FPM
  await pool.query('DELETE FROM server_phpfpm_pools WHERE server_id=$1', [serverId]);
  for (const fpm of data.php_fpm_pools || []) {
    if (!fpm.pool) continue;
    await pool.query(
      `INSERT INTO server_phpfpm_pools (server_id, pool, pm, max_children) VALUES ($1,$2,$3,$4)
       ON CONFLICT (server_id, pool) DO UPDATE SET pm=$3, max_children=$4`,
      [serverId, fpm.pool, fpm.pm || null, fpm.max_children || null]
    );
  }

  // 7. Vhosts
  await pool.query('DELETE FROM server_vhosts WHERE server_id=$1', [serverId]);
  for (const vh of data.vhosts || []) {
    if (!vh) continue;
    await pool.query(
      `INSERT INTO server_vhosts (server_id, hostname) VALUES ($1,$2)
       ON CONFLICT (server_id, hostname) DO NOTHING`,
      [serverId, vh]
    );
  }

  // 8. Consultar EOL para cada componente del stack
  console.log(`[import] Consultando endoflife.date para ${stackCount} componentes...`);
  let eolCount = 0;
  for (const comp of data.stack || []) {
    if (!comp.product || !comp.version) continue;
    // Solo consultar productos relevantes (no tools)
    if (comp.category === 'tool') continue;

    const info = await getEolInfo(comp.product, comp.version);
    if (info.found) {
      await pool.query(
        `INSERT INTO eol_status (product, cycle, release_date, eol_date, is_eol, latest_version, latest_date, is_lts, eoas_date, is_eoas, is_maintained, fetched_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW())
         ON CONFLICT (product, cycle) DO UPDATE SET
           release_date=$3, eol_date=$4, is_eol=$5, latest_version=$6, latest_date=$7,
           is_lts=$8, eoas_date=$9, is_eoas=$10, is_maintained=$11, fetched_at=NOW()`,
        [info.product, info.cycle, info.releaseDate, info.eolDate, info.isEol, info.latestVersion, info.latestDate, info.isLts, info.eoasDate, info.isEoas, info.isMaintained]
      );
      eolCount++;
    }
    // Rate limit
    await new Promise((r) => setTimeout(r, 300));
  }

  return {
    server: s.name,
    ip: s.ip,
    environment: s.environment || 'test',
    stack: stackCount,
    services: (data.services || []).length,
    ports: (data.listening_ports || []).length,
    ssl: (data.ssl_certificates || []).length,
    phpfpm: (data.php_fpm_pools || []).length,
    vhosts: (data.vhosts || []).length,
    eol_checked: eolCount,
  };
}

module.exports = { validateAudit, importAudit };
