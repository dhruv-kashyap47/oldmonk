import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Why does the page use a worker?",
    answer:
      "A regular expression can backtrack far more than expected, and a bad pattern can freeze a tab for minutes. The tester runs the match in a Web Worker and stops it after 750 milliseconds, so the page stays responsive and you get a clear message instead of a locked browser.",
  },
  {
    question: "Are my pattern and text uploaded?",
    answer:
      "No. The pattern, flags, text, and replacement stay in this tab. The worker is created from a local script and receives a message through the browser, with no network request at any point.",
  },
  {
    question: "Why did my pattern find no matches?",
    answer:
      "Check the flags first. A pattern written for one line may need the m flag for a caret to match after a newline, and a pattern with a dot may need the s flag to cross one. Case-sensitive patterns also miss a capitalised word, which the i flag fixes.",
  },
  {
    question: "Why are only the first 100 matches listed?",
    answer:
      "The match list is capped for rendering, while the count and the highlighted text cover up to 1,000 matches. A pattern that matches every character can produce a very large list, and drawing all of it makes the page slow without adding useful information.",
  },
  {
    question: "Does the replace preview change my text?",
    answer:
      "No. The preview is a separate string built from the same pattern and flags. Your test text stays untouched, and you can copy the preview if you want to use the result. Without the g flag, only the first match is replaced.",
  },
];

export default function RegexTesterContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        A regular expression is a compact way to describe text, and a small mistake can change
        what it matches. This tester shows every match with its position, its capture groups, and
        a replacement preview, so you can check the pattern against real text before it reaches
        your code.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Type a pattern, or pick one from the pattern library to fill in a working example.</li>
        <li>Toggle the flags you need. The g flag is on by default so every match is listed.</li>
        <li>Paste the text to search and press <strong>Run test</strong>.</li>
        <li>
          Read the highlighted text and the match list. Capture groups and named groups appear
          under each match.
        </li>
        <li>Add a replacement to see the result of a replace operation with the same pattern.</li>
      </ol>

      <h2>What the flags do</h2>
      <p>
        The g flag repeats the search through the whole input. Without it, the tester reports the
        first match only, which is also how a browser replace behaves. The i flag ignores case. The
        m flag makes <code>^</code> and <code>$</code> match at line boundaries instead of only at
        the start and end of the input.
      </p>
      <p>
        The s flag lets a dot match a newline. The u flag enables Unicode mode, so a character
        outside the basic plane, such as an emoji, counts as one code point. The y flag makes the
        expression sticky: it can match only at the position where the previous match ended. Sticky
        matching is useful for parsers that walk through a string one token at a time.
      </p>

      <h2>Matches and groups</h2>
      <p>
        Each entry lists the zero-based index where the match starts and the exact text it covers.
        Numbered capture groups follow in parentheses order. A group that did not take part in the
        match is left unmatched rather than set to an empty string, because the two cases mean
        different things in a replacement.
      </p>
      <p>
        Named groups appear with their names, which makes a long pattern easier to read and a
        replacement easier to write. The replacement field accepts <code>$1</code> for a numbered
        group, <code>$&amp;</code> for the whole match, and <code>$&lt;name&gt;</code> for a named
        group. The preview uses the same flags as the match, so a pattern without g replaces one
        occurrence.
      </p>

      <h2>Zero-length matches</h2>
      <p>
        Some patterns match a position without consuming a character, such as a lookahead or an
        anchor. The tester advances one position after a zero-length match so the search always
        ends, and the list shows these entries as empty matches. They are still useful: a count of
        lookahead matches can confirm that a pattern would split a string at the right places.
      </p>

      <h2>Safety and limits</h2>
      <p>
        Matching runs in a Web Worker with a 750 millisecond limit. If the worker does not answer
        in time, it is terminated and the page reports a timeout. That protects the interface from
        catastrophic backtracking, the case where a nested quantifier explores an exponential
        number of paths. A simpler expression or a more specific character class usually fixes it.
      </p>
      <p>
        Results stop at 1,000 matches and the visible list stops at 100, with a note when a cap was
        reached. The pattern library holds common expressions for email addresses, URLs, ISO dates,
        whitespace runs, and digits. Selecting one fills in the fields without running the test, so
        you can adjust it first.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
