import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  useVersions,
  useLatestVersion,
} from '@docusaurus/plugin-content-docs/client';

const changelogUrl = (version) =>
  `https://github.com/johnnycube/cairn-core/blob/v${version.name}/CHANGELOG.md`;

function VersionRows({versions}) {
  return versions.map((version) => (
    <tr key={version.name}>
      <th>{version.label}</th>
      <td>
        <Link to={version.path}>Documentation</Link>
      </td>
      <td>
        {version.name === 'current' ? (
          <span>—</span>
        ) : (
          <Link href={changelogUrl(version)}>Release notes</Link>
        )}
      </td>
    </tr>
  ));
}

export default function Versions() {
  const versions = useVersions();
  const latest = useLatestVersion();
  const next = versions.find((v) => v.name === 'current');
  const past = versions.filter((v) => v !== latest && v.name !== 'current');

  return (
    <Layout
      title="Documentation versions"
      description="Every Cairn release keeps its own copy of the documentation.">
      <main className="container margin-vert--lg">
        <Heading as="h1">Documentation versions</Heading>
        <p>
          Every Cairn release keeps its own frozen copy of this documentation.
          Pick the version that matches the core you run; the newest release is
          what the site shows by default, and the switch in the navbar moves
          the page you are reading to another version.
        </p>

        <section className="margin-bottom--lg">
          <Heading as="h2">Current release</Heading>
          <table>
            <tbody>
              <VersionRows versions={[latest]} />
            </tbody>
          </table>
        </section>

        {next && (
          <section className="margin-bottom--lg">
            <Heading as="h2">Next (unreleased)</Heading>
            <p>
              Documentation for changes that are not part of a release yet.
              Things described here may still change before they ship.
            </p>
            <table>
              <tbody>
                <VersionRows versions={[next]} />
              </tbody>
            </table>
          </section>
        )}

        {past.length > 0 && (
          <section className="margin-bottom--lg">
            <Heading as="h2">Previous releases</Heading>
            <p>
              Frozen at the time of each release. Where one snapshot covers
              several releases, nothing user-facing changed in between.
            </p>
            <table>
              <tbody>
                <VersionRows versions={past} />
              </tbody>
            </table>
          </section>
        )}
      </main>
    </Layout>
  );
}
