/**
 * chat.js — Asistente virtual DevOps con OpenAI function calling
 *
 * Herramientas disponibles para la IA:
 *  - query_servers:       listar todos los servidores
 *  - get_server_detail:   detalle completo de un servidor (stack, servicios, puertos, SSL, vhosts)
 *  - query_projects:      listar proyectos con info de servidor
 *  - query_stack:         stack tecnológico global con estado EOL + vulnerabilidades
 *  - query_vulnerabilities: datos de vulnerabilidades almacenados
 *  - check_endoflife:     consultar endoflife.date en tiempo real para un producto
 */

const OpenAI = require('openai');
const { pool } = require('./db');
const { getEolInfo } = require('./endoflife');
const { checkVulnerabilities, PRODUCT_MAP } = require('./vulnerability');
const jenkins = require('./jenkins');
const fs = require('fs');
const path = require('path');

// ── Log file ────────────────────────────────────────────────────────────────

const LOG_FILE = path.resolve(__dirname, '../../logs/chat.log');

// Asegurar que el directorio existe
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// ── OpenAI client (lazy init) ───────────────────────────────────────────────

let openai = null;

function getClient() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

// ── System prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres el asistente virtual del Dashboard DevOps de Werfen.
Tu trabajo es ayudar a los usuarios a entender el estado de sus servidores, el stack tecnológico, las versiones EOL (End of Life), las vulnerabilidades detectadas y el estado de los deploys en Jenkins.

## Infraestructura gestionada

Servidores:
- **WEBAPPSPROD** (10.120.204.93) — SLES 15 SP6, 1 vCPU, 15 GB RAM, 146 GB disco. Aloja MyOrders (Symfony 6.1 + PHP 8.1 + Nginx + MariaDB).
- **ACCRIVATICKETSTEST** (10.120.204.45) — SLES 15 SP1, 1 vCPU, 7.5 GB RAM. Aloja Accriva Tickets (React SPA + Node.js 8 + Nginx).
- **DISTRIBUTORSPORTALTEST** (10.120.204.25) — SLES 15 SP6, 1 vCPU, 31 GB RAM, 38 GB disco. Aloja Distributors Portal (Drupal 9 + PHP 7.4 + Apache + MariaDB).

Proyectos:
- **MyOrders** — Symfony 6.1 monorepo con 8 sub-aplicaciones (orders, backoffice, tracking, RGA, vendors, caseportal, monthlyreport, middleware ADP). Entorno: demo. URL: https://myorders.werfen.com
- **Accriva Tickets** — Portal de tickets de reparación para distribuidores Accriva. React SPA + Node.js/Express API → SAP. Entorno: test.
- **Distributors Portal** — Portal B2B e-business (WLEB). Drupal 9 CMS con integración SAP ERP. Entorno: test.

Jenkins — Proyectos de transport:
- Webs, WeNet, Welisten, myOrders, Distributors Portal, Accriva Tickets, Customer Portal, Vendors Portal, CasePortal, WeLearn, WerfenTower, WerfenDocs, WerfenTouch, Werfen Academy, myClaims, TicketLine, IVD Market Watch, MonthlyReport.
- Cada proyecto tiene jobs de tipo **release** y **hotfix**. Algunos tienen variantes China (CN).
- Los tokens de autenticación se gestionan vía variables de entorno (JENKINS_API_TOKEN_SERVICENOW, JENKINS_API_TOKEN_IT_QA).

## Fuentes de datos

- **Base de datos PostgreSQL**: servidores (hardware, OS, disco, RAM, uptime, kernel), proyectos, stack tecnológico, servicios activos, puertos, certificados SSL, vhosts, PHP-FPM pools, estados EOL y vulnerabilidades.
- **endoflife.date API**: estado EOL en tiempo real de cualquier producto.
- **OSV.dev + Snyk**: vulnerabilidades por producto/versión.
- **Jenkins REST API**: estado de builds, historial, health de jobs en tiempo real.

