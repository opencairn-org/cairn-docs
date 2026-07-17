# cairn-docs

Documentation for [Cairn](https://github.com/johnnycube/cairn-core) — the
self-hosted, multi-source activity tracker. Published at
[docs.opencairn.org](https://docs.opencairn.org). Built with
[Docusaurus](https://docusaurus.io/).

## Prerequisites

Node.js ≥ 20.

## Install

```bash
npm ci
```

## Local development

```bash
npm start
```

Starts a local dev server with hot reload (default <http://localhost:3000>).

## Build

```bash
npm run build
```

Generates the static site into `build/`. Preview the production build with
`npm run serve`.

## Deployment

Deployment is automated: CI builds `build/` and rsyncs it to the static web
host on pushes to `main` (see `.gitea/workflows/deploy.yml`). There is no manual
`gh-pages` step. The canonical URL is set in `docusaurus.config.js`.

## License

The documentation content is licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) —
© The Cairn Authors. See [LICENSE](LICENSE).
The Cairn software itself is AGPL-3.0 (core) and Apache-2.0 (provider contract).
