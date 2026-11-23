import { ProsePage } from "../components/layout/ProsePage";

export default function PrivacyPage() {
  return (
    <ProsePage
      title="Privacy policy"
      summary="What oldmonk processes, what it stores in your browser, and what the analytics and advertising setup does."
      path="/privacy"
      updated="2026-11-23"
    >
      <p>
        This policy describes the oldmonk website and its browser tools. It is written to
        match how the site actually works: the tools process input locally, and there is no
        account or tool backend.
      </p>

      <h2>Tool input</h2>
      <p>
        Text, files, tokens, names, and settings you enter into a tool are processed in your
        browser. They are not uploaded to oldmonk or to a third party, and they are not
        written to analytics. Files are read locally through the browser's file APIs.
      </p>

      <h2>Local storage</h2>
      <p>
        The site stores a small number of preferences under keys beginning with{" "}
        <code>oldmonk:v1:</code>. These cover the color theme, optional timer settings, and
        best scores or recent results on test pages. They do not contain the text you paste
        into a developer tool. You can remove them by clearing site data for oldmonk in your
        browser settings.
      </p>

      <h2>Analytics</h2>
      <p>
        When analytics is enabled for a deployment, the site loads Plausible. Plausible is
        cookieless and does not fingerprint visitors. oldmonk sends page paths and named
        events such as <code>tool_view</code> and <code>copy_result</code>. Event properties
        are limited to things like the tool slug and a length bucket. Tool input, clipboard
        contents, and search query text are never sent.
      </p>

      <h2>Advertising</h2>
      <p>
        Advertising is disabled in this build. Ad slots render nothing without a configured
        publisher ID. If ads are enabled later, Google AdSense may set cookies or use local
        storage to measure and personalize ads, and a consent management flow will be shown
        where the law requires one. This policy will be updated before any ad goes live.
      </p>

      <h2>Clipboard and downloads</h2>
      <p>
        Copy actions write to your clipboard only after you press a copy button. Downloads
        are generated in the browser from the result on screen.
      </p>

      <h2>External links</h2>
      <p>
        Pages may link to other sites. Those sites have their own policies. oldmonk does
        not control what they collect.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can go to{" "}
        <a href="mailto:hello@oldmonk.dev">hello@oldmonk.dev</a>.
      </p>
    </ProsePage>
  );
}
