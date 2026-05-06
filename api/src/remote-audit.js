/**
 * remote-audit.js — Ejecuta server-audit.sh en servidores remotos via SSH
 *
 * SEGURIDAD: Las credenciales (usuario/contraseña) NUNCA se almacenan.
 * Solo se usan en memoria durante la conexión SSH y se descartan al terminar.
 */
const { Client, utils: { parseKey } } = require('ssh2');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { importAudit } = require('./import');

const AUDIT_SCRIPT_PATH = '/data/server-audit.sh';
const REMOTE_SCRIPT     = '/tmp/server-audit.sh';

/**
 * Convierte una clave privada PPK (PuTTY v2/v3) a formato OpenSSH PEM.
 * Si ya está en formato PEM/OpenSSH, la devuelve tal cual.
 */
function convertToOpenSSH(keyData) {
  // Si ya es PEM / OpenSSH, devolver directamente
  if (keyData.includes('-----BEGIN') && keyData.includes('PRIVATE KEY')) {
    return keyData;
  }

  // Detectar formato PPK (v2 o v3)
  if (!keyData.includes('PuTTY-User-Key-File-')) {
    throw new Error('Formato de clave no reconocido. Usa OpenSSH PEM (.pem) o PuTTY PPK (.ppk).');
  }

  // Intentar parseKey nativo primero (soporta PPK v2)
  const parsed = parseKey(keyData);
  if (!(parsed instanceof Error)) {
    return keyData; // ssh2 lo soporta directamente
  }

  // PPK v3: convertir con puttygen
  const tmpId = crypto.randomBytes(8).toString('hex');
  const tmpPpk = `/tmp/key-${tmpId}.ppk`;
  const tmpPem = `/tmp/key-${tmpId}.pem`;

  try {
    fs.writeFileSync(tmpPpk, keyData, { mode: 0o600 });
    execSync(`puttygen ${tmpPpk} -O private-openssh -o ${tmpPem}`, {
      timeout: 5000,
      stdio: 'pipe',
    });
    const pemData = fs.readFileSync(tmpPem, 'utf8');
    return pemData;
  } catch (err) {
    throw new Error(`Error convirtiendo clave PPK a OpenSSH: ${err.message}`);
  } finally {
    try { fs.unlinkSync(tmpPpk); } catch {}
    try { fs.unlinkSync(tmpPem); } catch {}
  }
}

/**
 * Ejecuta la auditoría completa en un servidor remoto:
 * 1. Sube server-audit.sh por SFTP
 * 2. Ejecuta el script
 * 3. Descarga el JSON resultado
 * 4. Limpia ficheros temporales
 * 5. Importa el JSON en la base de datos
 *
 * @param {object} params
 * @param {string} params.host       - IP o hostname del servidor
 * @param {string} params.username   - Usuario SSH (NO se guarda)
 * @param {string} [params.password]   - Contraseña SSH (NO se guarda)
 * @param {string} [params.privateKey] - Clave privada PEM (contenido, NO se guarda)
 * @param {string} params.serverName - Nombre lógico del servidor
 * @param {string} params.environment - Entorno: test, demo, prod, staging
 * @param {function} [params.onProgress] - Callback de progreso (step, message)
 * @returns {Promise<object>} Resultado de la importación
 */
