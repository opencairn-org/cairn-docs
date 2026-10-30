// Pure builders for the Docker Compose configurator; no React, so node
// scripts can validate the generated files.

// Backing-service images, kept in step with cairn-core's deploy/k8s bundle
// and docker-compose.dev.yml.
const IMAGES = {
  postgres: 'timescale/timescaledb-ha:pg17-ts2.27',
  nats: 'nats:2.15.1-alpine',
  minio: 'minio/minio:RELEASE.2025-09-07T16-13-09Z',
  caddy: 'caddy:2.11.7-alpine',
};

// Fixed compose subnet so CAIRN_INSTANCE_TRUSTED_PROXIES can name it.
const SUBNET = '172.30.0.0/24';

const PLACEHOLDER = {
  postgres: 'CHANGE_ME_DB_PASSWORD',
  session: 'CHANGE_ME_SESSION_SECRET',
  master: 'CHANGE_ME_MASTER_KEY',
  admin: 'CHANGE_ME_ADMIN_PASSWORD',
  minio: 'CHANGE_ME_MINIO_SECRET',
  nats: 'CHANGE_ME_NATS_PASSWORD',
  webhook: 'CHANGE_ME_WEBHOOK_VERIFY_TOKEN',
};

function randomBytes(n) {
  const bytes = new Uint8Array(n);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

function randomHex(n) {
  return Array.from(randomBytes(n), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}

function randomBase64(n) {
  return btoa(String.fromCharCode(...randomBytes(n)));
}

// Same shape as the k8s secrets: openssl rand -base64 32 for the two crypto
// secrets, URL-safe hex for everything that lands in a URL or a config file.
export function generateSecrets() {
  return {
    postgres: randomHex(24),
    session: randomBase64(32),
    master: randomBase64(32),
    admin: randomHex(12),
    minio: randomHex(24),
    nats: randomHex(24),
    webhook: randomHex(16),
  };
}

function publicUrl(o) {
  return o.proxy === 'none' ? '${CAIRN_PUBLIC_URL}' : 'https://${CAIRN_DOMAIN}';
}

export function buildCompose(o) {
  const out = [];
  const push = (s) => out.push(s);
  const behindProxy = o.proxy !== 'none';

  push('name: cairn');
  push('');
  push('services:');

  // ---- core -------------------------------------------------------------
  push('  core:');
  push('    image: ghcr.io/opencairn-org/cairn-core:${CORE_TAG}');
  push('    restart: unless-stopped');
  push('    environment:');
  push(
    '      CAIRN_DATABASE_URL: postgres://cairn:${POSTGRES_PASSWORD}@postgres:5432/cairn?sslmode=disable',
  );
  push('      # single core instance: migrate on boot (see Upgrading below)');
  push('      CAIRN_DATABASE_AUTO_MIGRATE: "true"');
  push(`      CAIRN_HTTP_PUBLIC_BASE_URL: ${publicUrl(o)}`);
  push(`      CAIRN_INSTANCE_PUBLIC_URL: ${publicUrl(o)}`);
  if (behindProxy) {
    push(`      CAIRN_INSTANCE_TRUSTED_PROXIES: ${SUBNET}`);
  }
  push('      CAIRN_AUTH_SESSION_SECRET: ${CAIRN_AUTH_SESSION_SECRET}');
  push(
    '      CAIRN_AUTH_MASTER_ENCRYPTION_KEY: ${CAIRN_AUTH_MASTER_ENCRYPTION_KEY}',
  );
  push(
    '      CAIRN_INSTANCE_BOOTSTRAP_ADMIN_EMAIL: ${CAIRN_INSTANCE_BOOTSTRAP_ADMIN_EMAIL}',
  );
  push(
    '      CAIRN_INSTANCE_BOOTSTRAP_ADMIN_PASSWORD: ${CAIRN_INSTANCE_BOOTSTRAP_ADMIN_PASSWORD}',
  );
  push('      CAIRN_NATS_URL: nats://nats:4222');
  if (o.natsAuth) {
    push(
      '      # auth-callout: core bypasses the callout as the cairn-core user',
    );
    push('      CAIRN_NATS_USERNAME: cairn-core');
    push('      CAIRN_NATS_PASSWORD: ${CAIRN_NATS_PASSWORD}');
    push('      CAIRN_NATS_AUTH_CALLOUT: ${CAIRN_NATS_AUTH_CALLOUT:-false}');
    push('      CAIRN_NATS_WORKER_ACCOUNT: CAIRN');
  }
  if (o.storage === 'minio') {
    push('      CAIRN_STORAGE_ENDPOINT: http://minio:9000');
    push('      CAIRN_STORAGE_BUCKET: cairn');
    push('      CAIRN_STORAGE_ACCESS_KEY_ID: cairn');
    push('      CAIRN_STORAGE_SECRET_ACCESS_KEY: ${MINIO_ROOT_PASSWORD}');
  } else if (o.storage === 'external') {
    push('      CAIRN_STORAGE_ENDPOINT: ${CAIRN_STORAGE_ENDPOINT}');
    push('      CAIRN_STORAGE_REGION: ${CAIRN_STORAGE_REGION}');
    push('      CAIRN_STORAGE_BUCKET: ${CAIRN_STORAGE_BUCKET}');
    push('      CAIRN_STORAGE_ACCESS_KEY_ID: ${CAIRN_STORAGE_ACCESS_KEY_ID}');
    push(
      '      CAIRN_STORAGE_SECRET_ACCESS_KEY: ${CAIRN_STORAGE_SECRET_ACCESS_KEY}',
    );
    push('      CAIRN_STORAGE_USE_PATH_STYLE: ${CAIRN_STORAGE_USE_PATH_STYLE}');
  } else if (o.storage === 'none') {
    push('      CAIRN_STORAGE_DRIVER: none');
  }
  if (o.email === 'smtp') {
    push('      CAIRN_EMAIL_ADAPTER: smtp');
    push('      CAIRN_EMAIL_FROM_ADDRESS: ${CAIRN_EMAIL_FROM_ADDRESS}');
    push('      CAIRN_EMAIL_SMTP_HOST: ${CAIRN_EMAIL_SMTP_HOST}');
    push('      CAIRN_EMAIL_SMTP_PORT: ${CAIRN_EMAIL_SMTP_PORT}');
    push('      CAIRN_EMAIL_SMTP_USERNAME: ${CAIRN_EMAIL_SMTP_USERNAME}');
    push('      CAIRN_EMAIL_SMTP_PASSWORD: ${CAIRN_EMAIL_SMTP_PASSWORD}');
    push('      CAIRN_EMAIL_SMTP_STARTTLS: ${CAIRN_EMAIL_SMTP_STARTTLS}');
  }
  push('      # the public OSM tile and Nominatim servers want a contact');
  push(
    '      CAIRN_MAP_USER_AGENT: cairn (${CAIRN_INSTANCE_BOOTSTRAP_ADMIN_EMAIL})',
  );
  push('      CAIRN_GEOCODER_EMAIL: ${CAIRN_INSTANCE_BOOTSTRAP_ADMIN_EMAIL}');
  if (o.proxy === 'none') {
    push('    ports:');
    push('      - "8080:8080"');
  } else if (o.proxy === 'external') {
    push('    ports:');
    push('      - "127.0.0.1:8080:8080"');
  }
  push('    depends_on:');
  push('      postgres: {condition: service_healthy}');
  push('      nats: {condition: service_healthy}');
  if (o.storage === 'minio') {
    push('      minio: {condition: service_healthy}');
  }
  push('');

  // ---- workers ----------------------------------------------------------
  if (o.strava) {
    push('  worker-strava:');
    push(
      '    image: ghcr.io/opencairn-org/cairn-provider-strava:${STRAVA_TAG}',
    );
    push('    restart: unless-stopped');
    push('    environment:');
    push('      CAIRN_NATS_URL: nats://nats:4222');
    push('      CAIRN_WORKER_NAME: strava-fetcher');
    if (o.natsAuth) {
      push('      CAIRN_WORKER_ENROLLMENT_TOKEN: ${STRAVA_ENROLLMENT_TOKEN:-}');
    }
    if (o.stravaWebhook) {
      push('      # exactly one Strava instance owns the webhook subscription');
      push(
        '      CAIRN_STRAVA_WEBHOOK_VERIFY_TOKEN: ${CAIRN_STRAVA_WEBHOOK_VERIFY_TOKEN}',
      );
    }
    push('    depends_on: [core]');
    push('');
  }
  if (o.garmin) {
    push('  worker-garmin:');
    push(
      '    image: ghcr.io/opencairn-org/cairn-provider-garmin:${GARMIN_TAG}',
    );
    push('    restart: unless-stopped');
    push('    environment:');
    push('      CAIRN_NATS_URL: nats://nats:4222');
    push('      CAIRN_WORKER_NAME: garmin-fetcher');
    if (o.natsAuth) {
      push('      CAIRN_WORKER_ENROLLMENT_TOKEN: ${GARMIN_ENROLLMENT_TOKEN:-}');
    }
    push('    volumes:');
    push(
      '      # Garth token cache; the image runs as uid 10001 and owns /data',
    );
    push('      - garmin_tokens:/data');
    push('    depends_on: [core]');
    push('');
  }

  // ---- backing services -------------------------------------------------
  push('  postgres:');
  push(`    image: ${IMAGES.postgres}`);
  push('    restart: unless-stopped');
  push('    environment:');
  push('      POSTGRES_USER: cairn');
  push('      POSTGRES_DB: cairn');
  push('      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}');
  push(
    '      POSTGRES_INITDB_ARGS: --encoding=UTF-8 --lc-collate=C --lc-ctype=C',
  );
  push('    volumes:');
  push('      - postgres_data:/home/postgres/pgdata/data');
  push('    healthcheck:');
  push('      test: ["CMD-SHELL", "pg_isready -U cairn -d cairn"]');
  push('      interval: 5s');
  push('      timeout: 5s');
  push('      retries: 10');
  push('      start_period: 20s');
  push('');

  push('  nats:');
  push(`    image: ${IMAGES.nats}`);
  push('    restart: unless-stopped');
  if (o.natsAuth) {
    push(
      '    # open.conf first; switch to auth.conf once the issuer key exists',
    );
    push(
      '    command: ["-c", "/etc/nats/${NATS_CONF:-open.conf}", "--cluster_name", "cairn"]',
    );
    push('    configs:');
    push('      - {source: nats-open, target: /etc/nats/open.conf}');
    push('      - {source: nats-auth, target: /etc/nats/auth.conf}');
  } else {
    push(
      '    command: ["-c", "/etc/nats/nats.conf", "--cluster_name", "cairn"]',
    );
    push('    configs:');
    push('      - {source: nats-open, target: /etc/nats/nats.conf}');
  }
  push('    volumes:');
  push('      - nats_data:/data');
  push('    healthcheck:');
  push(
    '      test: ["CMD-SHELL", "wget -q --spider http://localhost:8222/healthz || exit 1"]',
  );
  push('      interval: 5s');
  push('      timeout: 5s');
  push('      retries: 10');
  push('');

  if (o.storage === 'minio') {
    push('  minio:');
    push(`    image: ${IMAGES.minio}`);
    push('    restart: unless-stopped');
    push('    command: server /data --console-address ":9001"');
    push('    environment:');
    push('      MINIO_ROOT_USER: cairn');
    push('      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}');
    push(
      '    # ports: ["127.0.0.1:9001:9001"]  # admin console, if you want it',
    );
    push('    volumes:');
    push('      - minio_data:/data');
    push('    healthcheck:');
    push(
      '      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]',
    );
    push('      interval: 5s');
    push('      timeout: 5s');
    push('      retries: 10');
    push('');
  }

  if (o.proxy === 'caddy') {
    push('  caddy:');
    push(`    image: ${IMAGES.caddy}`);
    push('    restart: unless-stopped');
    push('    ports:');
    push('      - "80:80"');
    push('      - "443:443"');
    push('      - "443:443/udp"');
    push('    configs:');
    push('      - {source: caddyfile, target: /etc/caddy/Caddyfile}');
    push('    volumes:');
    push('      - caddy_data:/data');
    push('      - caddy_config:/config');
    push('    depends_on: [core]');
    push('');
  }

  // ---- configs ----------------------------------------------------------
  push('configs:');
  push('  nats-open:');
  push('    content: |');
  push('      http_port: 8222');
  push('      jetstream { store_dir: "/data" }');
  push('      # long activity streams exceed the 1 MiB default');
  push('      max_payload: 8MB');
  if (o.natsAuth) {
    push('  nats-auth:');
    push('    content: |');
    push('      http_port: 8222');
    push('      jetstream { store_dir: "/data" }');
    push('      max_payload: 8MB');
    push('      accounts {');
    push('        CAIRN {');
    push('          jetstream: enabled');
    push('          users: [');
    push(
      '            { user: cairn-core, password: "${CAIRN_NATS_PASSWORD}" }',
    );
    push('          ]');
    push('        }');
    push('      }');
    push('      authorization {');
    push('        auth_callout {');
    push('          issuer: "${CAIRN_NATS_AUTH_ISSUER:-}"');
    push('          account: CAIRN');
    push('          auth_users: [ cairn-core ]');
    push('        }');
    push('      }');
  }
  if (o.proxy === 'caddy') {
    push('  caddyfile:');
    push('    content: |');
    push('      ${CAIRN_DOMAIN} {');
    push('        reverse_proxy core:8080');
    push('      }');
  }
  push('');

  // ---- volumes / network ------------------------------------------------
  push('volumes:');
  push('  postgres_data:');
  push('  nats_data:');
  if (o.storage === 'minio') push('  minio_data:');
  if (o.garmin) push('  garmin_tokens:');
  if (o.proxy === 'caddy') {
    push('  caddy_data:');
    push('  caddy_config:');
  }
  if (behindProxy) {
    push('');
    push('networks:');
    push('  default:');
    push(
      '    # named subnet so core can trust the proxy (CAIRN_INSTANCE_TRUSTED_PROXIES)',
    );
    push('    ipam:');
    push(`      config: [{subnet: ${SUBNET}}]`);
  }
  return out.join('\n') + '\n';
}

export function buildEnv(o, tags, secrets) {
  const s = secrets ?? PLACEHOLDER;
  const out = [];
  const push = (l = '') => out.push(l);

  push('# Image tags. Upgrade core first, then the workers.');
  push(`CORE_TAG=${tags.core}`);
  if (o.strava) push(`STRAVA_TAG=${tags.strava}`);
  if (o.garmin) push(`GARMIN_TAG=${tags.garmin}`);
  push();

  if (o.proxy === 'none') {
    push('# How browsers reach this instance (OAuth redirects, share links)');
    push('CAIRN_PUBLIC_URL=http://localhost:8080');
  } else {
    push('# Public hostname; OAuth redirects, webhooks and share links use it');
    push('CAIRN_DOMAIN=cairn.example.com');
  }
  push();

  push('# Crypto secrets. The master key encrypts every stored credential:');
  push('# back it up separately from the database, it cannot be rotated.');
  push(`CAIRN_AUTH_SESSION_SECRET=${s.session}`);
  push(`CAIRN_AUTH_MASTER_ENCRYPTION_KEY=${s.master}`);
  push();

  push('# First admin, created on first boot');
  push('CAIRN_INSTANCE_BOOTSTRAP_ADMIN_EMAIL=admin@example.com');
  push(`CAIRN_INSTANCE_BOOTSTRAP_ADMIN_PASSWORD=${s.admin}`);
  push();

  push('# Postgres');
  push(`POSTGRES_PASSWORD=${s.postgres}`);
  push();

  if (o.storage === 'minio') {
    push('# MinIO root credentials (the bucket is created by core)');
    push(`MINIO_ROOT_PASSWORD=${s.minio}`);
    push();
  } else if (o.storage === 'external') {
    push('# S3-compatible object store for raw files and photos');
    push('CAIRN_STORAGE_ENDPOINT=https://s3.eu-central-1.amazonaws.com');
    push('CAIRN_STORAGE_REGION=eu-central-1');
    push('CAIRN_STORAGE_BUCKET=cairn');
    push('CAIRN_STORAGE_ACCESS_KEY_ID=');
    push('CAIRN_STORAGE_SECRET_ACCESS_KEY=');
    push('# false for virtual-hosted buckets (AWS), true for MinIO/Garage');
    push('CAIRN_STORAGE_USE_PATH_STYLE=false');
    push();
  }

  if (o.natsAuth) {
    push(
      '# NATS auth-callout. Phase 1 (first start): leave these as they are.',
    );
    push('# Phase 2: paste the issuer key, set NATS_CONF=auth.conf and');
    push('# CAIRN_NATS_AUTH_CALLOUT=true, add the enrollment tokens, up -d.');
    push(`CAIRN_NATS_PASSWORD=${s.nats}`);
    push('CAIRN_NATS_AUTH_ISSUER=');
    push('NATS_CONF=open.conf');
    push('CAIRN_NATS_AUTH_CALLOUT=false');
    if (o.strava) push('STRAVA_ENROLLMENT_TOKEN=');
    if (o.garmin) push('GARMIN_ENROLLMENT_TOKEN=');
    push();
  }

  if (o.strava && o.stravaWebhook) {
    push('# Strava push subscription (set on exactly one worker instance)');
    push(`CAIRN_STRAVA_WEBHOOK_VERIFY_TOKEN=${s.webhook}`);
    push();
  }

  if (o.email === 'smtp') {
    push('# Outbound mail: verification and password-reset messages');
    push('CAIRN_EMAIL_FROM_ADDRESS=cairn@example.com');
    push('CAIRN_EMAIL_SMTP_HOST=smtp.example.com');
    push('CAIRN_EMAIL_SMTP_PORT=587');
    push('CAIRN_EMAIL_SMTP_USERNAME=');
    push('CAIRN_EMAIL_SMTP_PASSWORD=');
    push('CAIRN_EMAIL_SMTP_STARTTLS=true');
    push();
  }

  return out.join('\n');
}
