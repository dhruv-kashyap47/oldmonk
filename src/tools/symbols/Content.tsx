import { FAQ } from "../../components/tool/FAQ";
import type { FAQItem } from "../types";

export const faq: readonly FAQItem[] = [
  {
    question: "Are the symbols free to use?",
    answer:
      "The characters themselves are part of Unicode, which is an open standard. A heart or an arrow is not a logo or an illustration you need to license. Some emoji glyphs are drawn by the platform vendor, so the exact picture changes between an iPhone, a Windows PC, and an Android phone.",
  },
  {
    question: "Why does a symbol look different after I paste it?",
    answer:
      "The receiving app chooses the font. Most of these characters have a text form and an emoji form, and a chat client may prefer the color emoji version while a document editor shows a monochrome glyph. The copied character is identical in both cases; only the drawing changes.",
  },
  {
    question: "Where are the recent symbols stored?",
    answer:
      "The last eight copied symbols are saved in this browser under a local key. They never leave the device, and clearing site data removes them. The search text and the selected category are not saved.",
  },
  {
    question: "Can I copy more than one symbol at a time?",
    answer:
      "Yes. The copy all button copies every symbol currently visible, separated by spaces. If you narrow the list with a search or a category first, only that filtered set is copied. A single click on a tile copies just that character.",
  },
  {
    question: "Do symbols work in every font?",
    answer:
      "Many do, because the common hearts, stars, arrows, and currency signs live in widely installed fonts. Newer emoji and some aesthetic marks are missing from older systems, where they may show as a box. Paste into the final app to check before you rely on a symbol in a name or a heading.",
  },
  {
    question: "Can I search by typing the symbol itself?",
    answer:
      "Yes. The search text includes the character as well as its name, keywords, and category, so a pasted heart or star matches. Typing a name is usually faster than finding the character on a keyboard.",
  },
  {
    question: "What happens when I combine a search with a category?",
    answer:
      "Both filters apply at once. Pick Arrows and type double to see only arrow entries that match, then switch the category back to All to search the full catalog.",
  },
  {
    question: "Can I copy a symbol with the keyboard?",
    answer:
      "Yes. Each tile is a button, so Tab moves through the grid and Enter or Space copies the focused symbol. Copy all visible is a button too, and the confirmation appears in a status line.",
  },
  {
    question: "Why does a two word search return fewer results?",
    answer:
      "Every word in the query has to match the same entry. White star finds entries that mention both words, while star alone returns the full star set. Drop a word when the list looks too short.",
  },
  {
    question: "Does this page restyle whole words?",
    answer:
      "This page copies single characters, such as a heart, an arrow, or a currency sign. A fancy text generator rewrites whole letters into styled alphabets, which is a different job and a different output.",
  },
];

export default function SymbolsContent() {
  return (
    <div class="prose-catalog">
      <p class="lede">
        A symbol can do the work of a whole word in a tight space: a heart in a bio, an
        arrow in a menu, a star beside a favorite. This page collects the characters people
        reach for most, names them, and copies one on a click.
      </p>

      <h2>Eight symbol categories</h2>
      <p>
        Hearts covers the card suit pair, outlined forms, floral hearts, and the common
        color emoji. Stars runs from a plain filled star to four pointed sparkles and an
        asterism. Arrows includes straight, diagonal, double, hooked, and refresh arrows.
        Currency holds signs for the dollar, euro, pound, yen, rupee, and a long list of
        others. Math covers comparison, set, calculus, and geometry marks. Punctuation adds
        bullets, guillemets, daggers, and the interrobang. Aesthetic gathers florettes,
        asterisks, moons, and small ornaments. Games has card suits, chess pieces, dice
        faces, and a few emoji.
      </p>
      <p>
        Each entry has a name and a short set of keywords. The search looks at all of them,
        and it also matches the category name. Typing <code>heart</code> finds the suit and
        the emoji. Typing <code>chess</code> finds the pieces even though the word is not in
        every name. A multi word search such as <code>white star</code> narrows the list to
        entries that match both words.
      </p>

      <h2>Copying and recents</h2>
      <p>
        A click or tap on a tile copies that one character and shows a short confirmation.
        The copy all button copies the visible set with spaces between the symbols, which
        is handy for building a decorative line or a row of icons in a message. The count
        above the grid follows the filter, so you always know how many symbols a copy
        action will take.
      </p>
      <p>
        The eight most recent picks appear in their own row. They are stored in the
        browser with <code>localStorage</code>, which means a reload keeps them and another
        device does not see them. Copying a symbol that is already in the row moves it back
        to the front instead of adding a duplicate. Clearing site data for this origin
        removes the row.
      </p>

      <h2>Text symbols and emoji</h2>
      <p>
        Some characters here are plain text, such as the black heart suit or a left arrow.
        Others are emoji, such as the sparkling heart or the game controller. Text symbols
        usually inherit the color of the surrounding text and scale with the font size.
        Emoji usually keep their own colors and may sit on a different baseline. Mixing the
        two in one line can look uneven, so check the result at the size you plan to use.
      </p>
      <p>
        Font coverage is the other variable. The mathematical arrows and currency signs are
        widely supported. Chess pieces and dice faces are common on desktop systems but
        less reliable in a few mobile browsers. A missing glyph appears as a box or a
        question mark shaped placeholder, which is a sign to choose a simpler character.
      </p>

      <h2>Naming and screen readers</h2>
      <p>
        Every tile has an accessible name that starts with the word copy and then the
        symbol name, so a screen reader user hears "Copy Euro sign" rather than an
        unexplained character. The visual grid also prints the name under each symbol,
        which helps when two shapes look alike. A symbol used as the only label on a button
        or a link is a risk, because speech output may read the name instead of the meaning.
        Keep a text label beside it when the action matters.
      </p>

      <h2>Search and recents stay in this browser</h2>
      <p>
        The catalog is part of the page. Search and filtering happen in the browser, and no
        symbol, query, or recent list is sent anywhere. The only stored data is the recent
        row described above.
      </p>

      <FAQ items={faq} />
    </div>
  );
}
