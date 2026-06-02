/**
 * jenkins.js — Cliente Jenkins REST API
 *
 * Usa Basic Auth con los tokens de .env para consultar y triggear builds.
 * Los tokens se leen de las variables de entorno:
 *   JENKINS_API_TOKEN_SERVICENOW  → usuario: servicenow
 *   JENKINS_API_TOKEN_IT_QA       → usuario: it_qa
 *   JENKINS_BASE_URL              → https://jenkins.werfen.com
 */

const { pool } = require('./db');

const JENKINS_BASE = (process.env.JENKINS_BASE_URL || 'https://jenkins.werfen.com').replace(/\/+$/, '');

// ── Auth helpers ────────────────────────────────────────────────────────────

const TOKENS = {
  servicenow: process.env.JENKINS_API_TOKEN_SERVICENOW,
  it_qa:      process.env.JENKINS_API_TOKEN_IT_QA,
};

function basicAuth(user) {
  const token = TOKENS[user];
  if (!token) throw new Error(`Token no configurado para usuario: ${user}`);
  return 'Basic ' + Buffer.from(`${user}:${token}`).toString('base64');
}

// Default auth — usa it_qa como principal
function defaultAuth() {
  if (TOKENS.it_qa) return basicAuth('it_qa');
  if (TOKENS.servicenow) return basicAuth('servicenow');
  throw new Error('No hay tokens Jenkins configurados');
}

// ── REST helpers ────────────────────────────────────────────────────────────

/**
 * GET a un endpoint Jenkins JSON API
 */
async function jenkinsGet(jobPath, apiSuffix = 'api/json') {
  const url = `${JENKINS_BASE}/${jobPath.replace(/^\/+/, '')}/${apiSuffix}`;
  const resp = await fetch(url, {
    headers: { Authorization: defaultAuth() },
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Jenkins ${resp.status}: ${text.slice(0, 200)}`);
  }
  return resp.json();
}

// ── Queries de BD ───────────────────────────────────────────────────────────

/**
 * Lista todos los proyectos Jenkins con conteo de jobs
 */
async function getProjects() {
  const { rows } = await pool.query(`
    SELECT jp.id, jp.name, COUNT(jj.id) AS job_count
    FROM jenkins_projects jp
    LEFT JOIN jenkins_jobs jj ON jj.project_id = jp.id AND jj.is_active = true
    GROUP BY jp.id, jp.name
    ORDER BY jp.name
  `);
  return rows;
}

/**
 * Lista jobs de un proyecto (o todos)
 */
async function getJobs(projectName) {
  let query = `
    SELECT jj.id, jj.app_name, jj.app_token_name, jj.job_path, jj.build_type,
           jj.deploy_type, jj.sap_id, jj.requires_cab, jj.result_url, jj.transport_url,
           jj.is_active, jp.name AS project_name
    FROM jenkins_jobs jj
    JOIN jenkins_projects jp ON jj.project_id = jp.id
    WHERE jj.is_active = true
  `;
  const params = [];
  if (projectName) {
    query += ' AND LOWER(jp.name) = LOWER($1)';
    params.push(projectName);
  }
  query += ' ORDER BY jp.name, jj.app_name';
  const { rows } = await pool.query(query, params);
  return rows;
}

/**
 * Historial de builds almacenados en BD
 */
async function getBuilds(jobId, limit = 20) {
  const { rows } = await pool.query(`
    SELECT jb.*, jj.app_name, jp.name AS project_name
    FROM jenkins_builds jb
    JOIN jenkins_jobs jj ON jb.job_id = jj.id
    JOIN jenkins_projects jp ON jj.project_id = jp.id
    WHERE jb.job_id = $1
    ORDER BY jb.build_number DESC
    LIMIT $2
  `, [jobId, limit]);
  return rows;
}

// ── Consultas en tiempo real a Jenkins ──────────────────────────────────────

/**
 * Obtener info del último build de un job (en tiempo real desde Jenkins)
 */
async function getLastBuild(jobPath) {
  try {
    const data = await jenkinsGet(jobPath, 'lastBuild/api/json');
    return {
      number: data.number,
      result: data.result,          // SUCCESS, FAILURE, UNSTABLE, ABORTED, null(building)
      building: data.building,
      timestamp: data.timestamp,
      duration: data.duration,
      displayName: data.displayName,
      url: data.url,
    };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Obtener historial de builds recientes de un job (en tiempo real)
 */
async function getBuildHistory(jobPath, limit = 10) {
  try {
    const data = await jenkinsGet(
      jobPath,
      `api/json?tree=builds[number,result,timestamp,duration,building,displayName]{0,${limit}}`
    );
    return (data.builds || []).map(b => ({
      number: b.number,
      result: b.result,
      building: b.building,
      timestamp: b.timestamp,
      duration: b.duration,
      displayName: b.displayName,
    }));
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Obtener estado general del job (health, last build, color)
 */
async function getJobStatus(jobPath) {
  try {
    const data = await jenkinsGet(
      jobPath,
      'api/json?tree=name,color,lastBuild[number,result,timestamp,duration,building],healthReport[description,score]'
    );
    return {
      name: data.name,
      color: data.color,    // blue=ok, red=fail, yellow=unstable, disabled, notbuilt, blue_anime=building
      lastBuild: data.lastBuild,
      healthReport: data.healthReport,
    };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Obtener estado de TODOS los jobs de un proyecto (batch)
 */
async function getProjectStatus(projectName) {
  const jobs = await getJobs(projectName);
  const results = await Promise.allSettled(
    jobs.map(async (job) => {
      const status = await getJobStatus(job.job_path);
      return { ...job, status };
    })
  );
  return results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message });
}

// ── Trigger build (SOLO desde dashboard) ────────────────────────────────────

/**
 * Triggerea un build en Jenkins.
 * IMPORTANTE: Esta función SOLO debe ser invocada desde rutas del dashboard,
 * NUNCA desde el chatbot.
 */
async function triggerBuild(jobId) {
  // Buscar job en BD
  const { rows: [job] } = await pool.query(
    'SELECT * FROM jenkins_jobs WHERE id = $1 AND is_active = true',
    [jobId]
  );
  if (!job) throw new Error(`Job ${jobId} no encontrado o inactivo`);
  if (!job.transport_url) throw new Error(`Job ${jobId} no tiene URL de transport`);

  // Triggear usando la URL del transport (incluye el build token)
  const resp = await fetch(job.transport_url, {
    method: 'POST',
    headers: { Authorization: defaultAuth() },
    signal: AbortSignal.timeout(15000),
  });

  if (!resp.ok && resp.status !== 201) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Jenkins trigger ${resp.status}: ${text.slice(0, 200)}`);
  }

  // Guardar en historial
  await pool.query(
    `INSERT INTO jenkins_builds (job_id, status, triggered_by, started_at)
     VALUES ($1, 'TRIGGERED', 'dashboard', NOW())`,
    [jobId]
  );

  return {
    success: true,
    job: job.app_name,
    project: job.project_id,
    message: `Build triggered para ${job.app_name}`,
  };
}

