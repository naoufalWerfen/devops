import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Layout from '@theme/Layout';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'motion/react';

gsap.registerPlugin(useGSAP);

const API_BASE = 'http://localhost:3001/api';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function daysUntil(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

function StatusBadge({ item }) {
  if (item.is_eol) return <span className="eol-badge eol-badge--eol">EOL</span>;
  if (item.is_eoas) return <span className="eol-badge eol-badge--eoas">Soporte limitado</span>;
  if (item.is_lts) return <span className="eol-badge eol-badge--lts">LTS</span>;
  if (item.is_maintained === true) return <span className="eol-badge eol-badge--ok">Soportado</span>;
  if (item.latest_version) return <span className="eol-badge eol-badge--ok">Soportado</span>;
  return <span className="eol-badge eol-badge--unknown">Sin datos</span>;
}

function EolDateCell({ item }) {
  const days = daysUntil(item.eol_date);
  if (!item.eol_date) return <td>—</td>;
  const isPast = item.is_eol;
  const isSoon = days !== null && days > 0 && days < 180;
  return (
    <td>
      <span className={isPast ? 'eol-date--past' : isSoon ? 'eol-date--soon' : ''}>
        {formatDate(item.eol_date)}
        {days !== null && !isPast && <small className="eol-days"> ({days}d)</small>}
        {isPast && <small className="eol-days eol-days--past"> (hace {Math.abs(days)}d)</small>}
      </span>
    </td>
  );
}

function VersionCompare({ current, latest }) {
  if (!latest) return <td>—</td>;
  const isOutdated = current !== latest;
  return (
    <td>
      <code className={isOutdated ? 'version--outdated' : 'version--current'}>{latest}</code>
    </td>
  );
}

function VulnBadge({ item }) {
  const count = item.osv_count;
  if (count == null) return <span className="vuln-badge vuln-badge--unknown">—</span>;
  if (count === 0) return <span className="vuln-badge vuln-badge--safe">✓ Seguro</span>;
  const parts = [];
  if (item.osv_critical > 0) parts.push(`${item.osv_critical}C`);
  if (item.osv_high > 0) parts.push(`${item.osv_high}H`);
  if (item.osv_medium > 0) parts.push(`${item.osv_medium}M`);
  if (item.osv_low > 0) parts.push(`${item.osv_low}L`);
  const label = parts.length > 0 ? ` (${parts.join(' ')})` : '';
  const severity = item.osv_critical > 0 ? 'critical' : item.osv_high > 0 ? 'high' : 'medium';
  return <span className={`vuln-badge vuln-badge--${severity}`}>{count} vuln{count > 1 ? 's' : ''}{label}</span>;
}

/* ── Hook de ordenación ──────────────────────────────────────────────────── */

function useSortableData(items) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return items;
    return [...items].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'boolean') { aVal = aVal ? 1 : 0; bVal = bVal ? 1 : 0; }
      if (sortConfig.key.includes('date') || sortConfig.key === 'fetched_at') {
        aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime();
      }
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal, 'es', { sensitivity: 'base' })
          : bVal.localeCompare(aVal, 'es', { sensitivity: 'base' });
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [items, sortConfig]);

  const requestSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const getSortIndicator = useCallback((key) => {
    if (sortConfig.key !== key) return <span className="sort-icon sort-icon--inactive">⇅</span>;
    return <span className="sort-icon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  }, [sortConfig]);

  return { sortedItems, requestSort, getSortIndicator };
}

/* ── Stat animado con countUp ──────────────────────────────────────────────── */
function AnimatedStat({ value, label, color }) {
  const numRef = useRef(null);
  const counterRef = useRef({ val: 0 });

  useGSAP(() => {
    if (numRef.current == null || value == null) return;
    gsap.to(counterRef.current, {
      val: value,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate() {
        if (numRef.current) numRef.current.textContent = Math.round(counterRef.current.val);
      },
    });
  }, { dependencies: [value] });

  return (
    <div className="stat-item">
      <div className="stat-number" style={{ color }} ref={numRef}>0</div>
      <div className="stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</div>
    </div>
  );
}

/* ── Componentes ─────────────────────────────────────────────────────────── */

function ServerCards({ servers, onNavigateToProject }) {
  if (!servers.length) return null;
  return (
    <div className="stack-servers">
      {servers.map((s, i) => (
        <motion.div
          key={s.id}
          className="stack-server-card"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="stack-server-card__header">
            <h3>{s.name}</h3>
            <span className="server-ip">{s.ip}</span>
          </div>
          <div className="stack-server-card__body">
            <div className="stack-row"><span className="stack-label">OS</span><span>{s.os} {s.os_version}</span></div>
            <div className="stack-row"><span className="stack-label">CPU</span><span>{s.cpu_count} vCPU · {s.cpu}</span></div>
            <div className="stack-row"><span className="stack-label">RAM</span><span>{s.ram_gb} GB</span></div>
            {s.disk_gb && <div className="stack-row"><span className="stack-label">Disco</span><span>{s.disk_gb} GB ({s.disk_usage_pct}%)</span></div>}
            {s.uptime_days != null && <div className="stack-row"><span className="stack-label">Uptime</span><span>{s.uptime_days} días</span></div>}
            {s.environment && <div className="stack-row"><span className="stack-label">Entorno</span><span className={`cat-badge cat-badge--${s.environment}`}>{s.environment}</span></div>}
          </div>
          <div className="stack-server-card__footer">
            <a href={`#stack-${s.name}`} className="server-stack-link" onClick={(e) => { e.preventDefault(); onNavigateToProject(s.name); }}>Ver stack →</a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SortableHeader({ label, sortKey, requestSort, getSortIndicator }) {
  return (
    <th className="sortable-th" onClick={() => requestSort(sortKey)}>
      <span className="sortable-th__label">{label}</span>
      {getSortIndicator(sortKey)}
    </th>
  );
}

function StackTable({ stack, showProject }) {
  const { sortedItems, requestSort, getSortIndicator } = useSortableData(stack);
  if (!stack.length) return <p>No hay datos de stack. Ejecuta una sincronización.</p>;

  return (
    <div className="stack-table-wrapper">
      <table className="stack-table">
        <thead>
          <tr>
            {showProject && <SortableHeader label="Proyecto" sortKey="project_label" requestSort={requestSort} getSortIndicator={getSortIndicator} />}
            <SortableHeader label="Tecnología" sortKey="product_label" requestSort={requestSort} getSortIndicator={getSortIndicator} />
            <SortableHeader label="Categoría" sortKey="category" requestSort={requestSort} getSortIndicator={getSortIndicator} />
            <SortableHeader label="Versión actual" sortKey="current_version" requestSort={requestSort} getSortIndicator={getSortIndicator} />
            <SortableHeader label="Última disponible" sortKey="latest_version" requestSort={requestSort} getSortIndicator={getSortIndicator} />
            <SortableHeader label="Fecha release" sortKey="release_date" requestSort={requestSort} getSortIndicator={getSortIndicator} />
            <SortableHeader label="Fin EOL" sortKey="eol_date" requestSort={requestSort} getSortIndicator={getSortIndicator} />
            <SortableHeader label="Estado" sortKey="is_eol" requestSort={requestSort} getSortIndicator={getSortIndicator} />
            <SortableHeader label="Vulns (OSV)" sortKey="osv_count" requestSort={requestSort} getSortIndicator={getSortIndicator} />
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item, i) => {
            const days = daysUntil(item.eol_date);
            const eolWarning = days !== null && days > 0 && days < 180;
            return (
              <tr key={i} className={item.is_eol ? 'row--eol' : eolWarning ? 'row--warning' : ''}>
                {showProject && <td><strong>{item.project_label || item.project_name}</strong></td>}
                <td>
                  {item.product_label}
                  {item.is_lts && <span className="lts-tag">LTS</span>}
                </td>
                <td><span className={`cat-badge cat-badge--${item.category}`}>{item.category}</span></td>
                <td><code>{item.current_version}</code></td>
                <VersionCompare current={item.current_version} latest={item.latest_version} />
                <td>{formatDate(item.release_date)}</td>
                <EolDateCell item={item} />
                <td><StatusBadge item={item} /></td>
                <td><VulnBadge item={item} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SyncButton({ onSync, onVulnCheck, lastSync }) {
  const [loading, setLoading] = useState(false);
  const [vulnLoading, setVulnLoading] = useState(false);
  const handleSync = async () => {
    setLoading(true);
    try {
      await onSync();
    } finally {
      setLoading(false);
    }
  };
  const handleVulnCheck = async () => {
    setVulnLoading(true);
    try {
      await onVulnCheck();
    } finally {
      setVulnLoading(false);
    }
  };
  return (
    <div className="sync-bar">
      <button
        className="button button--primary button--sm"
        onClick={handleSync}
        disabled={loading || vulnLoading}
      >
        {loading ? '⏳ Sincronizando...' : '🔄 Sincronizar con endoflife.date'}
      </button>
      <button
        className="button button--warning button--sm"
        onClick={handleVulnCheck}
        disabled={loading || vulnLoading}
        style={{ marginLeft: '0.5rem' }}
      >
        {vulnLoading ? '⏳ Chequeando...' : '🛡️ Chequear vulnerabilidades'}
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
  const [view, setView] = useState('by-project');

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

  const handleVulnCheck = async () => {
    try {
      await fetch(`${API_BASE}/vuln/check`, { method: 'POST' });
      await fetchData();
    } catch (err) {
      setError('Error al chequear vulnerabilidades: ' + err.message);
    }
  };

  // Stats
  const eolCount = stack.filter((s) => s.is_eol).length;
  const eoasCount = stack.filter((s) => s.is_eoas && !s.is_eol).length;
  const okCount = stack.filter((s) => !s.is_eol && !s.is_eoas).length;
  const ltsCount = stack.filter((s) => s.is_lts).length;
  const vulnCount = stack.filter((s) => s.osv_count > 0).length;

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
            <AnimatedStat value={eolCount}      color="#FF4848"  label="EOL" />
            <AnimatedStat value={eoasCount}     color="#FFBA00"  label="Soporte limitado" />
            <AnimatedStat value={okCount}       color="#1AA04F"  label="Soportados" />
            <AnimatedStat value={ltsCount}      color="#60a5fa"  label="LTS" />
            <AnimatedStat value={servers.length} color="#fff"    label="Servidores" />
            <AnimatedStat value={vulnCount}     color="#f97316"  label="Con vulns" />
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

        <SyncButton onSync={handleSync} onVulnCheck={handleVulnCheck} lastSync={syncStatus} />

        {loading ? (
          <p style={{textAlign: 'center', padding: '3rem'}}>Cargando datos...</p>
        ) : (
          <>
            {/* Servidores */}
            <section style={{margin: '2rem 0'}}>
              <div className="section-label">🖥️ Servidores</div>
              <ServerCards servers={servers} onNavigateToProject={(name) => { setView('by-project'); setTimeout(() => { const el = document.getElementById('stack-' + name); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }} />
            </section>

            {/* Vista toggle */}
            <section>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <div className="section-label" style={{margin: 0}}>📦 Stack Tecnológico</div>
                <div className="button-group">
                  <button
                    className={`button button--sm ${view === 'by-project' ? 'button--primary' : 'button--outline button--primary'}`}
                    onClick={() => setView('by-project')}
                  >Por proyecto</button>
                  <button
                    className={`button button--sm ${view === 'all' ? 'button--primary' : 'button--outline button--primary'}`}
                    onClick={() => setView('all')}
                  >Vista global</button>
                </div>
              </div>

              {view === 'all' ? (
                <StackTable stack={stack} showProject />
              ) : (
                Object.entries(byProject).map(([name, { label, items }]) => {
                  const projEol = items.filter((i) => i.is_eol).length;
                  const projEoas = items.filter((i) => i.is_eoas && !i.is_eol).length;
                  return (
                    <div key={name} id={`stack-${name}`} style={{marginBottom: '2rem', scrollMarginTop: '80px'}}>
                      <div className="project-section-header">
                        <h3>{label}</h3>
                        <div className="project-section-stats">
                          {projEol > 0 && <span className="eol-badge eol-badge--eol">{projEol} EOL</span>}
                          {projEoas > 0 && <span className="eol-badge eol-badge--eoas">{projEoas} limitado</span>}
                          <span className="eol-badge eol-badge--ok">{items.length - projEol - projEoas} ok</span>
                        </div>
                      </div>
                      <StackTable stack={items} showProject={false} />
                    </div>
                  );
                })
              )}
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}
