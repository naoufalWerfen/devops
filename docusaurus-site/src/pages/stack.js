import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const API_BASE = 'http://localhost:3001/api';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function StatusBadge({ isEol, isEoas }) {
  if (isEol) return <span className="eol-badge eol-badge--eol">EOL</span>;
  if (isEoas) return <span className="eol-badge eol-badge--eoas">Soporte limitado</span>;
  return <span className="eol-badge eol-badge--ok">Soportado</span>;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function daysUntil(d) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  return diff;
}

/* ── Componentes ─────────────────────────────────────────────────────────── */

function ServerCards({ servers }) {
  if (!servers.length) return null;
  return (
    <div className="stack-servers">
      {servers.map((s) => (
        <div key={s.id} className="stack-server-card">
          <div className="stack-server-card__header">
            <h3>{s.name}</h3>
            <span className="server-ip">{s.ip}</span>
          </div>
          <div className="stack-server-card__body">
            <div className="stack-row"><span className="stack-label">OS</span><span>{s.os} {s.os_version}</span></div>
            <div className="stack-row"><span className="stack-label">CPU</span><span>{s.cpu_count} vCPU · {s.cpu}</span></div>
            <div className="stack-row"><span className="stack-label">RAM</span><span>{s.ram_gb} GB</span></div>
            {s.disk_gb && <div className="stack-row"><span className="stack-label">Disco</span><span>{s.disk_gb} GB ({s.disk_usage_pct}%)</span></div>}
            {s.uptime_days && <div className="stack-row"><span className="stack-label">Uptime</span><span>{s.uptime_days} días</span></div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function StackTable({ stack, showProject }) {
  if (!stack.length) return <p>No hay datos de stack. Ejecuta una sincronización.</p>;
  return (
    <div className="stack-table-wrapper">
      <table className="stack-table">
        <thead>
          <tr>
            {showProject && <th>Proyecto</th>}
            <th>Tecnología</th>
            <th>Categoría</th>
            <th>Versión actual</th>
            <th>Última disponible</th>
            <th>EOL</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {stack.map((item, i) => {
            const days = daysUntil(item.eol_date);
            const eolWarning = days !== null && days > 0 && days < 180;
            return (
              <tr key={i} className={item.is_eol ? 'row--eol' : eolWarning ? 'row--warning' : ''}>
                {showProject && <td><strong>{item.project_label || item.project_name}</strong></td>}
                <td>{item.product_label}</td>
                <td><span className={`cat-badge cat-badge--${item.category}`}>{item.category}</span></td>
                <td><code>{item.current_version}</code></td>
                <td>{item.latest_version ? <code>{item.latest_version}</code> : '—'}</td>
                <td>
                  {item.eol_date ? (
                    <span className={item.is_eol ? 'eol-date--past' : eolWarning ? 'eol-date--soon' : ''}>
                      {formatDate(item.eol_date)}
                      {days !== null && !item.is_eol && <small> ({days}d)</small>}
                    </span>
                  ) : '—'}
                </td>
                <td><StatusBadge isEol={item.is_eol} isEoas={item.is_eoas} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SyncButton({ onSync, lastSync }) {
  const [loading, setLoading] = useState(false);
  const handleSync = async () => {
    setLoading(true);
    try {
      await onSync();
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="sync-bar">
      <button
        className="button button--primary button--sm"
        onClick={handleSync}
        disabled={loading}
      >
        {loading ? '⏳ Sincronizando...' : '🔄 Sincronizar con endoflife.date'}
      </button>
      {lastSync && lastSync.status !== 'never' && (
        <span className="sync-info">
          Última sync: {formatDate(lastSync.finished_at)} — {lastSync.status}
        </span>
      )}
    </div>
  );
}

/* ── Página principal ────────────────────────────────────────────────────── */

export default function StackStatus() {
  const [stack, setStack] = useState([]);
  const [servers, setServers] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all'); // all | by-project

  const fetchData = async () => {
    try {
      const [stackRes, serversRes, syncRes] = await Promise.all([
        fetch(`${API_BASE}/stack`),
        fetch(`${API_BASE}/servers`),
        fetch(`${API_BASE}/sync/status`),
      ]);
      if (!stackRes.ok || !serversRes.ok) throw new Error('API no disponible');
      setStack(await stackRes.json());
      setServers(await serversRes.json());
      setSyncStatus(await syncRes.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSync = async () => {
    try {
      await fetch(`${API_BASE}/sync`, { method: 'POST' });
      await fetchData();
    } catch (err) {
      setError('Error al sincronizar: ' + err.message);
    }
  };

  // Stats
  const eolCount = stack.filter((s) => s.is_eol).length;
  const eoasCount = stack.filter((s) => s.is_eoas && !s.is_eol).length;
  const okCount = stack.filter((s) => !s.is_eol && !s.is_eoas).length;

  // Group by project
  const byProject = stack.reduce((acc, item) => {
    const key = item.project_name;
    if (!acc[key]) acc[key] = { label: item.project_label, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  return (
    <Layout title="Stack & Servidores" description="Estado del stack tecnológico y servidores — endoflife.date">
      <header className="hero--werfen">
        <div className="container">
          <h1>Stack Tecnológico & Servidores</h1>
          <p>Estado de versiones, EOL y salud de la infraestructura — datos de <a href="https://endoflife.date" target="_blank" rel="noopener noreferrer" style={{color: '#fff', textDecoration: 'underline'}}>endoflife.date</a></p>
          <div className="stats-bar" style={{justifyContent: 'flex-start', padding: '1rem 0 0'}}>
            <div className="stat-item">
              <div className="stat-number" style={{color: '#FF4848'}}>{eolCount}</div>
              <div className="stat-label" style={{color: 'rgba(255,255,255,0.7)'}}>EOL</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{color: '#FFBA00'}}>{eoasCount}</div>
              <div className="stat-label" style={{color: 'rgba(255,255,255,0.7)'}}>Soporte limitado</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{color: '#22c55e'}}>{okCount}</div>
              <div className="stat-label" style={{color: 'rgba(255,255,255,0.7)'}}>Soportados</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{color: '#fff'}}>{servers.length}</div>
              <div className="stat-label" style={{color: 'rgba(255,255,255,0.7)'}}>Servidores</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{padding: '2rem 0 3rem'}}>
        {error && (
          <div className="alert-banner alert-banner--critical" style={{marginBottom: '1rem'}}>
            <span className="alert-icon">🔴</span>
            <span>Error conectando con la API: {error}. Asegúrate de que <code>docker compose up</code> está corriendo.</span>
          </div>
        )}

        <SyncButton onSync={handleSync} lastSync={syncStatus} />

        {loading ? (
          <p style={{textAlign: 'center', padding: '3rem'}}>Cargando datos...</p>
        ) : (
          <>
            {/* Servidores */}
            <section style={{margin: '2rem 0'}}>
              <div className="section-label">🖥️ Servidores</div>
              <ServerCards servers={servers} />
            </section>

            {/* Vista toggle */}
            <section>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <div className="section-label" style={{margin: 0}}>📦 Stack Tecnológico</div>
                <div className="button-group">
                  <button
                    className={`button button--sm ${view === 'all' ? 'button--primary' : 'button--outline button--primary'}`}
                    onClick={() => setView('all')}
                  >Vista global</button>
                  <button
                    className={`button button--sm ${view === 'by-project' ? 'button--primary' : 'button--outline button--primary'}`}
                    onClick={() => setView('by-project')}
                  >Por proyecto</button>
                </div>
              </div>

              {view === 'all' ? (
                <StackTable stack={stack} showProject />
              ) : (
                Object.entries(byProject).map(([name, { label, items }]) => (
                  <div key={name} style={{marginBottom: '2rem'}}>
                    <h3>{label}</h3>
                    <StackTable stack={items} showProject={false} />
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}
