// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cairn Docs',
  tagline: 'Self-host, use, and extend your multi-source activity tracker',
  // The Cairn icon from cairn-core (web/static); SVG first, PNG/ICO fallbacks
  favicon: 'img/favicon.svg',
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/img/favicon-32x32.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/img/favicon-16x16.png',
      },
    },
    {
      tagName: 'link',
      attributes: {rel: 'alternate icon', href: '/img/favicon.ico'},
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/apple-touch-icon.png',
      },
    },
  ],

  future: {
    v4: true,
  },

  url: 'https://docs.opencairn.org',
  baseUrl: '/',

  organizationName: 'opencairn-org',
  projectName: 'cairn-docs',

  onBrokenLinks: 'warn',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Diagrams in ```mermaid fences (architecture/worker-routing).
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/', // docs are the site root
          editUrl: 'https://github.com/opencairn-org/cairn-docs/tree/main/',
          // Versioned docs: each Cairn release gets a frozen snapshot under
          // versioned_docs/ (npx docusaurus docs:version X.Y.Z) and is
          // selectable from the navbar switch and /versions. The newest entry
          // in versions.json is served at the site root; docs/ is the
          // unreleased "Next" tree and is served under /next/.
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
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Docs',
          },
          {to: '/self-host/overview', label: 'Self-host', position: 'left'},
          {
            to: '/architecture/overview',
            label: 'Architecture',
            position: 'left',
          },
          {to: '/integrations/oauth', label: 'OAuth & MCP', position: 'left'},
          {
            type: 'docsVersionDropdown',
            position: 'right',
            className: 'navbar-version-switch',
            dropdownActiveClassDisabled: true,
            dropdownItemsAfter: [
              {type: 'html', value: '<hr class="dropdown-separator">'},
              {to: '/release-notes', label: 'Release notes'},
              {to: '/versions', label: 'All versions'},
            ],
          },
          {
            href: 'https://github.com/opencairn-org/cairn-core',
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
              {label: 'Release notes', to: '/release-notes'},
              {label: 'All versions', to: '/versions'},
            ],
          },
          {
            title: 'Project',
            items: [
              {
                label: 'cairn-core',
                href: 'https://github.com/opencairn-org/cairn-core',
              },
              {
                label: 'cairn-provider-strava',
                href: 'https://github.com/opencairn-org/cairn-provider-strava',
              },
              {
                label: 'cairn-provider-garmin',
                href: 'https://github.com/opencairn-org/cairn-provider-garmin',
              },
              {
                label: 'cairn-kmp (native app)',
                href: 'https://github.com/opencairn-org/cairn-kmp',
              },
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
