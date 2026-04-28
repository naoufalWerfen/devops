/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  distributorsPortalSidebar: [
    {
      type: 'doc',
      id: 'distributors-portal/index',
      label: '📦 Overview',
    },
    {
      type: 'category',
      label: '🧪 TEST — 10.120.204.25',
      collapsed: false,
      link: {type: 'doc', id: 'distributors-portal/test/index'},
      items: [
        {
          type: 'category',
          label: '🖥️ Infraestructura',
          collapsed: false,
          items: [
            {type: 'doc', id: 'distributors-portal/test/server-info/server-overview', label: 'Servidor & Red'},
            {type: 'doc', id: 'distributors-portal/test/database/index', label: 'MariaDB 10.11'},
          ],
        },
        {
          type: 'category',
          label: '🌐 Aplicación',
          collapsed: false,
          items: [
            {type: 'doc', id: 'distributors-portal/test/web-stack/full-report', label: 'Apache · PHP · Drupal'},
            {type: 'doc', id: 'distributors-portal/test/web-stack/logs', label: 'Mapa de Logs'},
            {type: 'doc', id: 'distributors-portal/test/web-stack/log-analysis', label: '📊 Análisis en Vivo'},
          ],
        },
        {
          type: 'category',
          label: '🔧 Operaciones',
          items: [
            {type: 'doc', id: 'distributors-portal/test/devops/index', label: 'DevOps & Deploy'},
            {type: 'doc', id: 'distributors-portal/test/cybersecurity/index', label: '🛡️ Seguridad'},
          ],
        },
      ],
    },
  ],
  accrivaTicketsSidebar: [
    {
      type: 'doc',
      id: 'accriva-tickets/index',
      label: '🎫 Overview',
    },
    {
      type: 'category',
      label: '🧪 TEST — 10.120.204.45',
      collapsed: false,
      link: {type: 'doc', id: 'accriva-tickets/test/index'},
      items: [
        {
          type: 'category',
          label: '🖥️ Infraestructura',
          collapsed: false,
          items: [
            {type: 'doc', id: 'accriva-tickets/test/server-info/server-overview', label: 'Servidor & Red'},
          ],
        },
        {
          type: 'category',
          label: '🌐 Aplicación',
          collapsed: false,
          items: [
            {type: 'doc', id: 'accriva-tickets/test/web-stack/full-report', label: 'Nginx · Node.js · React'},
            {type: 'doc', id: 'accriva-tickets/test/web-stack/logs', label: 'Mapa de Logs'},
            {type: 'doc', id: 'accriva-tickets/test/web-stack/log-analysis', label: '📊 Análisis en Vivo'},
          ],
        },
        {
          type: 'category',
          label: '🔧 Operaciones',
          items: [
            {type: 'doc', id: 'accriva-tickets/test/devops/index', label: 'DevOps & Deploy'},
            {type: 'doc', id: 'accriva-tickets/test/cybersecurity/index', label: '🛡️ Seguridad'},
          ],
        },
      ],
    },
  ],
  myOrdersSidebar: [
    {
      type: 'doc',
      id: 'myorders/index',
      label: '🛒 Overview',
    },
    {
      type: 'category',
      label: '🧪 DEMO — 10.120.204.93',
      collapsed: false,
      link: {type: 'doc', id: 'myorders/demo/index'},
      items: [
        {
          type: 'category',
          label: '🖥️ Infraestructura',
          collapsed: false,
          items: [
            {type: 'doc', id: 'myorders/demo/server-info/server-overview', label: 'Servidor & Red'},
          ],
        },
        {
          type: 'category',
          label: '🌐 Aplicación',
          collapsed: false,
          items: [
            {type: 'doc', id: 'myorders/demo/web-stack/full-report', label: 'Nginx · PHP · Symfony'},
            {type: 'doc', id: 'myorders/demo/web-stack/logs', label: 'Mapa de Logs'},
            {type: 'doc', id: 'myorders/demo/web-stack/log-analysis', label: '📊 Análisis en Vivo'},
            {type: 'doc', id: 'myorders/demo/web-stack/security-audit', label: '🔒 Auditoría de Seguridad'},
          ],
        },
        {
          type: 'category',
          label: '🔧 Operaciones',
          items: [
            {type: 'doc', id: 'myorders/demo/devops/index', label: 'DevOps & Deploy'},
            {type: 'doc', id: 'myorders/demo/cybersecurity/index', label: '🛡️ Seguridad'},
          ],
        },
      ],
    },
  ],
};

export default sidebars;
