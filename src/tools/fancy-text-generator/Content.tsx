import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Will fancy text work in every app?",
    answer:
      "Most modern phones and browsers can draw the Mathematical Alphanumeric Symbols block, which covers bold, italic, script, and monospace. Support stops there. A few chat clients, older Android builds, and some email fonts show a box or a plain letter for script and fraktur. Paste a preview into the app you plan to use before you commit to a name.",
  },
  {
    question: "Why do some letters stay plain?",
    answer:
      "Unicode does not provide a styled form for every character. Script has no digits, small caps has no capital X, and emoji are outside these alphabets. The tool leaves those characters exactly as typed so the result still reads correctly. A note under the grid lists the characters that kept their plain form.",
  },
  {
    question: "Can I get the plain text back?",
    answer:
      "The generator keeps your input untouched, so the original line is still in the field above the previews. If you only have the styled copy, paste it into a converter that applies Unicode normalization, or retype the line. Several style maps are reversible by hand, but a reversed upside down line needs the conversion table.",
  },
  {
    question: "How do screen readers handle styled letters?",
    answer:
      "They vary. Some announce the code point name, such as mathematical bold capital A. Others read the letter, and some skip characters they cannot classify. A profile name written in script may be spelled out slowly or read as gibberish. Keep a plain version of important names in the bio or caption as well.",
  },
  {
    question: "Does the generator store or send my text?",
    answer:
      "No. Every preview is built in this browser tab from a local character table. The text is not uploaded, there is no account, and a reload clears the field.",
  },
];

export default function FancyTextGeneratorContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        A fancy text generator swaps ordinary letters for lookalike characters from the
        Unicode standard. The result is still text. It can be selected, copied, and pasted
        into a message or a profile field, and the app on the other side draws it with
        whatever font it has.
      </p>

      <h2>How the styles work</h2>
      <p>
        Unicode includes several complete alphabets for mathematics and typography. The
        Mathematical Alphanumeric Symbols block holds bold, italic, bold italic, sans
        bold, script, bold script, fraktur, bold fraktur, double-struck, and monospace
        letters, plus matching digits in some of those styles. Other blocks supply circled
        letters, fullwidth forms used in East Asian text, and the small capitals that come
        from phonetic notation.
      </p>
      <p>
        This page maps each Latin letter and digit to the matching code point. It walks the
        input one code point at a time, so an emoji or a mathematical letter already in the
        text is never split in half. Characters outside the maps, including emoji,
        punctuation, accents, and scripts such as Greek or Japanese, pass through
        unchanged.
      </p>
      <p>
        Strikethrough works differently. It adds a combining long stroke after each
        visible character instead of choosing a different letter, so the original letters
        stay in the string with a mark after each one. Upside down text uses a substitution
        table and reverses the order of each line.
      </p>

      <h2>Where the styles render</h2>
      <p>
        Font coverage is the limit. Apple platforms generally include the mathematical
        alphabets, and current versions of Windows and Android cover most of them. Script
        and fraktur are the first to go missing, especially in older system fonts and in
        email clients that substitute their own typeface. If a character has no glyph, the
        app may fall back to a plain letter or show an empty box, and the same string can
        look different on two phones.
      </p>
      <p>
        Some platforms also count characters differently. A styled letter can be a single
        code point, a surrogate pair, or a base letter plus a combining mark. A field that
        allows 150 characters may accept fewer visible letters once the text is styled.
        Check the counter in the app after pasting.
      </p>

      <h2>Fallback and cleanup</h2>
      <p>
        Latin letters A to Z and digits 0 to 9 are covered wherever the chosen Unicode
        style defines them. The script and fraktur families, and italic, have no digit set,
        so numbers stay in the ordinary font. Small caps maps X to a plain lowercase x
        because Unicode has no small capital form for it. Circled letters stop at the
        English alphabet, which means accented letters and other scripts remain plain.
      </p>
      <p>
        If you paste styled text into a field that normalizes Unicode, the letters can
        collapse back to their plain forms. Password fields, some search boxes, and a few
        content management systems do this on purpose. Treat the styled copy as decoration
        for display, and keep the plain line for anything that must be matched exactly.
      </p>

      <h2>Accessibility</h2>
      <p>
        A screen reader may announce the name of each styled code point rather than the
        letter it resembles. What sounds like a short name to you can become a long string
        of descriptions to someone using speech. The same risk applies to text-to-speech in
        maps and voice assistants. Use these styles for a display name or a short caption,
        and write the important information again in ordinary letters.
      </p>

      <h2>Using the previews</h2>
      <p>
        Type once and every style updates in place. Each card has its own copy button, and
        the copy all button produces a labelled list so you can compare the styles in a
        document. Clear empties the field and returns the grid to its sample text. Nothing
        leaves the tab, and no history is saved.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
