// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Werfen DevOps',
  tagline: 'Documentación centralizada de servidores, proyectos y entornos',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'http://localhost',
  baseUrl: '/',

  organizationName: 'Werfen-D-A',
  projectName: 'devops-docs',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/werfen-social-card.png',
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Werfen DevOps',
        style: 'dark',
        logo: {
          alt: 'Werfen Logo',
          src: 'img/werfen-logo.svg',
        },
        items: [
          {
            to: '/stack',
            position: 'left',
            label: '📊 Stack & Servidores',
          },
          {
            to: '/import',
            position: 'left',
            label: '📥 Importar',
          },
          {
            to: '/audit',
            position: 'left',
            label: '🔍 Auditoría Remota',
          },
          {
            type: 'docSidebar',
            sidebarId: 'distributorsPortalSidebar',
            position: 'left',
            label: '📦 Distributors Portal',
          },
          {
            type: 'docSidebar',
            sidebarId: 'accrivaTicketsSidebar',
            position: 'left',
            label: '🎫 Accriva Tickets',
          },
          {
            type: 'docSidebar',
            sidebarId: 'myOrdersSidebar',
            position: 'left',
            label: '🛒 MyOrders',
          },
          {
            href: 'https://github.com/Werfen-D-A',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Proyectos',
            items: [
              {
                label: 'Distributors Portal',
                to: '/docs/distributors-portal/',
              },
              {
                label: 'Accriva Tickets',
                to: '/docs/accriva-tickets/',
              },
              {
                label: 'MyOrders',
                to: '/docs/myorders/',
              },
            ],
          },
          {
            title: 'Áreas',
            items: [
              {label: 'Server Info', to: '/docs/distributors-portal/test/server-info/server-overview'},
              {label: 'Web Stack', to: '/docs/distributors-portal/test/web-stack/full-report'},
              {label: 'Cybersecurity', to: '/docs/distributors-portal/test/cybersecurity/'},
            ],
          },
          {
            title: 'Recursos',
            items: [
              {
                label: 'Stack & Servidores',
                to: '/stack',
              },
              {
                label: 'GitHub — Werfen D&A',
                href: 'https://github.com/Werfen-D-A',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Werfen DevOps — Documentación interna`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'nginx', 'ini', 'log', 'json', 'php', 'sql'],
      },
      mermaid: {
        theme: {light: 'neutral', dark: 'dark'},
      },
    }),
};

export default config;
