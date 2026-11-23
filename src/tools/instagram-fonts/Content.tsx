import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Does Instagram support these fonts?",
    answer:
      "Instagram accepts the characters as plain text, because they are ordinary Unicode code points rather than a font file. How they look depends on the phone or browser that draws the profile. Current iOS and Android releases cover the common styles, and an older device may show a plain letter or a box for one of them.",
  },
  {
    question: "How does the 150 character counter work?",
    answer:
      "The counter measures the plain text you type, including spaces and line breaks, one code point at a time. Some styled characters are stored as two UTF-16 units, and Instagram may count a styled bio differently. Keep a few characters of room, and check the field after pasting.",
  },
  {
    question: "Can I use line breaks in a bio?",
    answer:
      "Yes. Press return in the field and the break is kept in every preview and in the copied text. Instagram displays those breaks in a bio, which makes a three line layout possible: name, role, and city. A caption keeps them as well.",
  },
  {
    question: "Should I use a styled font in a caption?",
    answer:
      "A caption has much more room than a bio, so a styled line works there as a heading rather than as the whole text. Long paragraphs in script are slow to read and may be read poorly by a screen reader. Use one styled line for the opening and keep the rest in normal letters.",
  },
  {
    question: "Is this page part of Instagram?",
    answer:
      "No. The page is an independent text tool and is not affiliated with Instagram, Meta, or any of their products. It does not log in, request an account, or send anything to those services. The name is used only to describe the 150 character bio field.",
  },
];

export default function InstagramFontsContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        An Instagram bio is a short field with a hard limit, so the style has to earn its
        space. This page turns a plain bio into nine Unicode alphabets, keeps your line
        breaks, and counts the characters before you paste.
      </p>

      <h2>The 150 character field</h2>
      <p>
        The counter above the previews follows the input as you type. It counts code
        points, which means an emoji counts as one character rather than as the two UTF-16
        units JavaScript sees internally. Spaces and line breaks count too. When the number
        passes 150, the page marks the text as over the limit and offers a trim button that
        cuts at the boundary without splitting an emoji.
      </p>
      <p>
        Styled text can behave differently inside the app. Styled letters can sit outside
        the Basic Multilingual Plane, and a platform may count stored code units rather
        than the characters a person sees. Leave a small margin at the end of the bio
        instead of filling all 150 positions.
      </p>

      <h2>Bio and caption are different jobs</h2>
      <p>
        A bio is an identity line. It holds a name, a role, a city, and perhaps a link, and
        it appears on every profile view. A caption is a post field with room for several
        sentences. The same styled line that feels crowded in a bio can work as the first
        line of a caption, where it acts like a heading above ordinary text.
      </p>
      <p>
        For a bio, pick one style and stop there. Mixing script, bold, and fullwidth in the
        same short block makes the profile harder to scan. For a caption, one styled
        opening line and a plain body is usually enough. Keep hashtags and contact details
        in plain letters so they remain searchable and easy to copy.
      </p>

      <h2>Line breaks</h2>
      <p>
        Press return in the input field and the break appears in every preview. The copy
        buttons preserve it because the conversion works one code point at a time and never
        removes whitespace. A three line bio is the common pattern: the name or handle in
        the chosen style, then a role, then a place or a short call to action.
      </p>
      <p>
        The line count beside the counter tells you how many lines the field currently
        holds. If a style looks cramped, remove a line before you change the font. A short
        bio with clear breaks reads better than a longer one with decoration on every line.
      </p>

      <h2>The nine styles</h2>
      <p>
        The set covers bold, italic, bold italic, script, bold script, sans bold,
        double-struck, monospace, and fullwidth. These are Unicode code point substitutions,
        not a font setting, so the styled text survives a copy and paste into any plain text
        field. The app on the other end still chooses the typeface that draws the glyphs.
      </p>
      <p>
        Some characters have no styled form. Digits stay plain in script, bold script, and
        italic. Accented letters and emoji keep their original form. That is normal and
        usually looks better than forcing a substitute. If a style shows an empty box on
        your own phone, it will likely do the same on a visitor's phone, so choose a
        different style before you publish.
      </p>

      <h2>Accessibility and affiliation</h2>
      <p>
        A screen reader may read styled letters by their Unicode names or spell them out.
        Keep the important words, such as a name or a service, in plain letters somewhere
        in the profile so the page stays usable without the decoration. The page does not
        log in, connect to an account, or send the bio anywhere. It is an independent tool
        and is not affiliated with Instagram.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
