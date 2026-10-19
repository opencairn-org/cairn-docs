# Changelog

All notable changes to the Cairn documentation site are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/). Dates are
ISO-8601. The site version tracks the Cairn release it documents.

## [0.3.5] — 2026-10-20

Documents Cairn core v0.3.3 with the provider workers strava v0.3.2 / garmin
v0.3.2 (unchanged).

### Changed
- Favicon is the Cairn icon from cairn-core (SVG with PNG, ICO and
  apple-touch-icon fallbacks) instead of the Docusaurus default.
- Snapshot 0.3.5.

## [0.3.4] — 2026-10-19

Documents Cairn core v0.3.3 with the provider workers strava v0.3.2 / garmin
v0.3.2.

### Changed
- All repository links and image references point to the `opencairn-org`
  GitHub organization and `ghcr.io/opencairn-org`.
- Self-host → Overview, Kubernetes, Configuration, Providers: core pinned to
  v0.3.3, workers to v0.3.2; "Upgrading to 0.3.3" (the image registry move).
- Snapshot 0.3.4.

## [0.3.3] — 2026-10-15

Documents Cairn core v0.3.2 with the provider workers strava v0.3.1 / garmin
v0.3.1.

### Changed
- Self-host → Providers: any well-formed provider type (1–48 of
  `[a-z0-9_-]`) can be enrolled, not only `strava` and `garmin`; the admin
  sets it on the enrollment, and `providers` in the enrollment list are
  suggestions. The worker's configuration is `CAIRN_WORKER_NAME` plus the
  token from the admin. New section "Other providers": account linking for a
  new provider still needs core support.
- Architecture → Provider contract: the admin-set, format-checked provider.
- Self-host → Overview, Kubernetes, Configuration: core pinned to v0.3.2;
  "Upgrading to 0.3.2".
- Snapshot 0.3.3.

## [0.3.2] — 2026-10-15

Documents Cairn core v0.3.1 with the provider workers strava v0.3.1 / garmin
v0.3.1.

### Changed
- Self-host → Providers: both workers enroll with
  `CAIRN_WORKER_ENROLLMENT_TOKEN`; the Garmin section documents the token, and
  the static NATS user workaround for Garmin is gone (a short note keeps
  user/password for servers without the auth-callout). The auth-callout
  nats.conf drops the placeholder nkey user, which only Strava v0.3.0 and
  earlier need.
- Self-host → Overview, Kubernetes, Providers: worker images pinned to strava
  v0.3.1 and garmin v0.3.1; the Compose sketch passes one enrollment token per
  worker; upgrading to 0.3.1 covers the worker versions.
- Getting started: the Garmin worker's `CAIRN_WORKER_ENROLLMENT_TOKEN`.
- Architecture → Workers: auth-callout issues a provider-scoped user JWT.
- Snapshot 0.3.2.

## [0.3.1] — 2026-10-15

Documents Cairn core v0.3.1 with the provider workers strava v0.3.0 / garmin
v0.3.0.

### Added
- Self-host → Providers: NATS auth-callout setup (the nats.conf with the
  `auth_callout` block and the shared `CAIRN` account, the core settings, the
  static user for the Garmin worker) and the "re-enroll required" note.
- Self-host → Configuration: `CAIRN_NATS_AUTH_CALLOUT` and
  `CAIRN_NATS_WORKER_ACCOUNT`.
- Self-host → Overview: upgrading to 0.3.1.

### Changed
- Self-host → Providers: worker enrollments require `provider`; the API
  example and field list include it.
- Self-host → Kubernetes: the hardening steps for NATS auth now produce a
  working setup; core is pinned to v0.3.1.
- Snapshot 0.3.1.

## [0.3.0] — 2026-10-15

Documents Cairn core v0.3.0 and the provider workers strava v0.3.0 / garmin
v0.3.0.

### Added
- Self-host → Configuration: `cairn config help`, the request limits (4 MiB
  per Connect message, upload and attachment body caps, 1 MiB JSON and
  webhook bodies) and the outbound address guard with the ranges it refuses.
- Self-host → Providers: the NATS permission template auth-callout grants to
  enrolled workers, and the Garmin image's non-root user (uid/gid 10001) with
  the `/data` ownership note for mounted volumes.
- Self-host → Overview: upgrading from 0.2.x.
- Architecture → Pipeline: the full subject list and how core and the Strava
  worker pick JetStream or core NATS publish per subject.
- Versioned docs snapshot `0.3.0`.

