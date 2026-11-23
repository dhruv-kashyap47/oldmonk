import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Does the validator send my JSON anywhere?",
    answer:
      "No. The document is checked in this browser tab. There is no upload and no account, and the input is not saved to local storage.",
  },
  {
    question: "Why does it reject a comment?",
    answer:
      "Strict JSON has no comment syntax. Comments belong to JSONC or JSON5, which are separate formats. Removing the comment is the usual fix.",
  },
  {
    question: "Are duplicate keys a syntax error?",
    answer:
      "The JSON grammar allows an object to repeat a name, so the document still parses. The tool lists the repeated names because it keeps only the last value, which can hide a mistake.",
  },
  {
    question: "Can it repair my document?",
    answer:
      "It reports the first error and shows the line where parsing stopped. It does not rewrite the input, so you decide what the document should say.",
  },
  {
    question: "Does it check a JSON Schema?",
    answer:
      "No. It checks the JSON grammar only. Field names, required properties, and value ranges are schema rules, and they are outside the scope of this page.",
  },
];

export default function JsonValidatorContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        JSON Validator checks a document against the JSON grammar and tells you whether it
        parses. When it fails, you get the first error with a line, a column, and the source
        line where parsing stopped.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Paste a JSON document into the input field.</li>
        <li>
          Press <strong>Validate JSON</strong>. The verdict appears below the panel.
        </li>
        <li>
          On success, read the byte count, the line count, and the top-level shape. If names
          repeat, a separate warning lists them.
        </li>
        <li>
          On failure, use the line and column to find the spot. The offending line is printed
          under the message. Press <strong>Load invalid sample</strong> to see the flow.
        </li>
      </ol>

      <h2>The grammar in brief</h2>
      <p>
        A JSON document contains one value. A value is an object, an array, a string, a
        number, <code>true</code>, <code>false</code>, or <code>null</code>. An object holds
        double-quoted names followed by colons and values, separated by commas. An array
        holds values separated by commas. Whitespace is allowed between tokens, and it has no
        meaning.
      </p>
      <p>
        Strings use double quotes. A quote, a backslash, and control characters need an
        escape. Numbers follow a narrow form: an optional minus sign, no leading zero, an
        optional fraction, and an optional exponent. Hexadecimal numbers, a leading plus, and
        the special values for not-a-number and infinity are not JSON.
      </p>

      <h2>Common mistakes</h2>
      <p>
        A trailing comma is the most frequent error, as in <code>[1, 2,]</code> or{" "}
        <code>{'{"a": 1,}'}</code>. The next most common is a comment copied from a config
        file. Single quotes and unquoted names arrive when someone writes JavaScript object
        syntax instead of JSON. Missing commas between members and misspelled literals such
        as <code>True</code> also stop the parser.
      </p>
      <p>
        Word processors sometimes replace straight quotes with curly quotes. Those characters
        are not string delimiters, so the document fails at the first one. A leading byte
        order mark is stripped before parsing here, because some Windows tools add one.
      </p>

      <h2>Duplicate names</h2>
      <p>
        A JSON object is a map, so a repeated name cannot hold two values. The grammar still
        permits the text, and different parsers have handled it differently over the years.
        This tool parses it, then reports the repeated names. The stored value is the last
        one, matching <code>JSON.parse</code> in browsers, but you should fix the source if
        the repetition was accidental.
      </p>

      <h2>What it does not do</h2>
      <p>
        The validator reports the first failure only, because later text depends on how the
        earlier part is read. It does not repair the document, format it, or compare it with
        another version. Formatting is a separate tool, and schema checks are a separate kind
        of validation.
      </p>

      <h2>Limits and privacy</h2>
      <p>
        Input is capped at 5 MB of UTF-8 text. Parsing runs on the main thread, so a document
        near the cap can make the page busy for a moment. The document stays in the tab, and
        a reload clears it.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
