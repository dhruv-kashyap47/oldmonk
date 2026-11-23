import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Is this a font I can install?",
    answer:
      "No. The page replaces each letter with a cursive code point from Unicode, so there is no file to download. That is why the text can be pasted anywhere plain text is accepted, and also why the result depends on the fonts already installed on the device that displays it.",
  },
  {
    question: "Why do the numbers in my name stay normal?",
    answer:
      "Script, bold script, italic, and bold italic have no digit forms in Unicode. The generator leaves numbers alone so they stay readable. The same happens to accented letters, emoji, and characters from other writing systems.",
  },
  {
    question: "Which uppercase letters are unusual?",
    answer:
      "Script uppercase B, E, F, H, I, L, M, and R come from the Letterlike Symbols block instead of the Mathematical Script block. They are the correct forms, not substitutes, but a font that covers only the mathematical range may draw them as boxes. The support table lists this per style.",
  },
  {
    question: "Will a cursive signature survive email?",
    answer:
      "Often, but not always. Plain text email keeps the code points. Rich text email may keep them too, while some corporate mail systems replace unknown glyphs with a fallback font. Send yourself a test message before you add the signature to every reply.",
  },
  {
    question: "Can I use the signature block for a business card?",
    answer:
      "Use it as a preview only. A printer needs a real vector or high resolution file, and a cursive Unicode string may not match the typeface you licensed. Give the printer the name in ordinary text and let the designer set it in the chosen face.",
  },
];

export default function CursiveTextGeneratorContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        Cursive text on the web is usually a set of Unicode letters that look handwritten.
        Nothing is installed and no font is switched. The page swaps each letter for a
        script or italic code point, and the app that displays the result draws it with the
        fonts it already has.
      </p>

      <h2>The four styles</h2>
      <p>
        Script is the closest match to joined handwriting. Bold script keeps the same shapes
        with heavier strokes. Italic is a slanted serif alphabet, and bold italic adds
        weight. All four come from the Mathematical Alphanumeric Symbols block, with a few
        uppercase letters taken from Letterlike Symbols because the mathematical block
        leaves gaps there.
      </p>
      <p>
        The page walks the input one code point at a time. Emoji and other characters
        outside the Basic Multilingual Plane are copied whole, not split into broken
        surrogate halves. Letters outside A to Z, digits, and most punctuation keep their
        original form. A note above the table names the characters that stayed plain.
      </p>

      <h2>Signature blocks</h2>
      <p>
        A signature reads best in two parts: the name in script, then a role or location in
        ordinary letters. The second line does the work when a font has no cursive glyph,
        when the text is read aloud, or when someone needs to search for the name. The
        signature builder on this page keeps that split and copies both lines together.
      </p>
      <p>
        Keep the name line short. A first name and a surname fit most profile fields, while
        a full company name in script becomes hard to scan. If the signature goes into an
        email footer, add the phone number and website in plain text below the role. If it
        goes on a card or a poster, treat the copied text as a draft and have the final
        artwork set in a licensed typeface.
      </p>

      <h2>Where it renders</h2>
      <p>
        iPhones, iPads, and Macs ship fonts for the mathematical alphabets, and current
        Windows and Android releases cover most of the range. Instagram, WhatsApp, Telegram,
        Discord, and most browsers pass the characters through unchanged. The weak spots are
        older Android phones, some email clients, PDF export tools, and design apps that
        replace missing glyphs with a fallback family.
      </p>
      <p>
        A missing glyph usually appears as a plain letter or an empty box. That is a font
        problem, not a broken copy. The underlying string is intact, so pasting it into an
        app with better coverage restores the look. Test the exact destination before a
        launch, a wedding invitation, or a printed menu, because the preview in this tab
        only shows the fonts on this device.
      </p>

      <h2>Uppercase gaps and fallback</h2>
      <p>
        Script uppercase B, E, F, H, I, L, M, and R live in Letterlike Symbols. Fraktur and
        double-struck have similar borrowing, though this page only offers the four cursive
        styles. None of the four has digits, so a year or a house number stays in the normal
        font. Lowercase h in italic is the Planck constant letter, a detail that surprises
        people who inspect the code points.
      </p>
      <p>
        Some apps normalize pasted text, which can turn styled letters back into plain
        Latin. Password fields and a few search boxes do this by design. Keep the plain
        name in a note if the exact string matters for a login, a filename, or a database
        key.
      </p>

      <h2>Accessibility</h2>
      <p>
        A screen reader may read a cursive letter by its Unicode name, spell it out, or skip
        it. Short display names are tolerable. A paragraph in script is not. Write the same
        information in ordinary letters nearby, especially on a page that people need to
        understand without seeing the decoration.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
