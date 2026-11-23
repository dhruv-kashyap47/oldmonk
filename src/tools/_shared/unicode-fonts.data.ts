/**
 * Character maps for the Unicode text styles used by the text tools.
 *
 * Every map is keyed by a single code point. Styles that rely on a combining
 * mark or on reversal are marked with a mode instead of a full map. The maps
 * are built from code point ranges so surrogate pairs stay intact.
 *
 * Framework-free. No DOM, storage, or network access.
 */

export type UnicodeStyleMode = "map" | "strike" | "upsideDown";

export interface UnicodeStyle {
  readonly id: string;
  readonly name: string;
  /** One short line for a style card. */
  readonly blurb: string;
  readonly mode: UnicodeStyleMode;
  readonly map: ReadonlyMap<string, string>;
  /** True when the style has its own digit glyphs rather than passing them through. */
  readonly styledDigits: boolean;
}

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";

function codePoints(start: number, count: number): readonly string[] {
  const output: string[] = [];
  for (let index = 0; index < count; index += 1) {
    output.push(String.fromCodePoint(start + index));
  }
  return output;
}

function alphabetMap(
  upper: readonly string[],
  lower: readonly string[],
  digits?: readonly string[],
): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  const assign = (letters: string, glyphs: readonly string[]): void => {
    Array.from(letters).forEach((letter, index) => {
      const glyph = glyphs[index];
      if (glyph !== undefined) map.set(letter, glyph);
    });
  };
  assign(UPPER, upper);
  assign(LOWER, lower);
  if (digits) assign(DIGITS, digits);
  return map;
}

const BOLD_MAP = alphabetMap(
  codePoints(0x1d400, 26),
  codePoints(0x1d41a, 26),
  codePoints(0x1d7ce, 10),
);

const ITALIC_LOWER = [...codePoints(0x1d44e, 26)];
// Mathematical italic small h is reserved; the Planck constant letter fills it.
ITALIC_LOWER[7] = String.fromCodePoint(0x210e);
const ITALIC_MAP = alphabetMap(codePoints(0x1d434, 26), ITALIC_LOWER);

const BOLD_ITALIC_MAP = alphabetMap(codePoints(0x1d468, 26), codePoints(0x1d482, 26));

const SANS_BOLD_MAP = alphabetMap(
  codePoints(0x1d5d4, 26),
  codePoints(0x1d5ee, 26),
  codePoints(0x1d7ec, 10),
);

// Script upper case mixes the Mathematical Script block with seven letters that
// live in the Letterlike Symbols block (B, E, F, H, I, L, M, R).
const SCRIPT_UPPER = [
  0x1d49c, 0x212c, 0x1d49e, 0x1d49f, 0x2130, 0x2131, 0x1d4a2, 0x210b, 0x2110, 0x1d4a5,
  0x1d4a6, 0x2112, 0x2133, 0x1d4a9, 0x1d4aa, 0x1d4ab, 0x1d4ac, 0x211b, 0x1d4ae, 0x1d4af,
  0x1d4b0, 0x1d4b1, 0x1d4b2, 0x1d4b3, 0x1d4b4, 0x1d4b5,
].map((point) => String.fromCodePoint(point));

const SCRIPT_LOWER = [
  0x1d4b6, 0x1d4b7, 0x1d4b8, 0x1d4b9, 0x212f, 0x1d4bb, 0x210a, 0x1d4bd, 0x1d4be, 0x1d4bf,
  0x1d4c0, 0x1d4c1, 0x1d4c2, 0x1d4c3, 0x2134, 0x1d4c5, 0x1d4c6, 0x1d4c7, 0x1d4c8, 0x1d4c9,
  0x1d4ca, 0x1d4cb, 0x1d4cc, 0x1d4cd, 0x1d4ce, 0x1d4cf,
].map((point) => String.fromCodePoint(point));

const SCRIPT_MAP = alphabetMap(SCRIPT_UPPER, SCRIPT_LOWER);

const BOLD_SCRIPT_MAP = alphabetMap(codePoints(0x1d4d0, 26), codePoints(0x1d4ea, 26));

