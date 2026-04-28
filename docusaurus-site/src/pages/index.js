import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const alerts = [
  {level: 'critical', icon: '🔴', text: 'Accriva Tickets — Node.js API en crash loop continuo (nodeserver.service)', link: '/docs/accriva-tickets/test/web-stack/log-analysis'},
  {level: 'critical', icon: '🔴', text: 'Accriva Tickets — SSL expirado desde 2020 (5+ años)', link: '/docs/accriva-tickets/test/cybersecurity/'},
  {level: 'critical', icon: '🔴', text: 'Accriva Tickets — Node.js ejecutándose como root', link: '/docs/accriva-tickets/test/cybersecurity/'},
  {level: 'critical', icon: '🔴', text: 'MyOrders — Firewall completamente abierto (iptables sin reglas)', link: '/docs/myorders/demo/cybersecurity/'},
  {level: 'critical', icon: '🔴', text: 'MyOrders — Demo y Producción en el mismo servidor', link: '/docs/myorders/demo/cybersecurity/'},
  {level: 'critical', icon: '🔴', text: 'MyOrders — PHP 8.1 EOL (sin parches de seguridad desde dic 2025)', link: '/docs/myorders/demo/web-stack/security-audit'},
  {level: 'critical', icon: '🔴', text: 'MyOrders — Symfony 6.1 EOL (sin soporte desde ene 2023, 3+ años)', link: '/docs/myorders/demo/web-stack/security-audit'},
  {level: 'critical', icon: '🔴', text: 'MyOrders — Nginx 1.21.5 obsoleto (dic 2021, 4+ años sin actualizar)', link: '/docs/myorders/demo/web-stack/security-audit'},
  {level: 'critical', icon: '🔴', text: 'MyOrders — Fuga de datos SAP en logs (customer IDs/usernames en claro)', link: '/docs/myorders/demo/web-stack/security-audit'},
  {level: 'critical', icon: '🔴', text: 'MyOrders — 3 escaneos de reconocimiento detectados (Nmap + fingerprinting)', link: '/docs/myorders/demo/web-stack/security-audit'},
  {level: 'warning', icon: '🟡', text: 'Accriva Tickets — Swap al 90%, kernel obsoleto (739 días)', link: '/docs/accriva-tickets/test/server-info/server-overview'},
  {level: 'warning', icon: '🟡', text: 'Distributors Portal — 535 días sin reinicio', link: '/docs/distributors-portal/test/server-info/server-overview'},
  {level: 'warning', icon: '🟡', text: 'MyOrders — Disco al 81%, build/app.js 404 en admin', link: '/docs/myorders/demo/server-info/server-overview'},
  {level: 'warning', icon: '🟡', text: 'MyOrders — Sin rate limiting, sin WAF, server_tokens on', link: '/docs/myorders/demo/web-stack/security-audit'},
  {level: 'warning', icon: '🟡', text: 'MyOrders — PHP-FPM saturado (max_children=10, 3-4 saturaciones/día)', link: '/docs/myorders/demo/web-stack/log-analysis'},
];

const servers = [
  {
    name: 'DISTRIBUTORSPORTALTEST',
    ip: '10.120.204.25',
    os: 'SLES 15 SP6',
    cpu: '1 vCPU Xeon Gold',
    ram: '31 GB (1.8 usada)',
    disk: '38 GB (53%)',
    uptime: '535 días',
    status: 'ok',
    statusText: 'Operativo',
    stack: 'Drupal 9 · PHP 7.4 · Apache · MariaDB',
    link: '/docs/distributors-portal/test/',
    findings: {critical: 0, high: 2, medium: 4, low: 2},
  },
  {
    name: 'ACCRIVATICKETSTEST',
    ip: '10.120.204.45',
    os: 'SLES 15 SP1',
    cpu: '1 vCPU Xeon Gold',
    ram: '7.5 GB (swap 90%)',
    disk: '40 GB',
    uptime: '739 días',
    status: 'critical',
    statusText: 'API caída',
    stack: 'React 16 · Node.js · Nginx · SAP',
    link: '/docs/accriva-tickets/test/',
    findings: {critical: 3, high: 3, medium: 5, low: 2},
  },
  {
    name: 'WEBAPPSPROD',
    ip: '10.120.204.93',
    os: 'SLES 15 SP6',
    cpu: '1 vCPU',
    ram: '15 GB (1.9 usada)',
    disk: '146 GB (81%)',
    uptime: '—',
    status: 'warning',
    statusText: 'Operativo',
    stack: 'Symfony 6.1 · PHP 8.1 · Nginx · MariaDB',
    link: '/docs/myorders/demo/',
    findings: {critical: 5, high: 4, medium: 4, low: 3},
  },
];

