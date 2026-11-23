import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Does minifying change the data?",
    answer:
      "The parsed value stays the same. The printed form can change: 1.50 becomes 1.5, an escaped slash may become a plain slash, and a repeated key keeps its last value. Check the duplicate warning if the source repeats a name.",
  },
  {
    question: "Is minified JSON smaller over the network?",
    answer:
      "It has fewer bytes before transport compression, which is the number shown here. gzip or Brotli then compresses the result, and the final transfer size depends on the content and the server settings.",
  },
  {
    question: "Why is the saving zero?",
    answer:
      "The input was already compact. Removing whitespace cannot shrink a document that has none, so the before and after byte counts match.",
  },
  {
    question: "Can it minify a large file?",
    answer:
      "The cap is 5 MB of UTF-8 text. The parser runs in the tab on the main thread, so a document near the cap may take a moment. Larger files are better handled by a command line tool.",
  },
  {
    question: "Is my JSON uploaded?",
    answer:
      "No. The text is parsed and printed in this browser tab. Nothing is sent to a server, and the input is not stored after a reload.",
  },
];

export default function JsonMinifierContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        JSON Minifier removes indentation, line breaks, and the spaces between tokens. The
        result is one line of JSON with the same parsed value and a smaller byte count.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Paste a JSON document into the input field.</li>
        <li>
          Press <strong>Minify JSON</strong>. The output and the size report appear together.
        </li>
        <li>
          Read the before and after byte counts, then copy the result or download it as a{" "}
          <code>.json</code> file.
        </li>
        <li>
          If the document is invalid, the parser reports the line and column instead of
          producing output.
        </li>
      </ol>

      <h2>What is removed</h2>
      <p>
        Whitespace between tokens has no meaning in JSON, so the minifier drops it. Spaces
        and tabs inside a string are data and stay exactly as written. Escape sequences also
        stay, because they can carry meaning that a reader needs.
      </p>
      <p>
        The output is produced by parsing the document and printing it again, not by deleting
        characters with a pattern. That distinction matters. A value such as <code>1.50</code>{" "}
        prints as <code>1.5</code>, and a redundant escape may print in its shorter form. If
        the source repeats an object name, the last value is the one that survives, because a
        parsed object can hold only one value per name.
      </p>

      <h2>The size report</h2>
      <p>
        Sizes are UTF-8 byte counts, not character counts, so a document with accented letters
        or emoji reports more bytes than its visible length. The percentage is the removed
        bytes divided by the original size, rounded to one decimal. A zero original size
        returns zero rather than dividing by zero. If the printed form ever grows, the report
        shows a negative saving rather than hiding it.
      </p>

      <h2>Minify and gzip are different steps</h2>
      <p>
        Minification removes characters from the document itself. gzip and Brotli compress the
        byte stream for transport, and the browser or server reverses that step. They work at
        different layers. A minified file still benefits from transport compression, and a
        gzip file is not readable JSON until it is decompressed. The numbers on this page cover
        the first step only.
      </p>

      <h2>When to minify</h2>
      <p>
        Minified JSON is useful for fixtures, embedded payloads, and API examples where every
        byte is part of the artifact. Keep a readable source version for review. A minified
        config file is hard to inspect in a diff, and a single missing comma becomes difficult
        to spot by eye.
      </p>

      <h2>Limits and privacy</h2>
      <p>
        Input is capped at 5 MB of UTF-8 text. Parsing and printing happen in this tab on the
        main thread, so a very large document can briefly make the page busy. Nothing is
        uploaded, logged, or kept in local storage.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
