import React, { useEffect, useState, useCallback } from 'react';
import Layout from '@theme/Layout';

const API = 'http://localhost:3001/api';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatDate(ts) {
  if (!ts) return '—';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(ms) {
  if (!ms) return '—';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function jenkinsColor(color) {
  if (!color) return { label: 'Sin datos', cls: 'jenkins-status--unknown', icon: '❓' };
  const base = color.replace('_anime', '');
  const building = color.endsWith('_anime');
  const map = {
    blue:     { label: building ? 'Construyendo' : 'OK',         cls: 'jenkins-status--ok',       icon: building ? '🔄' : '✅' },
    green:    { label: building ? 'Construyendo' : 'OK',         cls: 'jenkins-status--ok',       icon: building ? '🔄' : '✅' },
    red:      { label: building ? 'Construyendo' : 'Fallido',    cls: 'jenkins-status--fail',     icon: building ? '🔄' : '❌' },
    yellow:   { label: building ? 'Construyendo' : 'Inestable',  cls: 'jenkins-status--unstable', icon: building ? '🔄' : '⚠️' },
    disabled: { label: 'Deshabilitado',                          cls: 'jenkins-status--disabled', icon: '⏸️' },
    notbuilt: { label: 'Sin builds',                             cls: 'jenkins-status--unknown',  icon: '🔘' },
    aborted:  { label: 'Abortado',                               cls: 'jenkins-status--disabled', icon: '⏹️' },
  };
  return map[base] || { label: color, cls: 'jenkins-status--unknown', icon: '❓' };
}

function resultBadge(result) {
  const map = {
    SUCCESS:  { label: 'OK',        cls: 'jenkins-result--ok' },
    FAILURE:  { label: 'FALLIDO',   cls: 'jenkins-result--fail' },
    UNSTABLE: { label: 'INESTABLE', cls: 'jenkins-result--unstable' },
    ABORTED:  { label: 'ABORTADO',  cls: 'jenkins-result--aborted' },
    null:     { label: 'En curso…', cls: 'jenkins-result--building' },
  };
  const m = map[result] || map[null];
  return <span className={`jenkins-result ${m.cls}`}>{m.label}</span>;
}

function DeployTypeBadge({ type }) {
  if (!type) return null;
  const cls = {
    legacy: 'deploy-type--legacy',
    release: 'deploy-type--release',
    hotfix: 'deploy-type--hotfix',
  };
  return <span className={`deploy-type ${cls[type] || ''}`}>{type}</span>;
}

/* ── Componentes ─────────────────────────────────────────────────────────── */

function ProjectCard({ project, onSelect, isSelected }) {
  return (
    <div
      className={`jenkins-project-card ${isSelected ? 'jenkins-project-card--selected' : ''}`}
      onClick={() => onSelect(project.name)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(project.name)}
    >
      <div className="jenkins-project-card__name">{project.name}</div>
      <div className="jenkins-project-card__count">{project.job_count} jobs</div>
    </div>
  );
}

function JobRow({ job, onTrigger, onViewBuilds, triggerLoading }) {
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const r = await fetch(`${API}/jenkins/jobs/${job.id}/status`);
      const data = await r.json();
      setStatus(data);
    } catch { setStatus({ error: 'No se pudo conectar' }); }
    setStatusLoading(false);
  }, [job.id]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const sc = jenkinsColor(status?.color);

  return (
    <tr className="jenkins-job-row">
      <td>
        <div className="jenkins-job-name">
          <strong>{job.app_name}</strong>
          <DeployTypeBadge type={job.deploy_type} />
        </div>
      </td>
      <td>
        {statusLoading
          ? <span className="jenkins-loading">⏳</span>
          : status?.error
            ? <span className="jenkins-status jenkins-status--unknown" title={status.error}>⚠️ Error</span>
            : <span className={`jenkins-status ${sc.cls}`}>{sc.icon} {sc.label}</span>
        }
      </td>
      <td>
        {status?.lastBuild
          ? <>
              #{status.lastBuild.number} — {resultBadge(status.lastBuild.result)}
              <div className="jenkins-build-meta">
                {formatDate(status.lastBuild.timestamp)} · {formatDuration(status.lastBuild.duration)}
              </div>
            </>
          : '—'
        }
      </td>
      <td>{job.build_type}</td>
      <td>{job.requires_cab ? '✅' : '—'}</td>
      <td>{job.sap_id || '—'}</td>
      <td className="jenkins-actions">
        <button
          className="jenkins-btn jenkins-btn--info"
          onClick={() => onViewBuilds(job)}
          title="Ver historial de builds"
        >
          📋 Builds
        </button>
        <button
          className="jenkins-btn jenkins-btn--deploy"
          onClick={() => onTrigger(job)}
          disabled={triggerLoading === job.id}
          title="Triggear transport build"
        >
          {triggerLoading === job.id ? '⏳' : '🚀'} Deploy
        </button>
      </td>
    </tr>
  );
}

