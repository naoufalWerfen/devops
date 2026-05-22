import React, { useEffect, useState, useCallback } from 'react';
import Layout from '@theme/Layout';

const API = 'http://localhost:3001/api';

/* ── Severity helpers ──────────────────────────────────────────────────── */

const SEV_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#2563eb',
  info: '#6b7280',
};

const SEV_ORDER = ['critical', 'high', 'medium', 'low', 'info'];

const STATUS_OPTIONS = [
  'open', 'fixed', 'ignored', 'reDiscovered', 'falsePositive',
  'fixedUnconfirmed', 'notChecked', 'notFound',
];

const ASSET_TYPES = ['target', 'repository', 'project'];

function sevBadge(severity) {
  const s = (severity || '').toLowerCase();
  return (
    <span
      style={{
        background: SEV_COLORS[s] || '#6b7280',
        color: '#fff',
        padding: '0.15rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}
    >
      {severity}
    </span>
  );
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ── Summary Cards ─────────────────────────────────────────────────────── */

function SummaryCards({ summary }) {
  if (!summary) return null;
  return (
    <div className="invicti-summary-cards">
      <div className="invicti-card">
        <div className="invicti-card__value">{summary.totalAssets}</div>
        <div className="invicti-card__label">Assets</div>
      </div>
      <div className="invicti-card">
        <div className="invicti-card__value">{summary.totalVulnerabilities}</div>
        <div className="invicti-card__label">Vulnerabilidades</div>
      </div>
      {SEV_ORDER.map(s => (
        <div className="invicti-card" key={s} style={{ borderTop: `3px solid ${SEV_COLORS[s]}` }}>
          <div className="invicti-card__value">{summary.severity?.[s] || 0}</div>
          <div className="invicti-card__label" style={{ textTransform: 'capitalize' }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Actionable Dashboard ──────────────────────────────────────────────── */

function daysAgo(ts) {
  if (!ts) return '—';
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (d === 0) return 'hoy';
  if (d === 1) return '1 día';
  return `${d} días`;
}

function copyToClipboard(text, showToast) {
  navigator.clipboard.writeText(text).then(
    () => showToast && showToast('📋 Copiado al portapapeles'),
    () => {}
  );
}

function DashboardView({ dashboard, onNavigateVuln, onNavigateAsset, showToast }) {
  if (!dashboard) return null;
  const { totals, openBySeverity, urgent, assetsAtRisk, oldestOpen, recent, topCwe } = dashboard;

  return (
    <div className="invicti-dashboard">
      {/* KPI strip */}
      <div className="invicti-kpi-strip">
        <div className="invicti-kpi invicti-kpi--danger">
          <div className="invicti-kpi__value">{totals.urgentCount}</div>
          <div className="invicti-kpi__label">🔥 Urgentes (Crit+High abiertas)</div>
        </div>
        <div className="invicti-kpi">
          <div className="invicti-kpi__value">{totals.openVulns}</div>
          <div className="invicti-kpi__label">Abiertas</div>
        </div>
        <div className="invicti-kpi">
          <div className="invicti-kpi__value">{totals.confirmedVulns}</div>
          <div className="invicti-kpi__label">Confirmadas</div>
        </div>
        <div className="invicti-kpi">
          <div className="invicti-kpi__value">{totals.assets}</div>
          <div className="invicti-kpi__label">Assets</div>
        </div>
        {SEV_ORDER.map(s => (
          <div className="invicti-kpi" key={s} style={{ borderLeft: `3px solid ${SEV_COLORS[s]}` }}>
            <div className="invicti-kpi__value" style={{ color: SEV_COLORS[s] }}>{openBySeverity[s] || 0}</div>
            <div className="invicti-kpi__label" style={{ textTransform: 'capitalize' }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="invicti-dash-grid">
        {/* LEFT: Urgent vulns */}
        <div className="invicti-dash-panel">
          <h3>🚨 Acción Inmediata — Critical & High abiertas</h3>
          {urgent.length === 0 ? (
            <p className="invicti-empty-msg">✅ Sin vulnerabilidades críticas ni altas abiertas</p>
          ) : (
            <div className="invicti-priority-list">
              {urgent.map(v => (
                <div key={v.id} className={`invicti-priority-item invicti-priority-item--${v.severity}`}>
                  <div className="invicti-priority-item__header">
                    {sevBadge(v.severity)}
                    <strong style={{ marginLeft: 8, flex: 1 }}>{v.name}</strong>
                    {v.confirmed && <span title="Confirmado" style={{ fontSize: '0.9rem' }}>✅</span>}
                    {v.cvss3_score != null && (
                      <span className="invicti-cvss-badge" title="CVSS v3">
                        {v.cvss3_score}
                      </span>
                    )}
                  </div>
                  <div className="invicti-priority-item__meta">
                    <span title={v.asset_url || ''}>{v.asset_name || '—'}</span>
                    <span>·</span>
                    <span title="Días abierta">⏱ {daysAgo(v.first_seen)}</span>
                    {v.cwe?.length > 0 && <span>· {v.cwe.join(', ')}</span>}
                  </div>
                  {v.url && (
                    <div className="invicti-priority-item__url">
                      <code>{v.url}</code>
                      <button
                        className="invicti-btn-icon"
                        onClick={() => copyToClipboard(v.url, showToast)}
                        title="Copiar URL"
                      >📋</button>
                    </div>
                  )}
                  {v.parameter && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
                      Parámetro: <code>{v.parameter}</code>
                    </div>
                  )}
                  <div className="invicti-priority-item__actions">
                    <button className="invicti-btn invicti-btn--sm" onClick={() => onNavigateVuln(v.id)}>
                      🔍 Detalle
                    </button>
                    {v.url && (
                      <button className="invicti-btn invicti-btn--sm" onClick={() => copyToClipboard(v.url, showToast)}>
                        📋 Copiar URL
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Assets at risk */}
        <div className="invicti-dash-panel">
          <h3>🎯 Assets con Mayor Riesgo</h3>
          {assetsAtRisk.length === 0 ? (
            <p className="invicti-empty-msg">Sin assets con vulnerabilidades abiertas</p>
          ) : (
            <div className="invicti-risk-list">
              {assetsAtRisk.map(a => (
                <div key={a.id} className="invicti-risk-item">
                  <div className="invicti-risk-item__header">
                    <strong>{a.name}</strong>
                    <span className="invicti-risk-item__type">{a.asset_type}</span>
                  </div>
                  {a.url && (
                    <div className="invicti-risk-item__url">
                      <code>{a.url}</code>
                      <button className="invicti-btn-icon" onClick={() => copyToClipboard(a.url, showToast)} title="Copiar URL">📋</button>
                    </div>
                  )}
                  <div className="invicti-risk-item__bars">
                    {parseInt(a.critical) > 0 && <span className="invicti-sev-pill invicti-sev-pill--critical">{a.critical} critical</span>}
                    {parseInt(a.high) > 0 && <span className="invicti-sev-pill invicti-sev-pill--high">{a.high} high</span>}
                    {parseInt(a.medium) > 0 && <span className="invicti-sev-pill invicti-sev-pill--medium">{a.medium} medium</span>}
                    <span style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-500)' }}>{a.total_vulns} total</span>
                  </div>
                  <button
                    className="invicti-btn invicti-btn--sm"
                    onClick={() => onNavigateAsset(a.id)}
                    style={{ marginTop: '0.25rem' }}
                  >
                    🔓 Ver Vulns
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Top CWE */}
          {topCwe.length > 0 && (
            <>
              <h3 style={{ marginTop: '1.5rem' }}>📊 Debilidades más comunes (CWE)</h3>
              <div className="invicti-cwe-list">
                {topCwe.map(c => (
                  <div key={c.cwe_id} className="invicti-cwe-item">
                    <a href={`https://cwe.mitre.org/data/definitions/${c.cwe_id.replace('CWE-','')}.html`}
                       target="_blank" rel="noopener noreferrer" className="invicti-cwe-link">
                      {c.cwe_id}
                    </a>
                    <div className="invicti-cwe-bar">
                      <div className="invicti-cwe-bar__fill"
                           style={{ width: `${Math.min(100, (parseInt(c.count) / parseInt(topCwe[0].count)) * 100)}%` }}></div>
                    </div>
                    <span className="invicti-cwe-count">{c.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="invicti-dash-grid">
        {/* Oldest open — tech debt */}
        <div className="invicti-dash-panel">
          <h3>⏳ Deuda Técnica — Vulnerabilidades más antiguas sin resolver</h3>
          {oldestOpen.length === 0 ? (
            <p className="invicti-empty-msg">Sin deuda técnica de seguridad</p>
          ) : (
            <table className="invicti-table invicti-table--compact">
              <thead>
                <tr><th>Vulnerabilidad</th><th>Sev.</th><th>CVSS</th><th>Asset</th><th>Días abierta</th><th></th></tr>
              </thead>
              <tbody>
                {oldestOpen.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.name}</strong></td>
                    <td>{sevBadge(v.severity)}</td>
                    <td>{v.cvss3_score ?? '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{v.asset_name || '—'}</td>
                    <td><strong style={{ color: parseInt(v.days_open) > 90 ? '#dc2626' : parseInt(v.days_open) > 30 ? '#d97706' : 'inherit' }}>{v.days_open}d</strong></td>
                    <td>
                      <button className="invicti-btn invicti-btn--sm" onClick={() => onNavigateVuln(v.id)}>🔍</button>
                      {v.url && <button className="invicti-btn-icon" onClick={() => copyToClipboard(v.url, showToast)} title="Copiar URL">📋</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent */}
        <div className="invicti-dash-panel">
          <h3>🆕 Descubiertas en los últimos 30 días</h3>
          {recent.length === 0 ? (
            <p className="invicti-empty-msg">Sin nuevas vulnerabilidades abiertas en 30 días</p>
          ) : (
            <table className="invicti-table invicti-table--compact">
              <thead>
                <tr><th>Vulnerabilidad</th><th>Sev.</th><th>Asset</th><th>Descubierta</th><th></th></tr>
              </thead>
              <tbody>
                {recent.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.name}</strong></td>
                    <td>{sevBadge(v.severity)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{v.asset_name || '—'}</td>
                    <td>{daysAgo(v.first_seen)}</td>
                    <td>
                      <button className="invicti-btn invicti-btn--sm" onClick={() => onNavigateVuln(v.id)}>🔍</button>
                      {v.url && <button className="invicti-btn-icon" onClick={() => copyToClipboard(v.url, showToast)} title="Copiar URL">📋</button>}
                    </td>
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

/* ── Vulnerability Detail Modal ────────────────────────────────────────── */

function VulnDetailModal({ vulnId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [cweData, setCweData] = useState({});
  const [cweLoading, setCweLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (!vulnId) return;
    fetch(`${API}/invicti/vulnerabilities/${vulnId}`)
      .then(r => r.json())
      .then(d => {
        setDetail(d);
        setLoading(false);
        // Auto-fetch CWE enrichment
        const cwes = d.classification?.cwe || [];
        if (cwes.length > 0) {
          setCweLoading(true);
          Promise.all(
            cwes.map(id =>
              fetch(`${API}/invicti/cwe/${encodeURIComponent(id)}`)
                .then(r => r.json())
                .catch(() => null)
            )
          ).then(results => {
            const map = {};
            results.forEach((r, i) => { if (r && r.id) map[r.id] = r; });
            setCweData(map);
            setCweLoading(false);
          });
        }
      })
      .catch(() => setLoading(false));
  }, [vulnId]);

  if (!vulnId) return null;

  const cweEntries = Object.values(cweData);

  return (
    <div className="invicti-modal-overlay" onClick={onClose}>
      <div className="invicti-modal invicti-modal--wide" onClick={e => e.stopPropagation()}>
        <button className="invicti-modal__close" onClick={onClose}>✕</button>
        {loading ? (
          <p>Cargando detalle…</p>
        ) : !detail ? (
          <p>Error al cargar</p>
        ) : (
          <>
            <h2>{detail.name || 'Vulnerabilidad'}</h2>

            {/* Mini tabs inside modal */}
            <div className="invicti-modal-tabs">
              {[
                { key: 'info', label: '📋 Info' },
                { key: 'cwe', label: `🧠 CWE${cweLoading ? ' ⏳' : cweEntries.length ? ` (${cweEntries.length})` : ''}` },
                { key: 'mitigations', label: '🛡️ Qué hacer' },
              ].map(t => (
                <button
                  key={t.key}
                  className={`invicti-modal-tab ${activeTab === t.key ? 'invicti-modal-tab--active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB: Info */}
            {activeTab === 'info' && (
              <>
                <div className="invicti-detail-grid">
                  <div><strong>Severidad:</strong> {sevBadge(detail.severity)}</div>
                  <div><strong>Estado:</strong> {detail.status || '—'}</div>
                  <div><strong>Confirmado:</strong> {detail.confirmed ? 'Sí' : 'No'}</div>
                  <div><strong>Confianza:</strong> {detail.confidence != null ? `${detail.confidence}%` : '—'}</div>
                  <div><strong>Primera vez:</strong> {formatDate(detail.firstSeen)}</div>
                  <div><strong>Última vez:</strong> {formatDate(detail.lastSeen)}</div>
                  {detail.score?.cvss3 && (
                    <div><strong>CVSS v3:</strong> {detail.score.cvss3.score} — <code style={{ fontSize: '0.8rem' }}>{detail.score.cvss3.vector}</code></div>
                  )}
                  {detail.score?.cvss2?.score > 0 && (
                    <div><strong>CVSS v2:</strong> {detail.score.cvss2.score}</div>
                  )}
                  {detail.classification?.cwe?.length > 0 && (
                    <div><strong>CWE:</strong> {detail.classification.cwe.map(c => (
                      <a key={c} href={`https://cwe.mitre.org/data/definitions/${c.replace('CWE-','')}.html`}
                         target="_blank" rel="noopener noreferrer"
                         style={{ marginRight: 6 }}>{c}</a>
                    ))}</div>
                  )}
                  {detail.classification?.cve?.length > 0 && (
                    <div><strong>CVE:</strong> {detail.classification.cve.join(', ')}</div>
                  )}
                  {detail.isRetestable != null && (
                    <div><strong>Re-testable:</strong> {detail.isRetestable ? 'Sí' : 'No'}</div>
                  )}
                </div>

                {detail.dast && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Detección DAST:</strong>
                    <div className="invicti-detail-grid" style={{ marginTop: '0.5rem' }}>
                      {detail.dast.url && <div><strong>URL:</strong> <code style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{detail.dast.url}</code></div>}
                      {detail.dast.parameter && <div><strong>Parámetro:</strong> <code>{detail.dast.parameter}</code></div>}
                      {detail.dast.method && <div><strong>Método:</strong> {detail.dast.method}</div>}
                      {detail.dast.attack && <div><strong>Ataque:</strong> <code style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{detail.dast.attack}</code></div>}
                    </div>
                  </div>
                )}

                {detail.source && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Fuente:</strong>
                    <div className="invicti-detail-grid" style={{ marginTop: '0.5rem' }}>
                      {detail.source.system && <div><strong>Sistema:</strong> {detail.source.system}</div>}
                      {detail.source.module && <div><strong>Módulo:</strong> <code style={{ fontSize: '0.8rem' }}>{detail.source.module}</code></div>}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB: CWE Details */}
            {activeTab === 'cwe' && (
              <div className="invicti-cwe-detail">
                {cweLoading ? (
                  <p>⏳ Consultando MITRE CWE API…</p>
                ) : cweEntries.length === 0 ? (
                  <p className="invicti-empty-msg">Sin datos CWE asociados a esta vulnerabilidad</p>
                ) : cweEntries.map(cwe => (
                  <div key={cwe.id} className="invicti-cwe-detail-block">
                    <h3>
                      <a href={cwe.url} target="_blank" rel="noopener noreferrer">{cwe.id}</a>
                      {' — '}{cwe.name}
                    </h3>
                    {cwe.likelihood && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Probabilidad de explotación:</strong>{' '}
                        <span className={`invicti-likelihood invicti-likelihood--${(cwe.likelihood || '').toLowerCase()}`}>
                          {cwe.likelihood}
                        </span>
                      </div>
                    )}
                    <p style={{ lineHeight: 1.6 }}>{cwe.description}</p>
                    {cwe.extendedDescription && (
                      <p style={{ lineHeight: 1.6, color: 'var(--ifm-color-emphasis-700)' }}>{cwe.extendedDescription.replace(/<[^>]+>/g, '')}</p>
                    )}

                    {/* Consequences */}
                    {cwe.consequences?.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong>⚠️ Consecuencias:</strong>
                        <div className="invicti-cwe-consequences">
                          {cwe.consequences.map((c, i) => (
                            <div key={i} className="invicti-cwe-consequence">
                              <div className="invicti-cwe-consequence__scope">
                                {(c.Scope || []).join(', ')}
                              </div>
                              <div className="invicti-cwe-consequence__impact">
                                {(c.Impact || []).join(', ')}
                              </div>
                              {c.Note && <div className="invicti-cwe-consequence__note">{c.Note}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detection */}
                    {cwe.detection?.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong>🔍 Métodos de detección:</strong>
                        {cwe.detection.map((d, i) => (
                          <div key={i} className="invicti-cwe-detection">
                            <strong>{d.Method}</strong>
                            {d.Description && <p>{d.Description.replace(/<[^>]+>/g, '').slice(0, 500)}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Real-world examples */}
                    {cwe.examples?.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong>📝 Ejemplos reales (CVE):</strong>
                        <div className="invicti-cwe-examples">
                          {cwe.examples.map((ex, i) => (
                            <div key={i} className="invicti-cwe-example">
                              <a href={`https://nvd.nist.gov/vuln/detail/${ex.Reference}`}
                                 target="_blank" rel="noopener noreferrer"
                                 className="invicti-cwe-example__ref">
                                {ex.Reference}
                              </a>
                              <span>{ex.Description?.replace(/<[^>]+>/g, '').slice(0, 200)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CAPEC attack patterns */}
                    {cwe.attackPatterns?.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong>🎯 Patrones de ataque (CAPEC):</strong>
                        <div style={{ marginTop: '0.25rem' }}>
                          {cwe.attackPatterns.map(id => (
                            <a key={id} href={`https://capec.mitre.org/data/definitions/${id}.html`}
                               target="_blank" rel="noopener noreferrer"
                               className="invicti-capec-link">
                              CAPEC-{id}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB: What to do */}
            {activeTab === 'mitigations' && (
              <div className="invicti-mitigations">
                {cweLoading ? (
                  <p>⏳ Consultando MITRE CWE API…</p>
                ) : cweEntries.length === 0 || cweEntries.every(c => !c.mitigations?.length) ? (
                  <div className="invicti-empty-msg">
                    <p>No hay mitigaciones disponibles desde MITRE para los CWE de esta vulnerabilidad.</p>
                    {detail.classification?.cwe?.length > 0 && (
                      <p>Consulta directamente: {detail.classification.cwe.map(c => (
                        <a key={c} href={`https://cwe.mitre.org/data/definitions/${c.replace('CWE-','')}.html`}
                           target="_blank" rel="noopener noreferrer"
                           style={{ marginRight: 8 }}>{c}</a>
                      ))}</p>
                    )}
                  </div>
                ) : cweEntries.map(cwe => (
                  cwe.mitigations?.length > 0 && (
                    <div key={cwe.id} className="invicti-mitigation-block">
                      <h3>🛡️ Mitigaciones para {cwe.id} — {cwe.name}</h3>
                      {cwe.mitigations.map((m, i) => (
                        <div key={i} className="invicti-mitigation-item">
                          <div className="invicti-mitigation-item__header">
                            {m.Phase && (
                              <span className="invicti-mitigation-phase">
                                {Array.isArray(m.Phase) ? m.Phase.join(', ') : m.Phase}
                              </span>
                            )}
                            {m.Strategy && (
                              <span className="invicti-mitigation-strategy">{m.Strategy}</span>
                            )}
                          </div>
                          {m.Description && (
                            <p className="invicti-mitigation-desc">
                              {m.Description.replace(/<[^>]+>/g, '')}
                            </p>
                          )}
                          {m.Effectiveness && (
                            <div className="invicti-mitigation-effectiveness">
                              Efectividad: <strong>{m.Effectiveness}</strong>
                              {m.EffectivenessNotes && <span> — {m.EffectivenessNotes.replace(/<[^>]+>/g, '')}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Asset Stats Modal ──────────────────────────────────────────────────── */

function AssetStatsModal({ assetId, assetName, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assetId) return;
    fetch(`${API}/invicti/assets/${assetId}/stats`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [assetId]);

  if (!assetId) return null;

  return (
    <div className="invicti-modal-overlay" onClick={onClose}>
      <div className="invicti-modal" onClick={e => e.stopPropagation()}>
        <button className="invicti-modal__close" onClick={onClose}>✕</button>
        <h2>Stats: {assetName}</h2>
        {loading ? (
          <p>Cargando…</p>
        ) : !stats ? (
          <p>Sin datos</p>
        ) : (
          <div className="invicti-detail-grid">
            <div><strong>Último scan:</strong> {formatDate(stats.lastScanDate)}</div>
            <div><strong>Threat:</strong> {stats.threat || '—'}</div>
            {stats.severityCounts && SEV_ORDER.map(s => (
              <div key={s}>
                {sevBadge(s)} <strong style={{ marginLeft: 8 }}>{stats.severityCounts[s] || 0}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════════════════════ */

export default function InvictiPage() {
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [tab, setTab] = useState('summary');
  const [toast, setToast] = useState(null);

  // Data
  const [summary, setSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [assets, setAssets] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  // Filters
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssetId, setFilterAssetId] = useState('');
  const [filterAssetType, setFilterAssetType] = useState('');
  const [searchText, setSearchText] = useState('');

  // Modals
  const [vulnModal, setVulnModal] = useState(null);
  const [assetStatsModal, setAssetStatsModal] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial load
  useEffect(() => {
    fetch(`${API}/invicti/status`).then(r => r.json()).then(d => {
      if (!d.configured) {
        setConfigured(false);
        setLoading(false);
        return;
      }
      setLastSync(d.lastSync);
      if (d.hasCachedData) {
        Promise.all([
          fetch(`${API}/invicti/summary`).then(r => r.json()),
          fetch(`${API}/invicti/dashboard`).then(r => r.json()),
        ]).then(([s, db]) => {
          setSummary(s);
          setDashboard(db);
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => { setConfigured(false); setLoading(false); });
  }, []);

  // Sync from Invicti API
  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    showToast('🔄 Sincronizando con Invicti…');
    try {
      const r = await fetch(`${API}/invicti/sync`, { method: 'POST' });
      const d = await r.json();
      if (d.error) {
        showToast(`❌ Error: ${d.error}`, 'error');
      } else {
        showToast(`✅ Sincronizado: ${d.assets} assets, ${d.vulnerabilities} vulnerabilidades`);
        const [s, db] = await Promise.all([
          fetch(`${API}/invicti/summary`).then(r2 => r2.json()),
          fetch(`${API}/invicti/dashboard`).then(r2 => r2.json()),
        ]);
        setSummary(s);
        setDashboard(db);
        setLastSync({ at: new Date().toISOString(), assets: d.assets, vulns: d.vulnerabilities, status: 'success' });
        loadTab(tab);
      }
    } catch (err) {
      showToast(`❌ Error de red: ${err.message}`, 'error');
    }
    setSyncing(false);
  };

  // Export current vulns to CSV
  const exportCSV = () => {
    if (vulnerabilities.length === 0) return;
    const headers = ['Nombre','Severidad','Estado','CVSS','Confirmado','CWE','Asset','URL','Primera vez','Última vez'];
    const rows = vulnerabilities.map(v => [
      v.name, v.severity, v.status, v.cvss3_score ?? '', v.confirmed ? 'Sí' : 'No',
      (v.cwe || []).join('; '), v.asset_name || '', v.url || '',
      v.first_seen || '', v.last_seen || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invicti-vulns-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 CSV descargado');
  };

  // Tab data loading
  const loadTab = useCallback((t) => {
    setTab(t);
    switch (t) {
      case 'assets':
        loadAssets();
        break;
      case 'vulnerabilities':
        loadVulnerabilities();
        break;
      case 'technologies':
        fetch(`${API}/invicti/technologies`).then(r => r.json())
          .then(d => setTechnologies(d.items || d || []))
          .catch(() => showToast('Error cargando tecnologías', 'error'));
        break;
      case 'environments':
        fetch(`${API}/invicti/environments`).then(r => r.json())
          .then(d => setEnvironments(d.items || d || []))
          .catch(() => showToast('Error cargando entornos', 'error'));
        break;
      case 'workspaces':
        fetch(`${API}/invicti/workspaces`).then(r => r.json())
          .then(d => setWorkspaces(d.items || d || []))
          .catch(() => showToast('Error cargando workspaces', 'error'));
        break;
      default:
        break;
    }
  }, [filterSeverity, filterStatus, filterAssetId, filterAssetType]);

  const loadAssets = useCallback(() => {
    const qs = new URLSearchParams();
    if (filterAssetType) qs.append('assetType', filterAssetType);
    fetch(`${API}/invicti/assets?${qs}`).then(r => r.json())
      .then(d => setAssets(Array.isArray(d) ? d : d.items || []))
      .catch(() => showToast('Error cargando assets', 'error'));
  }, [filterAssetType]);

  const loadVulnerabilities = useCallback(() => {
    const qs = new URLSearchParams();
    if (filterSeverity) qs.append('severity', filterSeverity);
    if (filterStatus) qs.append('status', filterStatus);
    if (filterAssetId) qs.append('assetId', filterAssetId);
    fetch(`${API}/invicti/vulnerabilities?${qs}`).then(r => r.json())
      .then(d => setVulnerabilities(Array.isArray(d) ? d : d.items || []))
      .catch(() => showToast('Error cargando vulnerabilidades', 'error'));
  }, [filterSeverity, filterStatus, filterAssetId]);

  // Client-side text search filter
  const filteredVulns = React.useMemo(() => {
    if (!searchText.trim()) return vulnerabilities;
    const q = searchText.toLowerCase();
    return vulnerabilities.filter(v =>
      (v.name || '').toLowerCase().includes(q) ||
      (v.url || '').toLowerCase().includes(q) ||
      (v.asset_name || '').toLowerCase().includes(q) ||
      (v.cwe || []).join(' ').toLowerCase().includes(q) ||
      (v.severity || '').toLowerCase().includes(q) ||
      (v.status || '').toLowerCase().includes(q) ||
      (v.parameter || '').toLowerCase().includes(q)
    );
  }, [vulnerabilities, searchText]);

  // Reload when filters change for current tab
  useEffect(() => {
    if (tab === 'assets') loadAssets();
  }, [filterAssetType]);

  useEffect(() => {
    if (tab === 'vulnerabilities') loadVulnerabilities();
  }, [filterSeverity, filterStatus, filterAssetId]);

  if (loading) {
    return (
      <Layout title="Invicti" description="Invicti AppSec Dashboard">
        <div className="invicti-page"><p className="invicti-loading-msg">Cargando datos de Invicti…</p></div>
      </Layout>
    );
  }

  if (!configured) {
    return (
      <Layout title="Invicti" description="Invicti AppSec Dashboard">
        <div className="invicti-page">
          <div className="invicti-header">
            <h1>🛡️ Invicti AppSec</h1>
          </div>
          <div className="invicti-not-configured">
            <h2>⚠️ Invicti no configurado</h2>
            <p>
              Configura las variables de entorno <code>INVICTI_API_BASE_URL</code> y{' '}
              <code>INVICTI_API_TOKEN</code> en el archivo <code>.env</code> y reinicia el contenedor API.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const TABS = [
    { key: 'summary', label: '📊 Resumen' },
    { key: 'assets', label: '🎯 Assets' },
    { key: 'vulnerabilities', label: '🔓 Vulnerabilidades' },
    { key: 'technologies', label: '💻 Tecnologías' },
    { key: 'environments', label: '🌍 Entornos' },
    { key: 'workspaces', label: '📁 Workspaces' },
  ];

  return (
    <Layout title="Invicti" description="Invicti AppSec Dashboard">
      <div className="invicti-page">
        {/* Toast */}
        {toast && (
          <div className={`invicti-toast invicti-toast--${toast.type}`}>{toast.msg}</div>
        )}

        {/* Header */}
        <div className="invicti-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0 }}>🛡️ Invicti AppSec</h1>
              <p className="invicti-subtitle">
                Security scanning & vulnerability management
                {lastSync && lastSync.status === 'success' && (
                  <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-500)' }}>
                    Última sync: {formatDate(lastSync.at)} — {lastSync.assets} assets, {lastSync.vulns} vulns
                  </span>
                )}
              </p>
            </div>
            <button
              className={`invicti-btn invicti-btn--scan ${syncing ? 'invicti-btn--syncing' : ''}`}
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? '🔄 Sincronizando…' : '🔄 Sincronizar con Invicti'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="invicti-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`invicti-tab ${tab === t.key ? 'invicti-tab--active' : ''}`}
              onClick={() => loadTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'summary' && (
          <>
            {!dashboard || !dashboard.totals || dashboard.totals.assets === 0 ? (
              <div className="invicti-not-configured">
                <h2>📦 Sin datos en caché</h2>
                <p>Pulsa el botón <strong>🔄 Sincronizar con Invicti</strong> para descargar los datos de assets y vulnerabilidades.</p>
              </div>
            ) : (
              <DashboardView
                dashboard={dashboard}
                onNavigateVuln={(id) => setVulnModal(id)}
                onNavigateAsset={(id) => { setFilterAssetId(id); loadTab('vulnerabilities'); }}
                showToast={showToast}
              />
            )}
          </>
        )}

        {tab === 'assets' && (
          <div className="invicti-section">
            <h2>Assets ({assets.length})</h2>
            <div className="invicti-filters">
              <select value={filterAssetType} onChange={e => setFilterAssetType(e.target.value)}>
                <option value="">Todos los tipos</option>
                {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="invicti-table-wrap">
              <table className="invicti-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>URL / Path</th>
                    <th>Business Impact</th>
                    <th>Orígenes</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.length === 0 ? (
                    <tr><td colSpan={6} style={{textAlign:'center'}}>Sin datos — sincroniza primero</td></tr>
                  ) : assets.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.name || '—'}</strong></td>
                      <td>{a.asset_type || '—'}</td>
                      <td style={{maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        <code>{a.url || '—'}</code>
                      </td>
                      <td>{a.business_impact || '—'}</td>
                      <td>
                        {(a.origin_types || []).map(t => (
                          <span key={t} className="invicti-scan-type-badge">{t}</span>
                        ))}
                      </td>
                      <td style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          className="invicti-btn invicti-btn--sm"
                          onClick={() => setAssetStatsModal({ id: a.id, name: a.name })}
                          title="Ver estadísticas del asset"
                        >
                          📊 Stats
                        </button>
                        <button
                          className="invicti-btn invicti-btn--sm"
                          onClick={() => { setFilterAssetId(a.id); loadTab('vulnerabilities'); }}
                          title="Ver vulnerabilidades de este asset"
                        >
                          🔓 Vulns
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'vulnerabilities' && (
          <div className="invicti-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2>Vulnerabilidades ({filteredVulns.length})</h2>
              <button className="invicti-btn invicti-btn--sm" onClick={exportCSV} disabled={filteredVulns.length === 0}>
                📥 Exportar CSV
              </button>
            </div>
            <div className="invicti-filters">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre, URL, asset, CWE..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="invicti-search-input"
              />
              <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
                <option value="">Todas las severidades</option>
                {SEV_ORDER.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Todos los estados</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {filterAssetId && (
                <button className="invicti-btn invicti-btn--sm" onClick={() => setFilterAssetId('')}>
                  ✕ Quitar filtro asset
                </button>
              )}
            </div>
            <div className="invicti-table-wrap">
              <table className="invicti-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Severidad</th>
                    <th>Estado</th>
                    <th>CVSS</th>
                    <th>Confirmado</th>
                    <th>CWE</th>
                    <th>Asset</th>
                    <th>URL</th>
                    <th>Días abierta</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVulns.length === 0 ? (
                    <tr><td colSpan={10} style={{textAlign:'center'}}>Sin datos — sincroniza primero</td></tr>
                  ) : filteredVulns.map(v => (
                    <tr key={v.id} className={v.severity === 'critical' ? 'invicti-row--critical' : v.severity === 'high' ? 'invicti-row--high' : ''}>
                      <td><strong>{v.name || '—'}</strong></td>
                      <td>{sevBadge(v.severity)}</td>
                      <td>{v.status || '—'}</td>
                      <td>{v.cvss3_score ?? '—'}</td>
                      <td>{v.confirmed ? '✅' : '—'}</td>
                      <td>{(v.cwe || []).join(', ') || '—'}</td>
                      <td style={{ fontSize: '0.8rem' }}>{v.asset_name || '—'}</td>
                      <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {v.url ? (
                          <>
                            <code style={{ fontSize: '0.75rem' }}>{v.url}</code>
                            <button className="invicti-btn-icon" onClick={() => copyToClipboard(v.url, showToast)} title="Copiar">📋</button>
                          </>
                        ) : '—'}
                      </td>
                      <td>{v.first_seen ? daysAgo(v.first_seen) : '—'}</td>
                      <td>
                        <button
                          className="invicti-btn invicti-btn--sm"
                          onClick={() => setVulnModal(v.id)}
                          title="Ver detalle"
                        >
                          🔍
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'technologies' && (
          <div className="invicti-section">
            <h2>Tecnologías ({technologies.length})</h2>
            <div className="invicti-table-wrap">
              <table className="invicti-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Versión</th>
                    <th>Categoría</th>
                    <th>Assets</th>
                  </tr>
                </thead>
                <tbody>
                  {technologies.length === 0 ? (
                    <tr><td colSpan={4} style={{textAlign:'center'}}>Sin datos</td></tr>
                  ) : technologies.map((t, i) => (
                    <tr key={t.id || i}>
                      <td><strong>{t.name || '—'}</strong></td>
                      <td>{t.version || '—'}</td>
                      <td>{t.category || '—'}</td>
                      <td>{t.assetCount ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'environments' && (
          <div className="invicti-section">
            <h2>Entornos ({environments.length})</h2>
            <div className="invicti-table-wrap">
              <table className="invicti-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Assets</th>
                  </tr>
                </thead>
                <tbody>
                  {environments.length === 0 ? (
                    <tr><td colSpan={3} style={{textAlign:'center'}}>Sin datos</td></tr>
                  ) : environments.map((e, i) => (
                    <tr key={e.id || i}>
                      <td><strong>{e.name || '—'}</strong></td>
                      <td>{e.description || '—'}</td>
                      <td>{e.assetCount ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'workspaces' && (
          <div className="invicti-section">
            <h2>Workspaces ({workspaces.length})</h2>
            <div className="invicti-table-wrap">
              <table className="invicti-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Critical</th>
                    <th>High</th>
                    <th>Medium</th>
                    <th>Low</th>
                    <th>Info</th>
                    <th>Scan Types</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.length === 0 ? (
                    <tr><td colSpan={7} style={{textAlign:'center'}}>Sin datos</td></tr>
                  ) : workspaces.map((w, i) => {
                    const sc = w.stats?.severityCounts || {};
                    const scanTypes = w.scanTypes || w.availableScanTypes || [];
                    return (
                      <tr key={w.id || i}>
                        <td><strong>{w.name || '—'}</strong></td>
                        <td style={{ color: SEV_COLORS.critical, fontWeight: 600 }}>{sc.critical || 0}</td>
                        <td style={{ color: SEV_COLORS.high, fontWeight: 600 }}>{sc.high || 0}</td>
                        <td style={{ color: SEV_COLORS.medium, fontWeight: 600 }}>{sc.medium || 0}</td>
                        <td style={{ color: SEV_COLORS.low, fontWeight: 600 }}>{sc.low || 0}</td>
                        <td style={{ color: SEV_COLORS.info, fontWeight: 600 }}>{sc.info || 0}</td>
                        <td>
                          {Array.isArray(scanTypes) && scanTypes.length > 0
                            ? scanTypes.map(st => (
                                <span key={st} className="invicti-scan-type-badge">{st}</span>
                              ))
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Manual scan buttons section */}
            <div className="invicti-scan-section">
              <h3>🚀 Ejecutar Scan Manual</h3>
              <p className="invicti-subtitle">
                Selecciona un tipo de scan y ejecútalo manualmente. Los tipos disponibles dependen de la configuración de Invicti.
              </p>
              <div className="invicti-scan-types">
                <div className="invicti-scan-type-card">
                  <h4>🌐 DAST</h4>
                  <p>Dynamic Application Security Testing — escaneo de aplicaciones web en ejecución.</p>
                  <button className="invicti-btn invicti-btn--scan" disabled title="Configura un target en Invicti para habilitar">
                    Ejecutar DAST Scan
                  </button>
                </div>
                <div className="invicti-scan-type-card">
                  <h4>🔍 SAST</h4>
                  <p>Static Application Security Testing — análisis de código fuente.</p>
                  <button className="invicti-btn invicti-btn--scan" disabled title="Configura un repositorio en Invicti para habilitar">
                    Ejecutar SAST Scan
                  </button>
                </div>
                <div className="invicti-scan-type-card">
                  <h4>📦 SCA</h4>
                  <p>Software Composition Analysis — análisis de dependencias y librerías.</p>
                  <button className="invicti-btn invicti-btn--scan" disabled title="Configura un proyecto en Invicti para habilitar">
                    Ejecutar SCA Scan
                  </button>
                </div>
                <div className="invicti-scan-type-card">
                  <h4>🐳 Container</h4>
                  <p>Container Security — escaneo de imágenes de contenedor.</p>
                  <button className="invicti-btn invicti-btn--scan" disabled title="Configura un container en Invicti para habilitar">
                    Ejecutar Container Scan
                  </button>
                </div>
              </div>
              <p className="invicti-scan-note">
                ⚠️ Los scans se ejecutan desde la consola de Invicti. Los botones estarán habilitados cuando se configure la API de ejecución de scans.
              </p>
            </div>
          </div>
        )}

        {/* Modals */}
        {vulnModal && <VulnDetailModal vulnId={vulnModal} onClose={() => setVulnModal(null)} />}
        {assetStatsModal && (
          <AssetStatsModal
            assetId={assetStatsModal.id}
            assetName={assetStatsModal.name}
            onClose={() => setAssetStatsModal(null)}
          />
        )}
      </div>
    </Layout>
  );
}