## Reglas de respuesta

1. Responde siempre en **español**.
2. Sé conciso pero informativo. Prioriza claridad sobre brevedad.
3. **Usa tablas markdown** cuando presentes datos comparativos o listados. Incluye siempre una fila de encabezado clara.
4. Cuando presentes estado EOL:
   - Indica claramente si **ya está en EOL** (con fecha), si está próximo, o si está soportado.
   - Muestra la versión actual vs la **última versión disponible**.
   - Si hay upgrade recomendado, indícalo.
5. Para vulnerabilidades, muestra siempre la severidad con este formato: 🔴 Crítica, 🟠 Alta, 🟡 Media, 🟢 Baja.
6. Para servidores, al mostrar uso de recursos usa indicadores visuales: ✅ OK (<70%), ⚠️ Atención (70-85%), 🔴 Crítico (>85%).
7. Para Jenkins: puedes **consultar** proyectos, jobs, estados y builds. **NUNCA puedes triggear ni lanzar deploys.** Si el usuario pide hacer un deploy, indícale que debe hacerlo desde la página de Jenkins Transports del dashboard.
8. **Logs de builds fallidos**: Cuando el usuario pregunte por qué falló un build, usa la herramienta "query_jenkins_build_log" para obtener el log. En tu respuesta:
   - Muestra las líneas de error **exactas** del log en un bloque de código.
   - Identifica la **causa raíz** del fallo (error de compilación, test fallido, timeout, error de red, permisos, etc.).
   - Indica en qué **stage/etapa** del pipeline ocurrió el fallo.
   - Sugiere **posibles soluciones** concretas basadas en el error.
   - Incluye siempre el enlace al log completo en Jenkins.
