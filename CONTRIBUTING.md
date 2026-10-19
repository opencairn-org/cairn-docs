# Contributing to cairn-docs

Corrections and additions are welcome. Bugs in Cairn itself belong to
[cairn-core](https://github.com/opencairn-org/cairn-core).

## License of contributions

The documentation is CC BY-SA 4.0 (see [LICENSE](LICENSE)); by submitting a
change you license it under the same terms. Sign off every commit
(`git commit -s`) to assert the
[Developer Certificate of Origin](https://developercertificate.org/).

## Setup

- Node.js at the version in `.nvmrc` (`nvm use`), then `npm ci`. `.npmrc` sets
  `ignore-scripts=true`; the build needs no install scripts.
- `npm run tools` installs the pinned `fleetlint` and `gitleaks` (needs Go).
- `prek install` sets up the git hooks in `.pre-commit-config.yaml`: hygiene,
  secret scan, Prettier, ESLint and fleetlint on commit, conventional commit
  messages, `npm run check` before push.

## Working rules

- `npm start` serves the site with hot reload.
- `npm run check` must pass: Prettier and ESLint, the site build (every page
  of every version compiles), `npm audit` via audit-ci, the license allowlist,
  unused dependencies (knip), gitleaks and fleetlint. CI runs the same script.
- `docs/` is the unreleased "Next" tree. Released versions are frozen
  snapshots in `versioned_docs/`, created with
  `npx docusaurus docs:version X.Y.Z`; fix an error there too when it applies
  to that release.
- Prettier formats code and config only; MDX prose is not reformatted.
- Commit messages follow Conventional Commits (`docs:`, `fix:`, `chore:` ...).
