import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Does the formatter send my JSON anywhere?",
    answer:
      "No. The text is parsed in this browser tab. There is no upload, no API call, and no account. Closing the tab discards the input unless you saved it yourself.",
  },
  {
    question: "What is the size limit?",
    answer:
      "The input cap is 5 MB of UTF-8 text. The parser runs on the main thread, so a document near the cap can take a moment and briefly make the page busy. Larger documents are better handled by a command line tool such as jq.",
  },
  {
    question: "Why does it reject comments and trailing commas?",
    answer:
      "Strict JSON has no comments and no trailing commas. Those forms belong to JSON5 or JSONC, which are different formats. The formatter follows the JSON grammar so the output is valid for every JSON parser.",
  },
  {
    question: "Why did two identical keys become one?",
    answer:
      "A JSON object is a map, so a repeated key cannot have two values. This formatter keeps the last value, which matches JSON.parse in browsers, and lists the repeated keys above the result so the change is not silent.",
  },
  {
    question: "Can it keep very large integers exact?",
    answer:
      "Not beyond the range of a JavaScript number. JSON itself does not distinguish an integer from a decimal, and this parser stores numbers as IEEE 754 doubles. An ID such as 9007199254740993 should stay a string in your source document.",
  },
];

export default function JsonFormatterContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        JSON Formatter reads a JSON document, checks the syntax, and prints it with one
        value per line. The result is easier to scan, easier to diff, and ready to paste
        into a config file, a test fixture, or a bug report.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Paste or type a JSON document in the input field.</li>
        <li>Choose two spaces, four spaces, or a tab for indentation.</li>
        <li>
          Turn on <strong>Sort keys</strong> if you want object keys in alphabetical order
          at every depth. Array order stays as it is.
        </li>
        <li>
          Press <strong>Format JSON</strong>. Copy the output or download it as a{" "}
          <code>.json</code> file.
        </li>
      </ol>
      <p>
        If the document is invalid, the formatter reports the line and column where parsing
        stopped and explains what it expected. The input is never partially rewritten.
      </p>

      <h2>What it does</h2>
      <p>
        The parser follows the JSON grammar directly instead of relying on a browser error
        message. That is why every syntax error gets a stable location. Objects and arrays
        are printed with one member per line, strings keep their escapes, and a leading byte
        order mark is removed before parsing so files exported by Windows tools still work.
      </p>
      <p>
        Duplicate keys are the one place where JSON itself is ambiguous. A map cannot hold
        the same key twice, so the last value wins, matching the browser's own{" "}
        <code>JSON.parse</code>. The formatter names the duplicated keys above the result
        so you can decide whether the source document needs fixing.
      </p>
      <p>
        Numbers are stored as IEEE 754 doubles, exactly as JSON.parse treats them. That is
        fine for prices, measurements, and counters within the safe integer range. For
        identifiers, timestamps in nanoseconds, or anything that must stay exact, keep the
        value as a string.
      </p>

      <h2>Limits</h2>
      <p>
        Input is capped at 5 MB of UTF-8 text. Parsing happens on the main thread, so a
        document near the cap can briefly make the page busy. The tool does not stream, and
        it does not repair malformed JSON. If you need to handle gigabytes or recover from
        truncated output, a dedicated command line parser is the better tool.
      </p>

      <h2>Why format at all</h2>
      <p>
        Minified JSON is efficient to send and hard to read. Pretty-printing makes the
        structure visible, which helps when you are comparing two API responses, reviewing
        a config change, or attaching a payload to a bug report. Sorting keys goes one step
        further: two documents that differ only in key order produce the same output, so a
        diff shows the real change.
      </p>

      <h2>Privacy</h2>
      <p>
        The document is processed locally. Nothing is uploaded, logged, or added to
        analytics. The formatter does not keep your input in local storage, so a reload
        clears it.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
