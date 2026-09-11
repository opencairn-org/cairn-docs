// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cairn Docs',
  tagline: 'Self-host, use, and extend your multi-source activity tracker',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.opencairn.org',
  baseUrl: '/',

  organizationName: 'johnnycube',
  projectName: 'cairn-docs',

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/', // docs are the site root
          editUrl: 'https://github.com/johnnycube/cairn-docs/tree/main/',
          // Versioned docs: each Cairn release gets a frozen snapshot under
          // versioned_docs/ (npm run docusaurus docs:version X.Y.Z) and is
          // selectable from the navbar. docs/ is the unreleased "Next" tree
          // and is served under /next/.
          lastVersion: '0.2.3',
          versions: {
            current: {label: 'Next', path: 'next', banner: 'unreleased'},
            '0.2.0': {label: '0.2.0 – 0.2.2'},
          },
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
      image: 'img/logo.svg',
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Cairn',
        logo: {
          alt: 'Cairn',
          src: 'img/logo.svg',
        },
        items: [
          {type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs'},
          {to: '/self-host/overview', label: 'Self-host', position: 'left'},
          {to: '/architecture/overview', label: 'Architecture', position: 'left'},
          {to: '/integrations/oauth', label: 'OAuth & MCP', position: 'left'},
          {type: 'docsVersionDropdown', position: 'right'},
          {
            href: 'https://github.com/johnnycube/cairn-core',
            label: 'Source',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Introduction', to: '/'},
              {label: 'Self-host', to: '/self-host/overview'},
              {label: 'Architecture', to: '/architecture/overview'},
              {label: 'OAuth & MCP', to: '/integrations/oauth'},
            ],
          },
          {
            title: 'Project',
            items: [
              {label: 'cairn-core', href: 'https://github.com/johnnycube/cairn-core'},
              {label: 'cairn-provider-strava', href: 'https://github.com/johnnycube/cairn-provider-strava'},
              {label: 'cairn-provider-garmin', href: 'https://github.com/johnnycube/cairn-provider-garmin'},
            ],
          },
          {
            title: 'More',
            items: [
              {label: 'Website', href: 'https://opencairn.org'},
              {label: 'Contact', href: 'mailto:contact@opencairn.org'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Cairn · AGPL-3.0 (providers & contract: Apache-2.0).`,
      },
      prism: {
        theme: prismThemes.oneLight,
        darkTheme: prismThemes.oneDark,
        additionalLanguages: ['bash', 'yaml', 'go', 'json', 'docker'],
      },
    }),
};

export default config;
