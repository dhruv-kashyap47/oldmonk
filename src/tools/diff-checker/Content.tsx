import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "What does the diff algorithm actually do?",
    answer:
      "The checker uses Myers, the same family of algorithm behind git diff. It finds the shortest sequence of insertions and deletions that turns the left text into the right text, then groups nearby changes into hunks with three lines of context. A replaced line is shown as one deletion and one insertion.",
  },
  {
    question: "What does ignore whitespace compare?",
    answer:
      "Each line is trimmed, and runs of spaces or tabs inside the line collapse to a single space before comparison. Indentation changes and trailing spaces then stop counting as edits. The original text is still what you see in the result, so the view does not hide the formatting difference.",
  },
  {
    question: "Why does a trailing newline show up as a change?",
    answer:
      "A final line break creates an empty last line. If one side ends with a newline and the other does not, the diff reports that empty line as added or removed. That matches how many editors warn about a missing newline at the end of a file.",
  },
  {
    question: "Are my texts uploaded?",
    answer:
      "No. The comparison runs in this tab, and the texts are not sent to a server or saved in local storage. A reload clears both fields, so copy or download anything you need before leaving the page.",
  },
  {
    question: "Why is there a size limit?",
    answer:
      "The algorithm keeps a trace of its search so it can rebuild the edit list, and that cost grows with the number of differing lines. The cap of 2,000 lines and 200 KB per side keeps the page responsive. For a very large file, compare it with git diff or another command line tool.",
  },
];

export default function DiffCheckerContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        A diff shows what changed between two versions of a text. This checker compares them line
        by line, marks the added and removed lines, and highlights the words that changed inside a
        replaced line.
      </p>

      <h2>How to use it</h2>
      <ol>
        <li>Paste the original text in the left field and the changed text in the right field.</li>
        <li>
          Turn on <strong>Ignore whitespace</strong> or <strong>Ignore case</strong> when those
          differences should not count.
        </li>
        <li>Press <strong>Compare texts</strong>.</li>
        <li>
          Switch between <strong>Side by side</strong> and <strong>Unified</strong>, or copy the
          unified diff for a bug report.
        </li>
      </ol>
      <p>
        The <strong>Swap sides</strong> button exchanges the two fields, which is useful when the
        newer text ended up on the left. The line counts reset when you edit a field or change an
        option, so the result always matches the current text.
      </p>

      <h2>The Myers algorithm</h2>
      <p>
        Myers finds the shortest edit script between two sequences. It walks diagonally through a
        grid of line positions, extending the best path at each step, and records how many
        insertions and deletions each path used. The shortest path becomes the diff. Common lines
        at the start and end are matched first, which keeps the search small for typical edits.
      </p>
      <p>
        The result is a list of equal, deleted, and inserted lines. Consecutive deletions and
        insertions are paired into replace rows for the side by side view, and the unified view
        keeps the standard minus and plus prefixes. A deletion followed by an insertion is one
        change in meaning even though the algorithm records two operations.
      </p>

      <h2>Two views</h2>
      <p>
        Side by side puts the original on the left and the changed text on the right, with line
        numbers on each side. A row with a deletion has an empty right cell, and a row with an
        insertion has an empty left cell. A replace row has text in both cells with the changed
        words tinted.
      </p>
      <p>
        The unified view is the compact form used by patch files. Each changed line starts with a
        minus or a plus, unchanged context lines start with a space, and a header such as{" "}
        <code>@@ -3,7 +3,7 @@</code> gives the line range on each side. Copies of the unified view
        can be pasted into a message or a code review.
      </p>

      <h2>Ignoring noise</h2>
      <p>
        Whitespace and case options change only the comparison, not the displayed text.
        Reindenting a block or changing the case of a word can be intentional or accidental, and
        the two options let you separate those edits from real content changes. The stats and the
        highlighted line follow the comparison you chose.
      </p>

      <h2>Limits and privacy</h2>
      <p>
        Each side is limited to 2,000 lines and 200 KB. A large diff can use a lot of memory because
        the algorithm keeps its search history, and a browser tab is not the right place for a
        multi-megabyte source tree. The checker reports which side crossed the limit before it
        starts.
      </p>
      <p>
        Both texts are processed locally. Nothing is uploaded, and the page does not store them
        between visits. The inline word diff is computed from the line that changed, so a replaced
        line with hundreds of words still renders as ordinary text nodes in the page.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