9. Si no tienes datos suficientes, usa las herramientas disponibles para consultarlos antes de responder.
10. Si te preguntan algo fuera de tu dominio (servidores, stack, seguridad, DevOps, Jenkins), indica amablemente que solo puedes ayudar con temas de infraestructura y DevOps.
11. Cuando no haya datos para una consulta, dilo claramente en vez de inventar.
11. Cuando el usuario haga una pregunta general como "¿cómo están los servidores?" o "dame un resumen", consulta TODOS los datos relevantes y presenta un resumen ejecutivo con las métricas más importantes.`;

// ── Tool definitions ────────────────────────────────────────────────────────

const tools = [
  {
    type: 'function',
    function: {
      name: 'query_servers',
      description: 'Lista todos los servidores con su información básica: nombre, IP, OS, CPU, RAM, disco, uptime.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_server_detail',
      description: 'Obtiene el detalle completo de un servidor: hardware, stack tecnológico con estado EOL, servicios activos, puertos abiertos, certificados SSL, PHP-FPM pools y vhosts.',
      parameters: {
        type: 'object',
        properties: {
          server_name: { type: 'string', description: 'Nombre del servidor (ej: DISTRIBUTORSPORTALTEST, ACCRIVATICKETSTEST, WEBAPPSPROD)' },
        },
        required: ['server_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_projects',
      description: 'Lista todos los proyectos/aplicaciones con su servidor asociado, entorno y URL.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_stack',
      description: 'Obtiene el stack tecnológico global de todos los proyectos/servidores con estado EOL (End of Life), versión actual vs última disponible, y datos de vulnerabilidades.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_vulnerabilities',
      description: 'Obtiene todos los datos de vulnerabilidades almacenados: conteo por severidad (OSV.dev), datos de Snyk, y recomendación de upgrade.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_endoflife',
      description: 'Consulta endoflife.date en tiempo real para obtener el estado EOL de un producto y versión específicos. Usar cuando el usuario pregunte por una tecnología que quizás no está en la BD.',
      parameters: {
        type: 'object',
        properties: {
          product: { type: 'string', description: 'Nombre del producto en endoflife.date (ej: nodejs, php, nginx, mariadb, symfony, react, drupal, postgresql, apache, sles)' },
          version: { type: 'string', description: 'Versión a consultar (ej: 8.1, 16, 21, 6.1)' },
        },
        required: ['product', 'version'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_vulnerabilities',
      description: `Consulta en tiempo real las vulnerabilidades de un producto y versión usando OSV.dev (público) y Snyk (si configurado). Devuelve conteo por severidad (critical, high, medium, low) y recomendación de upgrade. Productos soportados: ${Object.keys(PRODUCT_MAP).join(', ')}. Usar cuando el usuario pregunte por vulnerabilidades, seguridad o CVEs de un producto concreto.`,
      parameters: {
        type: 'object',
        properties: {
          product: { type: 'string', description: `Nombre del producto (ej: ${Object.keys(PRODUCT_MAP).slice(0, 10).join(', ')})` },
          version: { type: 'string', description: 'Versión a consultar (ej: 8.1, 9.4.8, 7.4.30)' },
        },
        required: ['product', 'version'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_jenkins_projects',
      description: 'Lista todos los proyectos Jenkins con el número de transport jobs configurados.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_jenkins_jobs',
      description: 'Lista los transport jobs de Jenkins, opcionalmente filtrados por proyecto. Muestra tipo de deploy (release/hotfix), si requiere CAB, SAP ID, etc.',
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Nombre del proyecto para filtrar (ej: myOrders, Webs, Accriva Tickets). Si no se indica, devuelve todos.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_jenkins_job_status',
      description: 'Consulta en tiempo real el estado de un job de Jenkins específico: último build, resultado (SUCCESS/FAILURE/BUILDING), health report.',
      parameters: {
        type: 'object',
        properties: {
          job_id: { type: 'number', description: 'ID del job en la base de datos.' },
        },
        required: ['job_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_jenkins_project_status',
      description: 'Consulta en tiempo real el estado de TODOS los jobs de un proyecto Jenkins. Útil para ver un resumen completo del proyecto.',
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Nombre del proyecto (ej: myOrders, Distributors Portal)' },
        },
        required: ['project'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_jenkins_build_history',
      description: 'Obtiene el historial reciente de builds de un job de Jenkins (últimos N builds con resultado, fecha y duración).',
      parameters: {
        type: 'object',
        properties: {
          job_id: { type: 'number', description: 'ID del job en la base de datos.' },
          limit: { type: 'number', description: 'Número de builds a devolver (máx 20, default 10).' },
        },
        required: ['job_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_jenkins_build_log',
      description: 'Obtiene el log de consola de un build de Jenkins. Extrae automáticamente las líneas de error (excepciones, fallos, exit codes), las etapas del pipeline y las últimas líneas del log. SIEMPRE usa esta herramienta cuando el usuario pregunte por qué falló un build — muestra las líneas de error exactas en tu respuesta.',
      parameters: {
        type: 'object',
        properties: {
          job_id: { type: 'number', description: 'ID del job en la base de datos.' },
          build_number: { type: 'number', description: 'Número del build a consultar (ej: 1, 2, 44). Si no se indica, se consulta el último build.' },
        },
        required: ['job_id'],
      },
    },
  },
];

// ── Tool handlers ───────────────────────────────────────────────────────────

async function handleToolCall(name, args) {
  switch (name) {
    case 'query_servers': {
      const { rows } = await pool.query(
        `SELECT name, hostname, ip, os, os_version, os_pretty, kernel,
                cpu, cpu_count, ram_gb, ram_used_gb, ram_available_gb,
                swap_total_gb, swap_used_gb, swap_usage_pct,
                disk_gb, disk_used_gb, disk_usage_pct, uptime_days,
                environment, scan_date
         FROM servers ORDER BY name`
      );
      return rows;
    }

    case 'get_server_detail': {
      const { rows: [server] } = await pool.query(
        'SELECT * FROM servers WHERE UPPER(name) = UPPER($1)',
        [args.server_name]
      );
      if (!server) return { error: `Servidor "${args.server_name}" no encontrado` };

      const [stackRes, servicesRes, portsRes, sslRes, fpmRes, vhostsRes] = await Promise.all([
        pool.query(
          `SELECT sc.product, sc.product_label, sc.current_version, sc.category, sc.path,
                  es.is_eol, es.eol_date, es.latest_version, es.latest_date,
                  es.is_lts, es.is_maintained, es.is_eoas, es.eoas_date,
                  vs.osv_count, vs.osv_critical, vs.osv_high, vs.osv_medium, vs.osv_low,
                  vs.snyk_total, vs.snyk_critical, vs.snyk_high, vs.snyk_upgrade
           FROM stack_components sc
           LEFT JOIN eol_status es ON sc.product = es.product
             AND es.cycle = (SELECT cycle FROM eol_status WHERE product = sc.product ORDER BY fetched_at DESC LIMIT 1)
           LEFT JOIN vuln_status vs ON vs.product = sc.product AND vs.version = sc.current_version
           WHERE sc.server_id = $1
           ORDER BY sc.category, sc.product`, [server.id]),
        pool.query('SELECT name, state, sub FROM server_services WHERE server_id=$1 ORDER BY name', [server.id]),
        pool.query('SELECT port, process FROM server_ports WHERE server_id=$1 ORDER BY port', [server.id]),
        pool.query('SELECT file, expires, subject FROM server_ssl_certs WHERE server_id=$1', [server.id]),
        pool.query('SELECT pool, pm, max_children FROM server_phpfpm_pools WHERE server_id=$1', [server.id]),
        pool.query('SELECT hostname FROM server_vhosts WHERE server_id=$1 ORDER BY hostname', [server.id]),
      ]);

      const { raw_json, ...serverClean } = server;
      return {
        ...serverClean,
        stack: stackRes.rows,
        services: servicesRes.rows,
        listening_ports: portsRes.rows,
        ssl_certificates: sslRes.rows,
        php_fpm_pools: fpmRes.rows,
        vhosts: vhostsRes.rows.map(r => r.hostname),
      };
    }

    case 'query_projects': {
      const { rows } = await pool.query(`
        SELECT p.name, p.label, p.description, p.environment, p.url,
               s.name AS server_name, s.ip, s.os
        FROM projects p
        LEFT JOIN servers s ON p.server_id = s.id
        ORDER BY p.name
      `);
      return rows;
    }

    case 'query_stack': {
      const { rows } = await pool.query(`
        SELECT sc.product, sc.product_label, sc.current_version, sc.category,
               COALESCE(p.name, s2.name) AS source_name,
               es.is_eol, es.eol_date, es.latest_version, es.latest_date,
               es.is_lts, es.is_eoas, es.eoas_date, es.is_maintained,
               vs.osv_count, vs.osv_critical, vs.osv_high, vs.osv_medium, vs.osv_low,
               vs.snyk_total, vs.snyk_critical, vs.snyk_high, vs.snyk_upgrade
        FROM stack_components sc
        LEFT JOIN projects p ON sc.project_id = p.id
        LEFT JOIN servers s2 ON sc.server_id = s2.id
        LEFT JOIN vuln_status vs ON vs.product = sc.product AND vs.version = sc.current_version
        LEFT JOIN eol_status es ON sc.product = es.product
          AND es.cycle = (
            SELECT e2.cycle FROM eol_status e2
            WHERE e2.product = sc.product
              AND (e2.cycle = sc.current_version
                   OR e2.cycle = split_part(sc.current_version, '.', 1) || '.' || split_part(sc.current_version, '.', 2)
                   OR e2.cycle = split_part(sc.current_version, '.', 1))
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
      return rows;
    }

    case 'query_vulnerabilities': {
      const { rows } = await pool.query(
        `SELECT vs.*, sc.product_label, sc.current_version AS stack_version,
                COALESCE(p.name, s.name) AS source_name
         FROM vuln_status vs
         LEFT JOIN stack_components sc ON sc.product = vs.product AND sc.current_version = vs.version
         LEFT JOIN projects p ON sc.project_id = p.id
         LEFT JOIN servers s ON sc.server_id = s.id
         WHERE vs.osv_count > 0 OR vs.snyk_total > 0
         ORDER BY vs.osv_critical DESC, vs.osv_high DESC, vs.osv_count DESC`
      );
      return rows;
    }

    case 'check_endoflife': {
      const result = await getEolInfo(args.product, args.version);
      return result;
    }

    case 'check_vulnerabilities': {
      const result = await checkVulnerabilities(args.product, args.version);
      return result;
    }

    case 'query_jenkins_projects': {
      return await jenkins.getProjects();
    }

    case 'query_jenkins_jobs': {
      return await jenkins.getJobs(args.project || null);
    }

    case 'query_jenkins_job_status': {
      const { rows: [job] } = await pool.query(
        'SELECT job_path FROM jenkins_jobs WHERE id = $1', [args.job_id]
      );
      if (!job) return { error: `Job con ID ${args.job_id} no encontrado` };
      return await jenkins.getJobStatus(job.job_path);
    }

    case 'query_jenkins_project_status': {
      return await jenkins.getProjectStatus(args.project);
    }

    case 'query_jenkins_build_history': {
      const { rows: [job] } = await pool.query(
        'SELECT job_path FROM jenkins_jobs WHERE id = $1', [args.job_id]
      );
      if (!job) return { error: `Job con ID ${args.job_id} no encontrado` };
      const limit = Math.min(args.limit || 10, 20);
      return await jenkins.getBuildHistory(job.job_path, limit);
    }

    case 'query_jenkins_build_log': {
      const { rows: [job] } = await pool.query(
        'SELECT job_path FROM jenkins_jobs WHERE id = $1', [args.job_id]
      );
      if (!job) return { error: `Job con ID ${args.job_id} no encontrado` };
      // If no build number specified, get the last build number first
      let buildNumber = args.build_number;
      if (!buildNumber) {
        const lastBuild = await jenkins.getLastBuild(job.job_path);
        if (lastBuild.error) return { error: `No se pudo obtener el último build: ${lastBuild.error}` };
        buildNumber = lastBuild.number;
      }
      return await jenkins.getBuildLog(job.job_path, buildNumber);
    }

    default:
      return { error: `Herramienta desconocida: ${name}` };
  }
}

