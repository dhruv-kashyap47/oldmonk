import { ProsePage } from "../components/layout/ProsePage";

export default function TermsPage() {
  return (
    <ProsePage
      title="Terms of use"
      summary="The terms that apply when you use oldmonk, including the limits of a free browser tool and the lack of a warranty."
      path="/terms"
      updated="2026-11-23"
    >
      <p>
        By using oldmonk you agree to these terms. If you do not agree, do not use the
        site.
      </p>

      <h2>The service</h2>
      <p>
        oldmonk provides free browser-based utilities for working with code, text, random
        selections, timers, and short tests. The tools run in your browser. There is no
        account, no paid plan, and no guarantee that a particular tool will remain
        available.
      </p>

      <h2>Your results</h2>
      <p>
        You own the text and files you bring to a tool. You also own the output you generate
        with it. oldmonk does not claim a license to your input or output, because it does
        not receive either.
      </p>

      <h2>No warranty</h2>
      <p>
        The tools are provided as they are, without a warranty of any kind. Parsers,
        encoders, timers, and tests can have edge cases. Check important output before you
        rely on it, especially before deploying configuration, signing a token, or making a
        decision that cannot be reversed.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to use oldmonk to:</p>
      <ul>
        <li>break a law or a third party's rights;</li>
        <li>attack, overload, or probe the site or its hosting provider;</li>
        <li>misrepresent the site or its output as someone else's service;</li>
        <li>remove or hide the notices that apply to third-party work.</li>
      </ul>

      <h2>Limits</h2>
      <p>
        Some tools cap input size or run time so the page stays responsive. Those caps are
        stated on the page. A tool may refuse input that is too large, malformed, or outside
        its documented range.
      </p>

      <h2>Changes</h2>
      <p>
        Tools and these terms may change. The updated date at the top of this page reflects
        the current version. Continued use after a change means you accept the updated
        terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can go to{" "}
        <a href="mailto:hello@oldmonk.dev">hello@oldmonk.dev</a>.
      </p>
    </ProsePage>
  );
}