async function runRemoteAudit({ host, username, password, privateKey, serverName, environment, onProgress }) {
  const progress = onProgress || (() => {});
  const remoteJson = `/tmp/${serverName}.json`;

  // Verificar que el script local existe
  if (!fs.existsSync(AUDIT_SCRIPT_PATH)) {
    throw new Error(`Script de auditoría no encontrado: ${AUDIT_SCRIPT_PATH}`);
  }

  const conn = new Client();

  try {
    // 1. Conectar por SSH
    progress('connecting', `Conectando a ${host}...`);
    await new Promise((resolve, reject) => {
      conn.on('ready', () => {
        console.log(`[audit] SSH conectado a ${host}`);
        resolve();
      });
      conn.on('error', (err) => {
        console.error(`[audit] SSH error (${host}):`, err.level, err.message);
        if (err.level === 'client-authentication') {
          reject(new Error('Credenciales inválidas'));
        } else if (err.level === 'client-timeout') {
          reject(new Error(`No se pudo conectar a ${host}: timeout`));
        } else {
          reject(new Error(`Error de conexión a ${host}: ${err.message}`));
        }
      });
      conn.on('close', () => {
        console.log(`[audit] SSH conexión cerrada (${host})`);
      });
      // Preparar autenticación
      const authOpts = {};
      if (privateKey) {
        // Soporta PEM (OpenSSH) y PPK (PuTTY v2/v3) — convierte si es necesario
        const opensshKey = convertToOpenSSH(privateKey);
        authOpts.privateKey = opensshKey;
      } else {
        authOpts.password = password;
      }

      conn.connect({
        host,
        port: 22,
        username,
        ...authOpts,
        readyTimeout: 8000,
        hostVerifier: () => true,
        algorithms: {
          kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'],
        },
      });
    });

    // 2. Subir el script por SFTP
    progress('uploading', 'Subiendo server-audit.sh...');
    console.log(`[audit] Iniciando SFTP upload a ${host}...`);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout subiendo script (30s)')), 30000);
      conn.sftp((err, sftp) => {
        if (err) { clearTimeout(timeout); return reject(new Error(`Error SFTP: ${err.message}`)); }
        const localStream = fs.createReadStream(AUDIT_SCRIPT_PATH);
        const remoteStream = sftp.createWriteStream(REMOTE_SCRIPT, { mode: 0o755 });
        remoteStream.on('close', () => { clearTimeout(timeout); sftp.end(); console.log(`[audit] Script subido a ${host}`); resolve(); });
        remoteStream.on('error', (e) => { clearTimeout(timeout); reject(new Error(`Error subiendo script: ${e.message}`)); });
        localStream.pipe(remoteStream);
      });
    });

    // 3. Ejecutar el script
    progress('executing', 'Ejecutando auditoría...');
    console.log(`[audit] Ejecutando script en ${host}...`);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error(`[audit] TIMEOUT ejecutando script en ${host}`);
        reject(new Error('Timeout ejecutando script (120s)'));
      }, 120000);
      const cmd = `bash ${REMOTE_SCRIPT} -n '${serverName}' -e '${environment}' -o '${remoteJson}' 2>&1`;
      conn.exec(cmd, { pty: false }, (err, stream) => {
        if (err) { clearTimeout(timeout); return reject(new Error(`Error ejecutando script: ${err.message}`)); }
        let output = '';
        stream.on('data', (d) => {
          output += d.toString();
          console.log(`[audit][${host}] ${d.toString().trim()}`);
        });
        stream.stderr.on('data', (d) => {
          output += d.toString();
          console.error(`[audit][${host}] stderr: ${d.toString().trim()}`);
        });
        stream.on('close', (code) => {
          clearTimeout(timeout);
          console.log(`[audit] Script finalizado en ${host} con código ${code}`);
          if (code !== 0) {
            return reject(new Error(`Script salió con código ${code}: ${output.slice(-500)}`));
          }
          resolve();
        });
      });
    });

    // 4. Descargar el JSON
    progress('downloading', 'Descargando resultado...');
    console.log(`[audit] Descargando JSON de ${host}...`);
    const jsonData = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout descargando JSON (30s)')), 30000);
      conn.sftp((err, sftp) => {
        if (err) { clearTimeout(timeout); return reject(new Error(`Error SFTP descarga: ${err.message}`)); }
        let data = '';
        const stream = sftp.createReadStream(remoteJson, { encoding: 'utf8' });
        stream.on('data', (chunk) => { data += chunk; });
        stream.on('end', () => { clearTimeout(timeout); sftp.end(); console.log(`[audit] JSON descargado de ${host} (${data.length} bytes)`); resolve(data); });
        stream.on('error', (e) => { clearTimeout(timeout); reject(new Error(`Error descargando JSON: ${e.message}`)); });
      });
    });

    // 5. Limpiar ficheros remotos (no bloqueante)
    progress('cleanup', 'Limpiando ficheros remotos...');
    console.log(`[audit] Limpiando ficheros remotos en ${host}...`);
    try {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => { console.log(`[audit] Cleanup timeout, continuando...`); resolve(); }, 5000);
        conn.exec(`rm -f '${REMOTE_SCRIPT}' '${remoteJson}'`, (err, stream) => {
          if (err) { clearTimeout(timeout); return resolve(); }
          stream.on('close', () => { clearTimeout(timeout); resolve(); });
        });
      });
    } catch { /* ignorar errores de limpieza */ }

    // 6. Cerrar conexión SSH
    console.log(`[audit] Cerrando SSH a ${host}...`);
    conn.end();

    // 7. Parsear e importar
    progress('importing', 'Importando datos...');
    console.log(`[audit] Parseando e importando JSON de ${host}...`);
    let auditData;
    try {
      auditData = JSON.parse(jsonData);
    } catch {
      throw new Error('El servidor generó un JSON inválido');
    }

    console.log(`[audit] Importando ${auditData.stack?.length || 0} componentes de ${host}...`);
    const result = await importAudit(auditData);
    console.log(`[audit] Importación completada para ${host}:`, JSON.stringify(result));
    progress('done', 'Completado');
    return result;

  } catch (err) {
    conn.end();
    throw err;
  }
  // Las variables username y password salen del scope aquí
  // y se liberan por el garbage collector
}

module.exports = { runRemoteAudit };