// ── Chat handler ────────────────────────────────────────────────────────────

/**
 * Procesa un mensaje del usuario (con historial) usando OpenAI con function calling.
 * Devuelve { reply, traces } donde traces es un array de eventos de debug.
 * @param {Array} messages - Historial de mensajes [{role, content}]
 * @returns {{ reply: string, traces: Array }}
 */
async function processChat(messages) {
  const client = getClient();
  const traces = [];
  const t0 = Date.now();
  const sessionId = Math.random().toString(36).slice(2, 8);

  // ANSI colors
  const C = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    cyan:    '\x1b[36m',   // 🗄  Base de datos
    yellow:  '\x1b[33m',   // 🌐 endoflife.date API
    magenta: '\x1b[35m',   // 🧠 OpenAI
    green:   '\x1b[32m',   // ✅ Éxito / completado
    red:     '\x1b[31m',   // ❌ Errores
    white:   '\x1b[37m',   // 💬 Usuario
    blue:    '\x1b[34m',   // 🔧 Tool calls genéricos
    redBright: '\x1b[91m', // 🛡️  Vulnerabilidades (OSV/Snyk)
  };

  // Clasificar herramientas por tipo
  const DB_TOOLS = ['query_servers', 'get_server_detail', 'query_projects', 'query_stack', 'query_vulnerabilities'];
  const API_TOOLS = ['check_endoflife'];
  const VULN_TOOLS = ['check_vulnerabilities'];
  const JENKINS_TOOLS = ['query_jenkins_projects', 'query_jenkins_jobs', 'query_jenkins_job_status', 'query_jenkins_project_status', 'query_jenkins_build_history', 'query_jenkins_build_log'];

  function toolColor(toolName) {
    if (DB_TOOLS.includes(toolName)) return C.cyan;
    if (API_TOOLS.includes(toolName)) return C.yellow;
    if (VULN_TOOLS.includes(toolName)) return C.redBright;
    if (JENKINS_TOOLS.includes(toolName)) return C.blue;
    return C.blue;
  }

  function toolLabel(toolName) {
    if (DB_TOOLS.includes(toolName)) return '🗄  DB';
    if (API_TOOLS.includes(toolName)) return '🌐 API';
    if (VULN_TOOLS.includes(toolName)) return '🛡️  VULN';
    if (JENKINS_TOOLS.includes(toolName)) return '🔧 JENKINS';
    return '🔧 EXT';
  }

  function trace(type, data) {
    const entry = { type, ts: Date.now() - t0, ...data };
    traces.push(entry);

    const time = new Date().toISOString();
    const elapsed = `+${entry.ts}ms`;
    let line = '';      // con colores (consola + terminal)
    let plain = '';     // sin colores (fichero)

    switch (type) {
      case 'user_message':
        plain = `\n${'═'.repeat(70)}\n` +
                `[${time}] 💬 NUEVA CONSULTA (session: ${sessionId})\n` +
                `${'─'.repeat(70)}\n` +
                `  Pregunta: "${data.content}"\n` +
                `${'─'.repeat(70)}`;
        line = `\n${C.white}${'═'.repeat(70)}${C.reset}\n` +
               `${C.bold}${C.white}[${time}] 💬 NUEVA CONSULTA (session: ${sessionId})${C.reset}\n` +
               `${C.dim}${'─'.repeat(70)}${C.reset}\n` +
               `  ${C.white}Pregunta: "${data.content}"${C.reset}\n` +
               `${C.dim}${'─'.repeat(70)}${C.reset}`;
        break;

      case 'openai_request':
        plain = `[${time}] ${elapsed} 🧠 → OpenAI  |  modelo: ${data.model}  |  mensajes: ${data.message_count}${data.iteration ? `  |  iteración: ${data.iteration}` : ''}`;
        line = `${C.magenta}[${time}] ${elapsed} 🧠 → OpenAI  |  modelo: ${data.model}  |  mensajes: ${data.message_count}${data.iteration ? `  |  iteración: ${data.iteration}` : ''}${C.reset}`;
        break;

      case 'openai_response':
        plain = `[${time}] ${elapsed} ✨ ← OpenAI  |  ${data.has_tool_calls ? `${data.tool_calls_count} tool call(s)` : 'respuesta directa'}  |  tokens: ${data.usage?.prompt_tokens || '?'}→${data.usage?.completion_tokens || '?'} (total: ${data.usage?.total_tokens || '?'})`;
        line = `${C.magenta}[${time}] ${elapsed} ✨ ← OpenAI  |  ${data.has_tool_calls ? `${data.tool_calls_count} tool call(s)` : 'respuesta directa'}  |  tokens: ${data.usage?.prompt_tokens || '?'}→${data.usage?.completion_tokens || '?'} (total: ${data.usage?.total_tokens || '?'})${C.reset}`;
        break;

      case 'tool_call': {
        const tc = toolColor(data.tool);
        const tl = toolLabel(data.tool);
        const argsStr = data.args && Object.keys(data.args).length > 0 ? JSON.stringify(data.args) : '';
        plain = `[${time}] ${elapsed} ${tl} CALL  |  ${data.tool}(${argsStr})`;
        line = `${tc}${C.bold}[${time}] ${elapsed} ${tl} CALL  |  ${data.tool}(${argsStr})${C.reset}`;
        break;
      }

      case 'tool_result': {
        const tc = toolColor(data.tool);
        const tl = toolLabel(data.tool);
        plain = `[${time}] ${elapsed} ${tl} OK    |  ${data.tool}  |  ${data.rows} filas  |  ${data.duration_ms}ms\n` +
                `  Preview: ${data.preview}`;
        line = `${tc}[${time}] ${elapsed} ${tl} OK    |  ${data.tool}  |  ${data.rows} filas  |  ${data.duration_ms}ms${C.reset}\n` +
               `${C.dim}  Preview: ${data.preview}${C.reset}`;
        break;
      }

      case 'tool_error': {
        const tl = toolLabel(data.tool);
        plain = `[${time}] ${elapsed} ${tl} ERR   |  ${data.tool}  |  ${data.error}  |  ${data.duration_ms}ms`;
        line = `${C.red}${C.bold}[${time}] ${elapsed} ${tl} ERR   |  ${data.tool}  |  ${data.error}  |  ${data.duration_ms}ms${C.reset}`;
        break;
      }

      case 'done':
        plain = `[${time}] ${elapsed} ✅ COMPLETADO |  ${data.total_ms}ms total  |  ${data.iterations} iteración(es)  |  ${data.reply_length} chars\n` +
                `${'═'.repeat(70)}\n`;
        line = `${C.green}${C.bold}[${time}] ${elapsed} ✅ COMPLETADO |  ${data.total_ms}ms total  |  ${data.iterations} iteración(es)  |  ${data.reply_length} chars${C.reset}\n` +
               `${C.dim}${'═'.repeat(70)}${C.reset}\n`;
        break;

      default:
        plain = `[${time}] ${elapsed} [${type}] ${JSON.stringify(data)}`;
        line = plain;
    }

    console.log(line);
    fs.appendFileSync(LOG_FILE, line + '\n');
  }

  trace('user_message', { content: messages[messages.length - 1]?.content });

  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  trace('openai_request', {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    message_count: fullMessages.length,
  });

  let response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: fullMessages,
    tools,
    tool_choice: 'auto',
    temperature: 0.3,
    max_tokens: 4096,
  });

  trace('openai_response', {
    has_tool_calls: !!response.choices[0].message.tool_calls,
    tool_calls_count: response.choices[0].message.tool_calls?.length || 0,
    usage: response.usage,
  });

  let assistantMessage = response.choices[0].message;

  // Loop de function calling (máx 10 iteraciones para evitar bucles)
  let iterations = 0;
  while (assistantMessage.tool_calls && iterations < 10) {
    iterations++;
    fullMessages.push(assistantMessage);

    for (const toolCall of assistantMessage.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      const toolName = toolCall.function.name;

      trace('tool_call', { tool: toolName, args });

      let result;
      const toolStart = Date.now();
      try {
        result = await handleToolCall(toolName, args);
        const rowCount = Array.isArray(result) ? result.length : (result?.error ? 0 : 1);
        trace('tool_result', {
          tool: toolName,
          duration_ms: Date.now() - toolStart,
          rows: rowCount,
          preview: JSON.stringify(result).slice(0, 200),
        });
      } catch (err) {
        trace('tool_error', { tool: toolName, error: err.message, duration_ms: Date.now() - toolStart });
        result = { error: err.message };
      }

      fullMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    trace('openai_request', {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      message_count: fullMessages.length,
      iteration: iterations,
    });

    response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: fullMessages,
      tools,
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 4096,
    });

    trace('openai_response', {
      has_tool_calls: !!response.choices[0].message.tool_calls,
      tool_calls_count: response.choices[0].message.tool_calls?.length || 0,
      usage: response.usage,
      iteration: iterations,
    });

    assistantMessage = response.choices[0].message;
  }

  const reply = assistantMessage.content || 'No pude generar una respuesta.';
  trace('done', { total_ms: Date.now() - t0, iterations, reply_length: reply.length });

  return { reply, traces };
}

module.exports = { processChat };
