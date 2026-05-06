import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';

const API_BASE = 'http://localhost:3001/api';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/* ── Formulario de auditoría ─────────────────────────────────────────────── */

function AuditForm({ onResult, onRunning }) {
  const [host, setHost] = useState('');
  const [serverName, setServerName] = useState('');
  const [environment, setEnvironment] = useState('test');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authType, setAuthType] = useState('password');
  const [privateKey, setPrivateKey] = useState('');
  const [pemFileName, setPemFileName] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState([]);

  const handlePemFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPemFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setPrivateKey(ev.target.result);
    reader.readAsText(file);
  };

  const isFormValid = host && serverName && username &&
    (authType === 'password' ? password : privateKey);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setRunning(true);
    const initialSteps = [
      { step: 'start', message: 'Iniciando auditoría...', time: new Date().toISOString() },
    ];
    setSteps(initialSteps);
    onRunning(true);
    onResult(null);

    // Simular progreso visual mientras espera la respuesta del backend
    const progressMsgs = [
      { delay: 2000, step: 'connecting', message: `Conectando a ${host}...` },
      { delay: 6000, step: 'uploading', message: 'Subiendo script de auditoría...' },
      { delay: 10000, step: 'executing', message: 'Ejecutando auditoría en el servidor...' },
      { delay: 20000, step: 'waiting', message: 'Esperando resultados (puede tardar)...' },
    ];
    const timers = progressMsgs.map(({ delay, step, message }) =>
      setTimeout(() => {
        setSteps((prev) => [...prev, { step, message, time: new Date().toISOString() }]);
      }, delay)
    );

    try {
      console.log('[audit] Enviando petición a:', `${API_BASE}/audit/remote`);
      const body = { host, username, serverName, environment };
      if (authType === 'password') {
        body.password = password;
      } else {
        body.privateKey = privateKey;
      }
      const res = await fetch(`${API_BASE}/audit/remote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      console.log('[audit] Respuesta recibida:', res.status);
      const data = await res.json();

      // Limpiar timers y credenciales
      timers.forEach(clearTimeout);
      setPassword('');
      setPrivateKey('');
      setPemFileName('');

      if (data.steps) setSteps(data.steps);
      if (data.status === 'ok') {
        setSteps((prev) => [...prev, { step: 'done', message: 'Completado', time: new Date().toISOString() }]);
      }
      onResult(data);
    } catch (err) {
      console.error('[audit] Error fetch:', err);
      timers.forEach(clearTimeout);
      setPassword('');
      setPrivateKey('');
      setPemFileName('');
      setSteps((prev) => [...prev, { step: 'error', message: err.message, time: new Date().toISOString() }]);
      onResult({ status: 'error', message: err.message });
    } finally {
      setRunning(false);
      onRunning(false);
    }
  };

  return (
    <div className="audit-form-container">
      <form className="audit-form" onSubmit={handleSubmit}>
        <h3>🖥️ Servidor</h3>
        <div className="audit-form__grid">
          <div className="audit-form__field">
            <label>Nombre del servidor</label>
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="WEBAPPSPROD"
              required
              pattern="^[a-zA-Z0-9.\-_]+$"
              title="Solo letras, números, puntos, guiones y guiones bajos"
              disabled={running}
            />
          </div>
          <div className="audit-form__field">
            <label>IP / Hostname</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="10.120.204.93"
              required
              disabled={running}
            />
          </div>
          <div className="audit-form__field">
            <label>Entorno</label>
            <select value={environment} onChange={(e) => setEnvironment(e.target.value)} disabled={running}>
              <option value="test">Test</option>
              <option value="demo">Demo</option>
              <option value="prod">Producción</option>
              <option value="staging">Staging</option>
            </select>
          </div>
        </div>

        <h3>🔐 Credenciales SSH</h3>
        <p className="audit-form__notice">
          ⚠️ Las credenciales <strong>no se guardan</strong>. Solo se usan en memoria durante la conexión.
        </p>
        <div className="audit-form__grid">
          <div className="audit-form__field">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="root"
              required
              disabled={running}
              autoComplete="off"
            />
          </div>
          <div className="audit-form__field">
            <label>Autenticación</label>
            <select value={authType} onChange={(e) => setAuthType(e.target.value)} disabled={running}>
              <option value="password">Contraseña</option>
              <option value="pem">Certificado PEM</option>
            </select>
          </div>
        </div>
        {authType === 'password' ? (
          <div className="audit-form__grid">
            <div className="audit-form__field">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={running}
                autoComplete="off"
              />
            </div>
          </div>
        ) : (
          <div className="audit-form__grid">
            <div className="audit-form__field" style={{ gridColumn: '1 / -1' }}>
              <label>Fichero PEM / PPK (.pem, .ppk, .key)</label>
              <input
                type="file"
                accept=".pem,.key,.ppk"
                onChange={handlePemFile}
                disabled={running}
                style={{ padding: '0.5rem' }}
              />
              {pemFileName && (
                <small style={{ color: 'var(--ifm-color-success)', marginTop: '0.25rem', display: 'block' }}>
                  ✔ {pemFileName} cargado
                </small>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="button button--primary button--lg audit-form__submit"
          disabled={running || !isFormValid}
        >
          {running ? '⏳ Ejecutando auditoría...' : '🚀 Ejecutar auditoría remota'}
        </button>
      </form>

      {steps.length > 0 && (
        <div className="audit-steps">
          <h4>Progreso</h4>
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1;
            const icon = s.step === 'done' ? '✅'
              : s.step === 'error' ? '❌'
              : isLast && running ? '⏳'
              : '✔️';
            return (
              <div key={i} className={`audit-step ${s.step === 'done' ? 'audit-step--done' : ''} ${s.step === 'error' ? 'audit-step--error' : ''}`}>
                <span className="audit-step__icon">{icon}</span>
                <span className="audit-step__msg">{s.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Resultado ───────────────────────────────────────────────────────────── */

function AuditResult({ result }) {
  if (!result) return null;

  if (result.status === 'error') {
    return (
      <div className="audit-result audit-result--error">
        <h3>❌ Error</h3>
        <p>{result.message}</p>
      </div>
    );
  }

  return (
    <div className="audit-result audit-result--ok">
      <h3>✅ Auditoría completada</h3>
      <table className="import-preview__table">
        <tbody>
          <tr><td>Servidor</td><td><strong>{result.server}</strong></td></tr>
          <tr><td>IP</td><td><code>{result.ip}</code></td></tr>
          <tr><td>Entorno</td><td><span className={`cat-badge cat-badge--${result.environment}`}>{result.environment}</span></td></tr>
          <tr><td>Stack detectado</td><td>{result.stack} componentes</td></tr>
          <tr><td>Servicios</td><td>{result.services}</td></tr>
          <tr><td>Puertos</td><td>{result.ports}</td></tr>
          <tr><td>Certificados SSL</td><td>{result.ssl}</td></tr>
          <tr><td>EOL verificados</td><td>{result.eol_checked}</td></tr>
        </tbody>
      </table>
      <p style={{ marginTop: '1rem' }}>
        Consulta los resultados en{' '}
        <a href="/stack">📊 Stack & Servidores</a>
      </p>
    </div>
  );
}

/* ── Historial ───────────────────────────────────────────────────────────── */

function AuditHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/imports`)
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => {});
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="audit-history">
      <h3>📋 Auditorías anteriores</h3>
      <table className="stack-table">
        <thead>
          <tr>
            <th>Servidor</th>
            <th>IP</th>
            <th>OS</th>
            <th>Entorno</th>
            <th>Última auditoría</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.name}>
              <td><strong>{h.name}</strong></td>
              <td><code>{h.ip}</code></td>
              <td>{h.os_pretty || '—'}</td>
              <td><span className={`cat-badge cat-badge--${h.environment}`}>{h.environment}</span></td>
              <td>{formatDate(h.scan_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Página principal ────────────────────────────────────────────────────── */

export default function AuditPage() {
  const [result, setResult] = useState(null);
  const [, setRunning] = useState(false);

  return (
    <Layout title="Auditoría Remota" description="Ejecutar auditoría de servidores por SSH">
      <main className="container margin-vert--lg">
        <h1>🔍 Auditoría Remota</h1>
        <p>
          Conecta a un servidor por SSH, ejecuta la auditoría automáticamente e importa los resultados.
          <br />
          <strong>Las credenciales nunca se almacenan</strong> — solo se usan durante la conexión.
        </p>

        <AuditForm onResult={setResult} onRunning={setRunning} />
        <AuditResult result={result} />
        <AuditHistory />
      </main>
    </Layout>
  );
}