### Changed
- Self-host → Configuration: only `CAIRN_`-prefixed variables are read, and an
  empty required variable fails startup; `CAIRN_NATS_URL=` disables NATS.
- Self-host: the Compose sketch, `docker run` examples and the Kubernetes
  image pins reference core, Strava and Garmin v0.3.0 instead of `latest`; the
  bundle's own pins lag behind and are overridden in `kustomization.yaml`.
- Architecture → Provider contract: job consumers filter on the exact
  `cairn.jobs.<job_type>.<provider>` subject, workers stay within the
  permission template, and publishes are routed per subject.
- Getting started: Go 1.27, and the Garmin worker runs with uv.

### Fixed
- `CAIRN_STORAGE_PRESIGN_TTL` and `CAIRN_STORAGE_TRANSFER_EXPIRY_DAYS`
  describe what the server uses them for, and the Garmin worker defaults for
  `CAIRN_WORKER_INSTANCE_ID`, `CAIRN_GARTH_HOME` and `CAIRN_PROTO_PATH` match
  its configuration, as does the Strava worker's instance id.

## [0.2.6] — 2026-10-15

Documents Cairn core v0.2.6 and the provider workers strava v0.2.4 / garmin
v0.2.2.

### Added
- Self-host → Providers: `POST /api/admin/worker-enrollments/{id}/prolong`,
  and the optional JSON bodies of revoke and prolong.
- Versioned docs snapshot `0.2.6`.

### Changed
- Self-host → Providers: a request body that is not valid JSON is answered
  with `400`; leaving the body out still works.
- `npm run check` gates every change and deploy: Prettier, ESLint, the full
  site build, dependency audit, licenses, gitleaks. Node is pinned in `.nvmrc`
  and npm install scripts are disabled.
- The deploy workflow pins its actions by commit and keeps no credentials on
  disk.

### Fixed
- The enrollment example uses the path and body the server accepts, the
  Garmin worker defaults match its configuration, and the export routes are
  named `export.gpx` / `.tcx` / `.fit` plus `export/options`.
- `CAIRN_STRAVA_CLIENT_ID`, `CAIRN_STRAVA_CLIENT_SECRET` and
  `CAIRN_NATS_STREAM_RETENTION_DAYS` are gone from the reference; nothing
  read them.
- Self-host → Kubernetes lists all twelve manifests and the Garmin token store
  volume.

### Security
- Build dependencies updated within their ranges; npm overrides lift
  `serialize-javascript` to 7.x, `uuid` to 11.x and `tinypool` to 2.x, which
  the bundler and the dev server pin below their patched releases.

## [0.2.5.1] — 2026-09-11

Site only, no content change: a version switch in the navbar (with an "All
versions" entry), the `/versions` overview page, and clearer banners on older
snapshots. The newest release is the default everywhere.

## [0.2.5] — 2026-09-11

Documents Cairn core v0.2.5 and the provider workers strava v0.2.3 / garmin
v0.2.1.

### Added
- Using Cairn: the page becomes **Activities, filters & heatmap** — the heatmap
  view (`/heatmap`), its shared filter bar, the `GET /api/activities/heatmap`
  request and its 5000-activity ceiling, and "Regenerate map snapshot" on the
  Manage page.
- Versioned docs snapshot `0.2.5`.

### Changed
- Social & federation: `CAIRN_FEDERATION_ENABLED=false` now keeps federation
  fully dormant (no remote activities in feeds, no "Federated" filter,
  `GET /api/instance/features` reports it disabled).
- The intro mentions the heatmap.

## [0.2.4] — 2026-09-11

Documents Cairn core v0.2.4 (2026-08-28).

### Added
- Activities → Manage: the export options (`?exclude=gps,heart_rate,…` on
  `GET /api/activities/{id}/export.gpx` / `.tcx` / `.fit`, and
  `GET /api/activities/{id}/export/options`) that strip data before download.
- Self-host → Configuration → Maps: `CAIRN_MAP_TILE_URL`,
  `CAIRN_MAP_USER_AGENT` and `CAIRN_MAP_TIMEOUT` for the server-rendered
  snapshot, which no longer uses a fixed basemap.
- Self-host overview mentions the map tile settings.
- Versioned docs snapshot `0.2.4`.

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

[0.3.5]: https://github.com/opencairn-org/cairn-docs/releases/tag/v0.3.5
[0.3.4]: https://github.com/opencairn-org/cairn-docs/releases/tag/v0.3.4
[0.2.0]: https://github.com/johnnycube/cairn-docs/releases/tag/v0.2.0