const quickLinks = [
  {icon: '📊', title: 'Logs en Vivo — Accriva', desc: 'Último análisis: 27 abril 2026', to: '/docs/accriva-tickets/test/web-stack/log-analysis'},
  {icon: '📊', title: 'Logs en Vivo — Distributors', desc: 'Análisis Apache + MariaDB', to: '/docs/distributors-portal/test/web-stack/log-analysis'},
  {icon: '🌐', title: 'MyOrders — Web Stack', desc: 'Symfony 6.1 · Nginx · MariaDB', to: '/docs/myorders/demo/web-stack/full-report'},
  {icon: '📊', title: 'Logs en Vivo — MyOrders', desc: '8 hallazgos del análisis de logs', to: '/docs/myorders/demo/web-stack/log-analysis'},
  {icon: '🔒', title: 'Auditoría Seguridad — MyOrders', desc: '14 hallazgos (3 críticos, versiones EOL)', to: '/docs/myorders/demo/web-stack/security-audit'},
  {icon: '🛡️', title: 'Seguridad — MyOrders', desc: '10 hallazgos (2 críticos)', to: '/docs/myorders/demo/cybersecurity/'},
  {icon: '🛡️', title: 'Seguridad — Accriva', desc: '13 hallazgos (3 críticos)', to: '/docs/accriva-tickets/test/cybersecurity/'},
  {icon: '🛡️', title: 'Seguridad — Distributors', desc: 'Auditoría completa', to: '/docs/distributors-portal/test/cybersecurity/'},
  {icon: '🌐', title: 'Web Stack — Accriva', desc: 'Nginx → Node.js → SAP', to: '/docs/accriva-tickets/test/web-stack/full-report'},
  {icon: '🌐', title: 'Web Stack — Distributors', desc: 'Apache → PHP → Drupal', to: '/docs/distributors-portal/test/web-stack/full-report'},
];

function ServerCard({server}) {
  const statusColors = {ok: '#22c55e', critical: '#FF4848', warning: '#FFBA00'};
  return (
    <div className="server-card">
      <div className="server-card__header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h3>{server.name}</h3>
            <span className="server-ip">{server.ip}</span>
          </div>
          <span style={{
            background: statusColors[server.status],
            color: '#fff',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 700,
          }}>{server.statusText}</span>
        </div>
      </div>
      <div className="server-card__body">
        <div className="server-card__row">
          <span className="server-card__label">OS</span>
          <span className="server-card__value">{server.os}</span>
        </div>
        <div className="server-card__row">
          <span className="server-card__label">CPU</span>
          <span className="server-card__value">{server.cpu}</span>
        </div>
        <div className="server-card__row">
          <span className="server-card__label">RAM</span>
          <span className="server-card__value">{server.ram}</span>
        </div>
        <div className="server-card__row">
          <span className="server-card__label">Disco</span>
          <span className="server-card__value">{server.disk}</span>
        </div>
        <div className="server-card__row">
          <span className="server-card__label">Uptime</span>
          <span className="server-card__value">{server.uptime}</span>
        </div>
        <div className="server-card__row">
          <span className="server-card__label">Stack</span>
          <span className="server-card__value" style={{fontSize: '0.78rem'}}>{server.stack}</span>
        </div>
        <div className="server-card__row">
          <span className="server-card__label">Hallazgos</span>
          <span style={{display: 'flex', gap: '4px'}}>
            {server.findings.critical > 0 && <span className="severity severity--critical">{server.findings.critical} CRI</span>}
            {server.findings.high > 0 && <span className="severity severity--high">{server.findings.high} HIGH</span>}
            {server.findings.medium > 0 && <span className="severity severity--medium">{server.findings.medium} MED</span>}
            {server.findings.low > 0 && <span className="severity severity--low">{server.findings.low} LOW</span>}
          </span>
        </div>
      </div>
      <div className="server-card__footer">
        <Link to={server.link}>🖥️ Overview</Link>
        <Link to={server.link + 'web-stack/full-report'}>🌐 Web Stack</Link>
        <Link to={server.link + 'cybersecurity/'}>🛡️ Security</Link>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Layout
      title="DevOps Dashboard"
      description="Dashboard centralizado de servidores y proyectos Werfen">

      {/* Hero */}
      <header className="hero--werfen">
        <div className="container">
          <Heading as="h1">Werfen DevOps</Heading>
          <p>
            Dashboard centralizado — estado de servidores, alertas de seguridad
            y documentación técnica por proyecto.
          </p>
          <div className="stats-bar" style={{justifyContent: 'flex-start', padding: '1rem 0 0'}}>
            <div className="stat-item">
              <div className="stat-number" style={{color: '#fff'}}>3</div>
              <div className="stat-label" style={{color: 'rgba(255,255,255,0.7)'}}>Servidores</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{color: '#FF4848'}}>10</div>
              <div className="stat-label" style={{color: 'rgba(255,255,255,0.7)'}}>Críticos</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{color: '#FFBA00'}}>5</div>
              <div className="stat-label" style={{color: 'rgba(255,255,255,0.7)'}}>Warnings</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{color: '#22c55e'}}>25</div>
              <div className="stat-label" style={{color: 'rgba(255,255,255,0.7)'}}>Docs</div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Active Alerts */}
        <section className="container" style={{marginTop: '2rem'}}>
          <div className="section-label">⚡ Alertas activas</div>
          {alerts.map((a, i) => (
            <Link key={i} to={a.link} style={{textDecoration: 'none', color: 'inherit'}}>
              <div className={`alert-banner alert-banner--${a.level}`}>
                <span className="alert-icon">{a.icon}</span>
                <span>{a.text}</span>
              </div>
            </Link>
          ))}
        </section>

        {/* Servers */}
        <section className="container" style={{padding: '1rem 0'}}>
          <div className="section-label">🖥️ Servidores</div>
          <div className="server-overview">
            {servers.map((s) => (
              <ServerCard key={s.name} server={s} />
            ))}
          </div>
        </section>

        {/* Quick Access */}
        <section className="container" style={{padding: '1rem 0 3rem'}}>
          <div className="section-label">🔗 Acceso rápido</div>
          <div className="quick-links">
            {quickLinks.map((ql) => (
              <Link key={ql.title} to={ql.to} className="quick-link">
                <span className="ql-icon">{ql.icon}</span>
                <span className="ql-text">
                  <span className="ql-title">{ql.title}</span>
                  <span className="ql-desc">{ql.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