/**
 * Info de tokens (metadatos, NUNCA el valor real)
 */
async function getTokens() {
  const { rows } = await pool.query(
    'SELECT id, token_name, env_var, integration, published_at, expires_at, is_active FROM jenkins_tokens ORDER BY token_name'
  );
  return rows;
}

/**
 * Obtener el log de consola de un build específico.
 * Extrae las secciones relevantes: errores, excepciones y las últimas líneas.
 */
async function getBuildLog(jobPath, buildNumber) {
  const url = `${JENKINS_BASE}/${jobPath.replace(/^\/+/, '')}/${buildNumber}/consoleText`;
  const resp = await fetch(url, {
    headers: { Authorization: defaultAuth() },
    signal: AbortSignal.timeout(30000),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Jenkins ${resp.status}: ${text.slice(0, 200)}`);
  }
  const fullLog = await resp.text();
  const lines = fullLog.split('\n');

  // Extract error-relevant lines with surrounding context
  const ERROR_PATTERNS = /\b(error|exception|fatal|failed|failure|abort|cannot|unable|denied|refused|timeout|timed\s*out|exit\s+code\s+[1-9]|non-zero|npm\s+ERR|FATAL|BUILD\s+FAIL|stderr|panic|segfault|killed|rejected|not\s+found|no\s+such|permission)/i;
  const STAGE_PATTERN = /^\[Pipeline\]|^Stage /i;

  const errorSections = [];
  const contextRadius = 3; // lines before/after each error
  const usedLines = new Set();

  lines.forEach((line, idx) => {
    if (ERROR_PATTERNS.test(line)) {
      const start = Math.max(0, idx - contextRadius);
      const end = Math.min(lines.length - 1, idx + contextRadius);
      for (let j = start; j <= end; j++) usedLines.add(j);
    }
  });

  // Build error sections as contiguous blocks
  if (usedLines.size > 0) {
    const sorted = [...usedLines].sort((a, b) => a - b);
    let blockStart = sorted[0];
    let prev = sorted[0];
    for (let i = 1; i <= sorted.length; i++) {
      const curr = sorted[i];
      if (curr !== prev + 1 || i === sorted.length) {
        errorSections.push({
          fromLine: blockStart + 1,
          toLine: prev + 1,
          text: lines.slice(blockStart, prev + 1).join('\n'),
        });
        blockStart = curr;
      }
      prev = curr;
    }
  }

  // Also collect stage transitions for context
  const stages = [];
  lines.forEach((line, idx) => {
    if (STAGE_PATTERN.test(line) && line.trim().length > 5) {
      stages.push({ line: idx + 1, text: line.trim() });
    }
  });

  // Always include last 40 lines (final result summary)
  const tailLines = 40;
  const tail = lines.slice(-tailLines).join('\n');

  // Cap error sections to avoid sending too much data
  const maxErrorChars = 6000;
  let errorText = '';
  for (const section of errorSections) {
    const block = `--- líneas ${section.fromLine}-${section.toLine} ---\n${section.text}\n`;
    if (errorText.length + block.length > maxErrorChars) {
      errorText += `\n[... ${errorSections.length - errorSections.indexOf(section)} secciones más omitidas ...]\n`;
      break;
    }
    errorText += block;
  }

  return {
    buildNumber,
    totalLines: lines.length,
    errorSectionsCount: errorSections.length,
    errorLines: errorText || '(no se detectaron líneas de error explícitas)',
    stages: stages.slice(-20), // last 20 stage transitions
    tail,
    consoleUrl: `${JENKINS_BASE}/${jobPath.replace(/^\/+/, '')}/${buildNumber}/console`,
  };
}

module.exports = {
  getProjects,
  getJobs,
  getBuilds,
  getLastBuild,
  getBuildHistory,
  getBuildLog,
  getJobStatus,
  getProjectStatus,
  triggerBuild,
  getTokens,
  jenkinsGet,
};
