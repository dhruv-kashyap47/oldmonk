import { ProsePage } from "../components/layout/ProsePage";

export default function ContactPage() {
  return (
    <ProsePage
      title="Contact"
      summary="Report a bug, suggest a tool, or ask a question. Email is the only channel, and there is no contact form."
      path="/contact"
    >
      <p>
        Write to <a href="mailto:hello@oldmonk.dev">hello@oldmonk.dev</a>. There is no
        contact form because a form would mean collecting your message on a server for no
        good reason.
      </p>

      <h2>Reporting a bug</h2>
      <p>A useful report includes:</p>
      <ul>
        <li>the page address, such as <code>/json-formatter</code>;</li>
        <li>the browser and operating system;</li>
        <li>what you expected and what happened;</li>
        <li>a small sample input that triggers it, with anything private removed.</li>
      </ul>
      <p>
        Do not send a real token, password, or private document. A short made-up example is
        enough to reproduce most problems.
      </p>

      <h2>Suggesting a tool</h2>
      <p>
        Say which job the tool should finish and what you use today. A suggestion that names
        a real, repeated task is easier to act on than a category. The catalog grows
        deliberately, so not every request will be built.
      </p>

      <h2>Privacy or legal questions</h2>
      <p>
        Use the same address and put "privacy" or "legal" in the subject. The{" "}
        <a href="/privacy">privacy policy</a> and <a href="/terms">terms</a> describe how the
        site handles data and what the tools promise.
      </p>
    </ProsePage>
  );
}