// Fraktur upper case also borrows five letters from Letterlike Symbols
// (C, H, I, R, Z).
const FRAKTUR_UPPER = [
  0x1d504, 0x1d505, 0x212d, 0x1d507, 0x1d508, 0x1d509, 0x1d50a, 0x210c, 0x2111, 0x1d50d,
  0x1d50e, 0x1d50f, 0x1d510, 0x1d511, 0x1d512, 0x1d513, 0x1d514, 0x211c, 0x1d516, 0x1d517,
  0x1d518, 0x1d519, 0x1d51a, 0x1d51b, 0x1d51c, 0x2128,
].map((point) => String.fromCodePoint(point));

const FRAKTUR_MAP = alphabetMap(FRAKTUR_UPPER, codePoints(0x1d51e, 26));

const BOLD_FRAKTUR_MAP = alphabetMap(codePoints(0x1d56c, 26), codePoints(0x1d586, 26));

// Double-struck upper case borrows C, H, N, P, Q, R, Z from Letterlike Symbols.
const DOUBLE_STRUCK_UPPER = [
  0x1d538, 0x1d539, 0x2102, 0x1d53b, 0x1d53c, 0x1d53d, 0x1d53e, 0x210d, 0x1d540, 0x1d541,
  0x1d542, 0x1d543, 0x1d544, 0x2115, 0x1d546, 0x2119, 0x211a, 0x211d, 0x1d54a, 0x1d54b,
  0x1d54c, 0x1d54d, 0x1d54e, 0x1d54f, 0x1d550, 0x2124,
].map((point) => String.fromCodePoint(point));

const DOUBLE_STRUCK_MAP = alphabetMap(
  DOUBLE_STRUCK_UPPER,
  codePoints(0x1d552, 26),
  codePoints(0x1d7d8, 10),
);

const CIRCLED_DIGITS = [
  String.fromCodePoint(0x24ea),
  ...codePoints(0x2460, 9),
];

const CIRCLED_MAP = alphabetMap(
  codePoints(0x24b6, 26),
  codePoints(0x24d0, 26),
  CIRCLED_DIGITS,
);

const FULLWIDTH_MAP = alphabetMap(
  codePoints(0xff21, 26),
  codePoints(0xff41, 26),
  codePoints(0xff10, 10),
);

// Small caps use IPA and phonetic extensions. Uppercase and lowercase share the
// same glyphs because the block has no case distinction.
const SMALL_CAPS_GLYPHS = [
  0x1d00, 0x0299, 0x1d04, 0x1d05, 0x1d07, 0xa730, 0x0262, 0x029c, 0x026a, 0x1d0a,
  0x1d0b, 0x029f, 0x1d0d, 0x0274, 0x1d0f, 0x1d18, 0x01eb, 0x0280, 0xa731, 0x1d1b,
  0x1d1c, 0x1d20, 0x1d21, 0x0078, 0x028f, 0x1d22,
].map((point) => String.fromCodePoint(point));

const SMALL_CAPS_MAP = alphabetMap(SMALL_CAPS_GLYPHS, SMALL_CAPS_GLYPHS);

const MONOSPACE_MAP = alphabetMap(
  codePoints(0x1d670, 26),
  codePoints(0x1d68a, 26),
  codePoints(0x1d7f6, 10),
);

const UPSIDE_DOWN_MAP: ReadonlyMap<string, string> = new Map([
  ["A", "\u2200"],
  ["B", "\u{10412}"],
  ["C", "\u0186"],
  ["D", "\u15e1"],
  ["E", "\u018e"],
  ["F", "\u2132"],
  ["G", "\u2141"],
  ["H", "H"],
  ["I", "I"],
  ["J", "\u017f"],
  ["K", "\u029e"],
  ["L", "\u02e5"],
  ["M", "W"],
  ["N", "N"],
  ["O", "O"],
  ["P", "\u0500"],
  ["Q", "\u038c"],
  ["R", "\u1d1a"],
  ["S", "S"],
  ["T", "\u22a5"],
  ["U", "\u2229"],
  ["V", "\u039b"],
  ["W", "M"],
  ["X", "X"],
  ["Y", "\u2144"],
  ["Z", "Z"],
  ["a", "\u0250"],
  ["b", "q"],
  ["c", "\u0254"],
  ["d", "p"],
  ["e", "\u01dd"],
  ["f", "\u025f"],
  ["g", "\u0183"],
  ["h", "\u0265"],
  ["i", "\u1d09"],
  ["j", "\u027e"],
  ["k", "\u029e"],
  ["l", "l"],
  ["m", "\u026f"],
  ["n", "u"],
  ["o", "o"],
  ["p", "d"],
  ["q", "b"],
  ["r", "\u0279"],
  ["s", "s"],
  ["t", "\u0287"],
  ["u", "n"],
  ["v", "\u028c"],
  ["w", "\u028d"],
  ["x", "x"],
  ["y", "\u028e"],
  ["z", "z"],
  [".", "\u02d9"],
  [",", "'"],
  ["?", "\u00bf"],
  ["!", "\u00a1"],
  ["'", ","],
  ['"', "\u201e"],
  ["(", ")"],
  [")", "("],
  ["[", "]"],
  ["]", "["],
  ["{", "}"],
  ["}", "{"],
  ["<", ">"],
  [">", "<"],
  ["_", "\u203e"],
  [";", "\u061b"],
]);

