import {useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import Link from '@docusaurus/Link';
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';
import {buildCompose, buildEnv, generateSecrets} from './compose';

function Radio({name, value, current, onChange, label, hint}) {
  return (
    <label className={styles.option}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={current === value}
        onChange={() => onChange(value)}
      />
      <span>
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

function Check({checked, onChange, label, hint, disabled}) {
  return (
    <label className={styles.option}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

function TagInput({label, value, onChange}) {
  return (
    <label className={styles.tag}>
      <span>{label}</span>
      <input
        type="text"
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value.trim())}
      />
    </label>
  );
}

function Steps({o}) {
  const base =
    o.proxy === 'none' ? 'http://localhost:8080' : 'https://cairn.example.com';
  return (
    <ol>
      <li>
        Put both files in one directory, for example <code>~/cairn</code>, and
        fill in <code>.env</code>
        {o.proxy !== 'none' && (
          <>
            {' '}
            (at least <code>CAIRN_DOMAIN</code> and the admin email)
          </>
        )}
        . Everything marked <code>CHANGE_ME</code> must be replaced.
      </li>
      {o.proxy === 'caddy' && (
        <li>
          Point the DNS record of your domain at this host and open ports 80 and
          443. Caddy obtains and renews the certificate itself.
        </li>
      )}
      {o.proxy === 'external' && (
        <li>
          Forward <code>https://&lt;your domain&gt;</code> to{' '}
          <code>127.0.0.1:8080</code> on this host and pass the usual{' '}
          <code>X-Forwarded-*</code> headers. Core trusts them from the compose
          subnet, which is where host-side connections arrive from.
        </li>
      )}
      <li>
        Start everything and watch core apply its migrations:
        <CodeBlock language="bash">
          {'docker compose up -d\ndocker compose logs -f core'}
        </CodeBlock>
      </li>
      <li>
        Sign in at <code>{base}</code> as the bootstrap admin.
        {o.strava && (
          <>
            {' '}
            Strava is connected per user from <strong>Connections</strong>, each
            with their own Strava API app.
          </>
        )}
        {o.garmin && (
          <>
            {' '}
            Garmin credentials are entered per user as well; the worker receives
            them over NATS.
          </>
        )}
      </li>
      {o.natsAuth && (
        <li>
          Switch NATS to enrollment-token auth. Create a personal access token
          as the admin, then bootstrap the account key and one enrollment per
          worker:
          <CodeBlock language="bash">
            {[
              `export CAIRN=${base} PAT=cairn_pat_...`,
              `curl -X POST $CAIRN/api/admin/nats/bootstrap-account-key -H "Authorization: Bearer $PAT"`,
              o.strava &&
                `curl -X POST $CAIRN/api/admin/worker-enrollments -H "Authorization: Bearer $PAT" \\\n  -H "Content-Type: application/json" -d '{"name": "strava-fetcher", "provider": "strava"}'`,
              o.garmin &&
                `curl -X POST $CAIRN/api/admin/worker-enrollments -H "Authorization: Bearer $PAT" \\\n  -H "Content-Type: application/json" -d '{"name": "garmin-fetcher", "provider": "garmin"}'`,
            ]
              .filter(Boolean)
              .join('\n')}
          </CodeBlock>
          Put the returned <code>public_key</code> into{' '}
          <code>CAIRN_NATS_AUTH_ISSUER</code> and each <code>token</code> into
          its <code>*_ENROLLMENT_TOKEN</code>, set{' '}
          <code>NATS_CONF=auth.conf</code> and{' '}
          <code>CAIRN_NATS_AUTH_CALLOUT=true</code>, then run{' '}
          <code>docker compose up -d</code> again. NATS, core and the workers
          are recreated; from now on only enrolled workers are admitted. The
          enrollment UI under <strong>Worker onboarding</strong> does the same
          without curl.
        </li>
      )}
      {o.garmin && (
        <li>
          Garmin accounts with MFA need their token store seeded once with an
          interactive login into the <code>garmin_tokens</code> volume, see{' '}
          <Link to="/self-host/providers#garmin-python">Providers</Link>.
        </li>
      )}
      {o.strava && o.stravaWebhook && (
        <li>
          Strava delivers webhooks to <code>{base}/webhooks/strava</code>, so
          the instance has to be reachable from the internet. Keep the Strava
          worker at one instance while it holds the verify token.
        </li>
      )}
    </ol>
  );
}

export default function ComposeConfigurator({defaultRelease = 'v0.6.0'}) {
  const version = useDocsVersion();
  const release =
    version.version === 'current' ? defaultRelease : `v${version.version}`;

  const [tags, setTags] = useState({
    core: release,
    strava: release,
    garmin: release,
  });
  const [o, setO] = useState({
    strava: true,
    garmin: true,
    stravaWebhook: false,
    storage: 'minio',
    proxy: 'caddy',
    natsAuth: false,
    email: 'none',
  });
  const [secrets, setSecrets] = useState(null);

  const set = (patch) => setO((prev) => ({...prev, ...patch}));
  const setTag = (k) => (v) => setTags((prev) => ({...prev, [k]: v}));

  const compose = buildCompose(o);
  const env = buildEnv(o, tags, secrets);

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <fieldset className={styles.group}>
          <legend>Providers</legend>
          <Check
            checked={o.strava}
            onChange={(v) => set({strava: v})}
            label="Strava"
            hint="cairn-provider-strava; users bring their own Strava API app"
          />
          <Check
            checked={o.strava && o.stravaWebhook}
            disabled={!o.strava}
            onChange={(v) => set({stravaWebhook: v})}
            label="Strava push webhooks"
            hint="live imports instead of hourly polling; needs a public URL"
          />
          <Check
            checked={o.garmin}
            onChange={(v) => set({garmin: v})}
            label="Garmin"
            hint="cairn-provider-garmin with a persistent token volume"
          />
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Reverse proxy and TLS</legend>
          <Radio
            name="proxy"
            value="caddy"
            current={o.proxy}
            onChange={(v) => set({proxy: v})}
            label="Bundled Caddy"
            hint="automatic Let's Encrypt certificate for CAIRN_DOMAIN"
          />
          <Radio
            name="proxy"
            value="external"
            current={o.proxy}
            onChange={(v) => set({proxy: v})}
            label="Existing proxy on this host"
            hint="core listens on 127.0.0.1:8080 and trusts forwarded headers"
          />
          <Radio
            name="proxy"
            value="none"
            current={o.proxy}
            onChange={(v) => set({proxy: v})}
            label="None, plain HTTP on :8080"
            hint="LAN or testing only; passkeys need HTTPS"
          />
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Object storage</legend>
          <Radio
            name="storage"
            value="minio"
            current={o.storage}
            onChange={(v) => set({storage: v})}
            label="Bundled MinIO"
            hint="raw files, photos and map snapshots stay on this host"
          />
          <Radio
            name="storage"
            value="external"
            current={o.storage}
            onChange={(v) => set({storage: v})}
            label="External S3-compatible bucket"
            hint="AWS S3, Garage, Hetzner, …"
          />
          <Radio
            name="storage"
            value="none"
            current={o.storage}
            onChange={(v) => set({storage: v})}
            label="None"
            hint="no uploads, photos or cached map snapshots"
          />
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Worker authentication</legend>
          <Radio
            name="nats"
            value="open"
            current={o.natsAuth ? 'auth' : 'open'}
            onChange={() => set({natsAuth: false})}
            label="Open NATS"
            hint="workers connect anonymously; NATS is not published, fine for a single host"
          />
          <Radio
            name="nats"
            value="auth"
            current={o.natsAuth ? 'auth' : 'open'}
            onChange={() => set({natsAuth: true})}
            label="Enrollment tokens (auth-callout)"
            hint="per-worker scoped credentials; two-step start"
          />
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Email</legend>
          <Radio
            name="email"
            value="none"
            current={o.email}
            onChange={(v) => set({email: v})}
            label="None"
            hint="no verification or password-reset mails"
          />
          <Radio
            name="email"
            value="smtp"
            current={o.email}
            onChange={(v) => set({email: v})}
            label="SMTP relay"
            hint="SES, Resend and Mailgun: see Configuration"
          />
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Images</legend>
          <TagInput label="core" value={tags.core} onChange={setTag('core')} />
          {o.strava && (
            <TagInput
              label="strava"
              value={tags.strava}
              onChange={setTag('strava')}
            />
          )}
          {o.garmin && (
            <TagInput
              label="garmin"
              value={tags.garmin}
              onChange={setTag('garmin')}
            />
          )}
          <small className={styles.hint}>
            Release tags on ghcr.io/opencairn-org. Never <code>latest</code>.
          </small>
        </fieldset>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="button button--primary button--sm"
          onClick={() => setSecrets(generateSecrets())}>
          Fill in random secrets
        </button>
        {secrets && (
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={() => setSecrets(null)}>
            Back to placeholders
          </button>
        )}
        <small className={styles.hint}>
          Secrets are generated in your browser and never leave this page.
        </small>
      </div>

      <CodeBlock language="yaml" title="docker-compose.yml">
        {compose}
      </CodeBlock>
      <CodeBlock language="bash" title=".env">
        {env}
      </CodeBlock>

      <h3>First start</h3>
      <Steps o={o} />
    </div>
  );
}
