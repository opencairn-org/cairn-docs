# Changelog

All notable changes to the Cairn documentation site are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/). Dates are
ISO-8601. The site version tracks the Cairn release it documents.

## [0.2.3] — 2026-09-11

Documents Cairn core v0.2.3 (2026-07-29). From this release on the site is
versioned: each core release gets a frozen snapshot selectable from the navbar,
unreleased edits live under **Next**. Snapshot `0.2.0` covers core 0.2.0
through 0.2.2 (0.2.1 and 0.2.2 were fix-only releases); snapshot `0.2.3` adds
the year filter.

### Added
- Using Cairn: **Activities & filters** — the filter bar (type, discipline,
  the year facet new in 0.2.3, date presets, ranges, flags, sort), paging via
  the URL, the interactive map and the static map snapshot, and the Manage page
  with GPX/TCX/FIT export.
- Self-host → Configuration: a complete reference of every `CAIRN_*` variable
  with defaults, grouped as the server reads them — including the previously
  undocumented Auth (session lifetimes, Argon2, OAuth server), OIDC sign-in
  providers, Maps, Geocoder, Instance, Scheduler and Federation groups and the
  HTTP rate limit.
- Self-host → Providers: variable tables for the Strava and Garmin workers.
- Social & federation: `CAIRN_FEDERATION_ALLOW_PRIVATE_HOSTS` for local
  testing between instances.

### Changed
- Getting started and the Compose sketch use the real dev ports (API `:8080`,
  web `:5173`) and the `dev.env.example` flow; the Garmin dev run shows the
  credential fallback.
- Self-host overview points at `CAIRN_INSTANCE_TRUSTED_PROXIES`.

## [0.2.0] — 2026-07-16

**First public release** of the documentation site (Docusaurus, served at
https://docs.opencairn.org), covering Cairn v0.2.0.

### Added
- Getting started and introduction.
- Self-hosting: overview (compose example), configuration reference,
  providers, Kubernetes.
- Using Cairn: import, merge, segments and efforts, social, training load.
- Architecture: overview, pipeline, workers, and the **normative provider
  worker contract**.
- Integrations: OAuth and MCP.

[0.2.0]: https://github.com/johnnycube/cairn-docs/releases/tag/v0.2.0