const EMPTY_MAP: ReadonlyMap<string, string> = new Map();

export const UNICODE_STYLES: readonly UnicodeStyle[] = [
  { id: "bold", name: "Bold", blurb: "Heavy strokes, serif shapes", mode: "map", map: BOLD_MAP, styledDigits: true },
  { id: "italic", name: "Italic", blurb: "Slanted serif letters", mode: "map", map: ITALIC_MAP, styledDigits: false },
  { id: "bold-italic", name: "Bold italic", blurb: "Slanted and heavy", mode: "map", map: BOLD_ITALIC_MAP, styledDigits: false },
  { id: "sans-bold", name: "Sans bold", blurb: "Clean geometric weight", mode: "map", map: SANS_BOLD_MAP, styledDigits: true },
  { id: "script", name: "Script", blurb: "Joined handwriting", mode: "map", map: SCRIPT_MAP, styledDigits: false },
  { id: "bold-script", name: "Bold script", blurb: "Handwriting with weight", mode: "map", map: BOLD_SCRIPT_MAP, styledDigits: false },
  { id: "fraktur", name: "Fraktur", blurb: "Broken blackletter strokes", mode: "map", map: FRAKTUR_MAP, styledDigits: false },
  { id: "bold-fraktur", name: "Bold fraktur", blurb: "Heavy blackletter", mode: "map", map: BOLD_FRAKTUR_MAP, styledDigits: false },
  { id: "double-struck", name: "Double-struck", blurb: "Outline for math and sets", mode: "map", map: DOUBLE_STRUCK_MAP, styledDigits: true },
  { id: "circled", name: "Circled", blurb: "Letters inside rings", mode: "map", map: CIRCLED_MAP, styledDigits: true },
  { id: "fullwidth", name: "Fullwidth", blurb: "Wide forms from CJK text", mode: "map", map: FULLWIDTH_MAP, styledDigits: true },
  { id: "small-caps", name: "Small caps", blurb: "Lowercase height capitals", mode: "map", map: SMALL_CAPS_MAP, styledDigits: false },
  { id: "upside-down", name: "Upside down", blurb: "Turned letters, reversed order", mode: "upsideDown", map: UPSIDE_DOWN_MAP, styledDigits: false },
  { id: "strikethrough", name: "Strikethrough", blurb: "A line through each letter", mode: "strike", map: EMPTY_MAP, styledDigits: false },
  { id: "monospace", name: "Monospace", blurb: "Fixed-width typewriter cells", mode: "map", map: MONOSPACE_MAP, styledDigits: true },
];

/** Style ids shown on the cursive page, in display order. */
export const CURSIVE_STYLE_IDS = ["script", "bold-script", "italic", "bold-italic"] as const;

/** Style ids shown on the Instagram page, in display order. */
export const INSTAGRAM_STYLE_IDS = [
  "bold",
  "italic",
  "bold-italic",
  "script",
  "bold-script",
  "sans-bold",
  "double-struck",
  "monospace",
  "fullwidth",
] as const;

export function getUnicodeStyle(id: string): UnicodeStyle | undefined {
  return UNICODE_STYLES.find((style) => style.id === id);
}

/** Styles for the given ids, skipping ids that do not exist. Order follows the ids. */
export function stylesByIds(ids: readonly string[]): readonly UnicodeStyle[] {
  const output: UnicodeStyle[] = [];
  for (const id of ids) {
    const style = getUnicodeStyle(id);
    if (style) output.push(style);
  }
  return output;
}
