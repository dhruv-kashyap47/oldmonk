import { ProsePage } from "../components/layout/ProsePage";

export default function AboutPage() {
  return (
    <ProsePage
      title="About oldmonk"
      summary="A small, deliberate catalog of browser tools for code, text, random picks, timers, and quick tests."
      path="/about"
    >
      <p>
        oldmonk is a collection of small utilities that open without an account and finish
        the job in one screen. The catalog is grouped into five categories: developer
        tools, text tools, random tools, timer tools, and tests. Each tool gets a page of
        its own, with the working tool first and the explanation underneath.
      </p>
      <p>
        The product is intentionally small. A directory with a thousand thin pages is easy
        to build and hard to trust. oldmonk ships a tool only when it works, has a clear
        limit, and has enough written context to be useful on its own.
      </p>

      <h2>Everything runs in your browser</h2>
      <p>
        Tool input is processed in the tab. It is not posted to a server, stored in an
        account, or added to a queue. The developer tools read the text you paste with the
        browser's own APIs, and the random tools use the browser's cryptographic random
        source. There is no backend for the tools and no database behind them.
      </p>
      <p>
        A few preferences are kept in local storage so the site remembers your theme and,
        on some test pages, your best score. Those keys are namespaced and never contain
        pasted content. Clearing site data removes them.
      </p>

      <h2>How correctness is checked</h2>
      <p>
        Every parser, encoder, generator, and scoring function has unit tests. Crypto and
        encoding output is checked against known vectors rather than a second copy of the
        same code. Pages are prerendered at build time, and the build fails when a route
        has no title, no description, no canonical link, or a broken internal link.
      </p>
      <p>
        Limits are stated on the page, not hidden. When a tool cannot do something, it says
        so. There are no invented user counts, percentiles, benchmarks, or ratings anywhere
        on the site.
      </p>

      <h2>Ads and analytics</h2>
      <p>
        Ads are off by default. A slot renders nothing until a publisher ID and consent
        flow are configured, so the layout does not reserve an empty box. Analytics uses
        Plausible when a domain is set: page paths and named events, no tool input, and no
        query text.
      </p>

      <h2>Third-party work</h2>
      <p>
        The runtime is Solid, the UI behaviors come from ui-sdk, and the display face is
        Bitter. Design references are credited in the repository. The{" "}
        <a href="/notices">notices page</a> lists the licenses that apply.
      </p>

      <h2>Contact</h2>
      <p>
        Bug reports and tool suggestions go to <a href="mailto:hello@oldmonk.dev">hello@oldmonk.dev</a>.
        Include the page address and the browser you used.
      </p>
    </ProsePage>
  );
}
