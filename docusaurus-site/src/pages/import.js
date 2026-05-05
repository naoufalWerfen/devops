import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';

const API_BASE = 'http://localhost:3001/api';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ ok, text }) {
  return (
    <span className={`eol-badge eol-badge--${ok ? 'ok' : 'eol'}`}>
      {text}
    </span>
  );
}

/* ── Dropzone ────────────────────────────────────────────────────────────── */

function DropZone({ onFileLoaded }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const isJson = file.name.toLowerCase().endsWith('.json')
      || file.type === 'application/json';
    if (!isJson) {
      alert('Solo se aceptan ficheros .json');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setFileName(file.name);
        onFileLoaded(data, file.name);
      } catch {
        alert('El fichero no contiene JSON válido');
      }
    };
    reader.readAsText(file);
  }, [onFileLoaded]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  return (
    <div
      className={`import-dropzone ${dragging ? 'import-dropzone--active' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={() => setDragging(false)}
    >
      <div className="import-dropzone__icon">📁</div>
      <p className="import-dropzone__text">
        Arrastra aquí el fichero <code>.json</code> generado por <code>server-audit.sh</code>
      </p>
      <p className="import-dropzone__or">o</p>
      <label className="button button--primary button--sm">
        Seleccionar fichero
        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
      {fileName && (
        <p className="import-dropzone__file">Fichero cargado: <strong>{fileName}</strong></p>
      )}
    </div>
  );
}

/* ── Preview ─────────────────────────────────────────────────────────────── */

function Preview({ data }) {
  if (!data) return null;
  const s = data.server || {};
  const hw = data.hardware || {};
  const stack = data.stack || [];

  return (
    <div className="import-preview">
      <h3>Vista previa</h3>
      <div className="import-preview__grid">
        <div className="import-preview__card">
          <h4>🖥️ Servidor</h4>
          <table className="import-preview__table">
            <tbody>
              <tr><td>Nombre</td><td><strong>{s.name}</strong></td></tr>
              <tr><td>IP</td><td><code>{s.ip}</code></td></tr>
              <tr><td>OS</td><td>{s.os_pretty || `${s.os} ${s.os_version}`}</td></tr>
              <tr><td>Entorno</td><td><span className={`cat-badge cat-badge--${s.environment}`}>{s.environment}</span></td></tr>
              <tr><td>Kernel</td><td><code>{s.kernel}</code></td></tr>
              <tr><td>Arch</td><td>{s.arch}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="import-preview__card">
          <h4>💾 Hardware</h4>
          <table className="import-preview__table">
            <tbody>
              <tr><td>CPU</td><td>{hw.cpu_count} × {hw.cpu}</td></tr>
              <tr><td>RAM</td><td>{hw.ram_total_gb} GB (usado: {hw.ram_used_gb} GB)</td></tr>
              <tr><td>Swap</td><td>{hw.swap_total_gb} GB ({hw.swap_usage_pct}%)</td></tr>
              <tr><td>Disco</td><td>{hw.disk_total_gb} GB ({hw.disk_usage_pct}%)</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <h4 style={{ marginTop: '1.5rem' }}>📦 Stack detectado ({stack.length} componentes)</h4>
      <div className="stack-table-wrapper">
        <table className="stack-table">
          <thead>
            <tr>
              <th>Tecnología</th>
              <th>Categoría</th>
              <th>Versión</th>
              <th>Path</th>
            </tr>
          </thead>
          <tbody>
            {stack.map((c, i) => (
              <tr key={i}>
                <td><strong>{c.label}</strong></td>
                <td><span className={`cat-badge cat-badge--${c.category}`}>{c.category}</span></td>
                <td><code>{c.version}</code></td>
                <td style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)' }}>{c.path}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="import-preview__summary">
        <span>🔧 {(data.services || []).length} servicios</span>
        <span>🔌 {(data.listening_ports || []).length} puertos</span>
        <span>🔒 {(data.ssl_certificates || []).length} certificados SSL</span>
        <span>⚙️ {(data.php_fpm_pools || []).length} pools PHP-FPM</span>
        <span>🌐 {(data.vhosts || []).length} vhosts</span>
      </div>
    </div>
  );
}

/* ── Historial ───────────────────────────────────────────────────────────── */

function ImportHistory({ imports }) {
  if (!imports.length) return null;
  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="section-label">📋 Importaciones anteriores</div>
      <div className="stack-table-wrapper">
        <table className="stack-table">
          <thead>
            <tr>
              <th>Servidor</th>
              <th>IP</th>
              <th>OS</th>
              <th>Entorno</th>
              <th>Escaneado</th>
              <th>Importado</th>
            </tr>
          </thead>
          <tbody>
            {imports.map((imp, i) => (
              <tr key={i}>
                <td><strong>{imp.name}</strong></td>
                <td><code>{imp.ip}</code></td>
                <td>{imp.os_pretty || '—'}</td>
                <td><span className={`cat-badge cat-badge--${imp.environment}`}>{imp.environment}</span></td>
                <td>{formatDate(imp.scan_date)}</td>
                <td>{formatDate(imp.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────────────────────────────── */

export default function ImportPage() {
  const [data, setData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imports, setImports] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/imports`)
      .then(r => r.json())
      .then(setImports)
      .catch(() => {});
  }, [result]);

  const handleFileLoaded = useCallback((jsonData, name) => {
    setData(jsonData);
    setFileName(name);
    setResult(null);
    setError(null);
  }, []);

  const handleImport = async () => {
    if (!data) return;
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Error al importar');
      } else {
        setResult(json);
      }
    } catch (err) {
      setError('No se pudo conectar con la API. ¿Está corriendo docker compose?');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Layout title="Importar servidor" description="Importar JSON de server-audit.sh">
      <header className="hero--werfen">
        <div className="container">
          <h1>Importar servidor</h1>
          <p>Sube el fichero <code style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>.json</code> generado por <code style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>server-audit.sh</code> en cualquier servidor</p>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 0 3rem' }}>
        {/* Instrucciones */}
        <div className="import-instructions">
          <h3>Cómo usar</h3>
          <ol>
            <li>Copia <code>scripts/server-audit.sh</code> al servidor que quieres auditar</li>
            <li>Ejecuta:
              <pre><code>bash server-audit.sh -n NOMBRE_SERVIDOR -e test -o NOMBRE_SERVIDOR.json</code></pre>
            </li>
            <li>Descarga el fichero <code>.json</code> generado</li>
            <li>Arrastra o selecciona el fichero aquí abajo</li>
          </ol>
        </div>

        {/* Dropzone */}
        <DropZone onFileLoaded={handleFileLoaded} />

        {/* Preview */}
        <Preview data={data} />

        {/* Botón importar */}
        {data && !result && (
          <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
            <button
              className="button button--primary button--lg"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? '⏳ Importando y consultando endoflife.date...' : `📥 Importar ${data.server?.name} (${data.server?.ip})`}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert-banner alert-banner--critical" style={{ marginTop: '1rem' }}>
            <span className="alert-icon">🔴</span>
            <span>{error}</span>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="import-result">
            <div className="import-result__header">
              <span className="import-result__icon">✅</span>
              <div>
                <h3>Importación completada: {result.server}</h3>
                <p>{result.ip} — {result.environment}</p>
              </div>
            </div>
            <div className="import-result__stats">
              <div className="import-result__stat">
                <span className="import-result__num">{result.stack}</span>
                <span className="import-result__label">Stack</span>
              </div>
              <div className="import-result__stat">
                <span className="import-result__num">{result.services}</span>
                <span className="import-result__label">Servicios</span>
              </div>
              <div className="import-result__stat">
                <span className="import-result__num">{result.ports}</span>
                <span className="import-result__label">Puertos</span>
              </div>
              <div className="import-result__stat">
                <span className="import-result__num">{result.eol_checked}</span>
                <span className="import-result__label">EOL verificados</span>
              </div>
              <div className="import-result__stat">
                <span className="import-result__num">{result.ssl}</span>
                <span className="import-result__label">SSL certs</span>
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
              <a href="/stack" className="button button--outline button--primary">
                Ver Stack & Servidores →
              </a>
            </p>
          </div>
        )}

        {/* Historial */}
        <ImportHistory imports={imports} />
      </main>
    </Layout>
  );
}
