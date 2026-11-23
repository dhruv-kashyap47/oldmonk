import { ProsePage } from "../components/layout/ProsePage";

export default function NoticesPage() {
  return (
    <ProsePage
      title="Notices"
      summary="The licenses and credits that apply to oldmonk, its runtime, its display font, and the design references used while building it."
      path="/notices"
      updated="2026-11-23"
    >
      <p>
        oldmonk is built with open-source software. This page lists the licenses that
        matter for the deployed site. The repository keeps the full text in{" "}
        <code>THIRD_PARTY_NOTICES.md</code> and in each package's own license file.
      </p>

      <h2>Runtime and UI</h2>
      <ul>
        <li>Solid and its router and meta packages, MIT license.</li>
        <li>ui-sdk, MIT license, for dialog, command, field, textarea, and button behavior.</li>
        <li>Tailwind CSS, MIT license, for the utility layer and design tokens.</li>
        <li>Vite, MIT license, for the build.</li>
      </ul>

      <h2>Display font</h2>
      <p>
        Bitter is self-hosted as a Latin variable WOFF2 subset and used for headings. It is
        licensed under the SIL Open Font License 1.1. The license text ships at{" "}
        <a href="/fonts/OFL.txt">/fonts/OFL.txt</a>.
      </p>

      <h2>Design references</h2>
      <p>
        Three MIT-licensed DESIGN.md guides from OpenDesignMD informed the catalog row,
        workbench, and category marker patterns. No fonts, screenshots, logos, or brand
        assets were copied. The mapping is recorded in the repository's design notes.
      </p>

      <h2>Ported code</h2>
      <p>
        The tool logic in this release was written for oldmonk. When a future tool ports
        code or data from another project, the source, license, and notice will be added
        here and to the repository notices in the same change.
      </p>

      <h2>Corrections</h2>
      <p>
        If something is missing or credited incorrectly, write to{" "}
        <a href="mailto:hello@oldmonk.dev">hello@oldmonk.dev</a> and it will be fixed.
      </p>
    </ProsePage>
  );
}
