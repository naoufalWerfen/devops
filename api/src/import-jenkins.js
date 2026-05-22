/**
 * import-jenkins.js — Importar datos de Jenkins desde el Excel "QA Transports URLs.xlsx"
 *
 * Uso: node src/import-jenkins.js [path-to-xlsx]
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { pool } = require('./db');
const XLSX = require('xlsx');
const path = require('path');

const DEFAULT_FILE = path.resolve(__dirname, '../../QA Transports URLs.xlsx');

async function importJenkinsData(filePath) {
  const wb = XLSX.readFile(filePath);

  // ── 1. Importar jobs desde la hoja "Transports" ────────────────────────
  const ws = wb.Sheets['Transports'];
  if (!ws) throw new Error('Hoja "Transports" no encontrada');

  const rows = XLSX.utils.sheet_to_json(ws, { range: 3 }); // headers en fila 4 (0-indexed: 3)

  console.log(`📋 Leídas ${rows.length} filas de la hoja Transports`);

  // Extraer proyectos únicos
  const projectNames = [...new Set(rows.map(r => r['Project']).filter(Boolean))];
  console.log(`📁 Proyectos: ${projectNames.join(', ')}`);

  // Insertar proyectos
  const projectMap = {};
  for (const name of projectNames) {
    const { rows: [proj] } = await pool.query(
      `INSERT INTO jenkins_projects (name)
       VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = $1
       RETURNING id`,
      [name]
    );
    projectMap[name] = proj.id;
  }
  console.log(`✅ ${projectNames.length} proyectos insertados`);

  // Insertar jobs
  let jobCount = 0;
  for (const row of rows) {
    const projectName = row['Project'];
    if (!projectName || !row['App']) continue;

    const projectId = projectMap[projectName];
    const appName = row['App'] || '';
    const appTokenName = row['App Token'] || '';
    const jobPath = row['Jenkins job path'] || '';
    const buildType = row['WithParams?'] || 'build';
    const sapId = row['SAP ID'] ? parseInt(row['SAP ID'], 10) : null;
    const cab = row['CAB'];
    const requiresCab = cab === 1 || cab === '1';
    const transportUrl = row['JENKINS_TRANSPORT'] || '';
    const resultUrl = row['JENKINS_RESULT'] || '';

    // Detectar deploy_type del nombre
    let deployType = null;
    const lower = appName.toLowerCase();
    if (lower.includes('hotfix')) deployType = 'hotfix';
    else if (lower.includes('release')) deployType = 'release';
    else if (lower.includes('legacy')) deployType = 'legacy';

    await pool.query(
      `INSERT INTO jenkins_jobs
         (project_id, app_name, app_token_name, job_path, build_type,
          deploy_type, sap_id, requires_cab, result_url, transport_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT DO NOTHING`,
      [projectId, appName, appTokenName, jobPath, buildType,
       deployType, sapId, requiresCab, resultUrl, transportUrl]
    );
    jobCount++;
  }
  console.log(`✅ ${jobCount} jobs insertados`);

  // ── 2. Importar metadatos de tokens ──────────────────────────────────
  // Leer fechas de tokens de las filas de cabecera (filas 1-3)
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
  // Fila 3 (index 2) tiene la fecha de publicación y expiración
  let publishedAt = null;
  let expiresAt = null;
  if (rawData[2]) {
    for (const cell of rawData[2]) {
      if (cell instanceof Date) {
        if (!publishedAt) publishedAt = cell;
        else expiresAt = cell;
      } else if (typeof cell === 'string') {
        const dateMatch = cell.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateMatch) {
          const d = new Date(`${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`);
          if (!publishedAt) publishedAt = d;
          else expiresAt = d;
        }
      }
    }
  }

  const tokens = [
    { name: 'servicenow', envVar: 'JENKINS_API_TOKEN_SERVICENOW', integration: 'SNOW' },
    { name: 'it_qa', envVar: 'JENKINS_API_TOKEN_IT_QA', integration: 'SAP' },
  ];

  for (const t of tokens) {
    await pool.query(
      `INSERT INTO jenkins_tokens (token_name, env_var, integration, published_at, expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT DO NOTHING`,
      [t.name, t.envVar, t.integration, publishedAt, expiresAt]
    );
  }
  console.log(`✅ ${tokens.length} tokens registrados (metadatos)`);

  return { projects: projectNames.length, jobs: jobCount, tokens: tokens.length };
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const file = process.argv[2] || DEFAULT_FILE;
  console.log(`\n🔧 Importando Jenkins desde: ${file}\n`);
  importJenkinsData(file)
    .then(result => {
      console.log('\n✅ Importación completada:', result);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = { importJenkinsData };