function BuildHistoryModal({ job, onClose }) {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/jenkins/jobs/${job.id}/builds?limit=20`)
      .then(r => r.json())
      .then(data => { setBuilds(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [job.id]);

  return (
    <div className="jenkins-modal-overlay" onClick={onClose}>
      <div className="jenkins-modal" onClick={e => e.stopPropagation()}>
        <div className="jenkins-modal__header">
          <h3>📋 Historial — {job.app_name}</h3>
          <button onClick={onClose} className="jenkins-modal__close">✕</button>
        </div>
        <div className="jenkins-modal__body">
          {loading ? (
            <p className="jenkins-loading-msg">Consultando Jenkins…</p>
          ) : builds.length === 0 ? (
            <p>No se encontraron builds.</p>
          ) : (
            <table className="jenkins-builds-table">
              <thead>
                <tr><th>#</th><th>Resultado</th><th>Fecha</th><th>Duración</th></tr>
              </thead>
              <tbody>
                {builds.map((b, i) => (
                  <tr key={i}>
                    <td>#{b.number}</td>
                    <td>{resultBadge(b.result)}</td>
                    <td>{formatDate(b.timestamp)}</td>
                    <td>{formatDuration(b.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function TokensPanel({ tokens }) {
  if (!tokens.length) return null;
  return (
    <div className="jenkins-tokens-panel">
      <h3>🔑 API Tokens</h3>
      <table className="jenkins-tokens-table">
        <thead>
          <tr><th>Nombre</th><th>Variable</th><th>Integración</th><th>Publicado</th><th>Expira</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {tokens.map(t => {
            const expired = t.expires_at && new Date(t.expires_at) < new Date();
            return (
              <tr key={t.id}>
                <td><code>{t.token_name}</code></td>
                <td><code>{t.env_var}</code></td>
                <td>{t.integration || '—'}</td>
                <td>{formatDate(t.published_at)}</td>
                <td className={expired ? 'token-expired' : ''}>{formatDate(t.expires_at)} {expired && '⚠️'}</td>
                <td>{t.is_active ? '✅ Activo' : '❌ Inactivo'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function JenkinsPage() {
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(null);
  const [buildModal, setBuildModal] = useState(null);
  const [toast, setToast] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      fetch(`${API}/jenkins/projects`).then(r => r.json()),
      fetch(`${API}/jenkins/tokens`).then(r => r.json()),
    ]).then(([p, t]) => {
      setProjects(p);
      setTokens(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Cargar jobs al seleccionar proyecto
  useEffect(() => {
    if (!selectedProject) {
      fetch(`${API}/jenkins/jobs`).then(r => r.json()).then(setJobs);
      return;
    }
    fetch(`${API}/jenkins/jobs?project=${encodeURIComponent(selectedProject)}`)
      .then(r => r.json()).then(setJobs);
  }, [selectedProject]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleTrigger = async (job) => {
    if (!window.confirm(`¿Triggear deploy de "${job.app_name}"?\n\nEsto lanzará un build en Jenkins.`)) return;
    setTriggerLoading(job.id);
    try {
      const r = await fetch(`${API}/jenkins/jobs/${job.id}/trigger`, { method: 'POST' });
      const data = await r.json();
      if (data.error) {
        showToast(`❌ Error: ${data.error}`, 'error');
      } else {
        showToast(`🚀 Build triggered: ${job.app_name}`);
      }
    } catch (err) {
      showToast(`❌ Error de red: ${err.message}`, 'error');
    }
    setTriggerLoading(null);
  };

  if (loading) {
    return (
      <Layout title="Jenkins Transports" description="Dashboard de transport jobs de Jenkins">
        <div className="jenkins-page"><p className="jenkins-loading-msg">Cargando datos de Jenkins…</p></div>
      </Layout>
    );
  }

  const filteredJobs = jobs;
  const projectGroups = {};
  filteredJobs.forEach(j => {
    const pn = j.project_name || 'Sin proyecto';
    if (!projectGroups[pn]) projectGroups[pn] = [];
    projectGroups[pn].push(j);
  });

  return (
    <Layout title="Jenkins Transports" description="Dashboard de transport jobs de Jenkins">
      <div className="jenkins-page">
        {/* Toast */}
        {toast && (
          <div className={`jenkins-toast jenkins-toast--${toast.type}`}>{toast.msg}</div>
        )}

        {/* Header */}
        <div className="jenkins-header">
          <h1>🔧 Jenkins Transports</h1>
          <p className="jenkins-subtitle">
            {projects.length} proyectos · {jobs.length} transport jobs
          </p>
        </div>

        {/* Proyectos */}
        <div className="jenkins-projects">
          <div
            className={`jenkins-project-card ${!selectedProject ? 'jenkins-project-card--selected' : ''}`}
            onClick={() => setSelectedProject(null)}
            role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(null)}
          >
            <div className="jenkins-project-card__name">Todos</div>
            <div className="jenkins-project-card__count">{projects.reduce((s, p) => s + parseInt(p.job_count), 0)} jobs</div>
          </div>
          {projects.map(p => (
            <ProjectCard
              key={p.id} project={p}
              onSelect={setSelectedProject}
              isSelected={selectedProject === p.name}
            />
          ))}
        </div>

        {/* Jobs agrupados */}
        {Object.entries(projectGroups).map(([pName, pJobs]) => (
          <div key={pName} className="jenkins-group">
            <h2 className="jenkins-group__title">{pName} <span className="jenkins-group__count">({pJobs.length})</span></h2>
            <div className="jenkins-table-wrap">
              <table className="jenkins-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Estado</th>
                    <th>Último Build</th>
                    <th>Tipo</th>
                    <th>CAB</th>
                    <th>SAP</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pJobs.map(job => (
                    <JobRow
                      key={job.id} job={job}
                      onTrigger={handleTrigger}
                      onViewBuilds={setBuildModal}
                      triggerLoading={triggerLoading}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Tokens */}
        <TokensPanel tokens={tokens} />

        {/* Modal de builds */}
        {buildModal && (
          <BuildHistoryModal job={buildModal} onClose={() => setBuildModal(null)} />
        )}
      </div>
    </Layout>
  );
}
