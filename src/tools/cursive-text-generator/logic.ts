/**
 * Cursive text conversion on a small, curated set of handwriting-like Unicode
 * styles. Framework-free: no Solid, no DOM, no storage.
 */

import { CURSIVE_STYLE_IDS, stylesByIds } from "../_shared/unicode-fonts.data";
import { applyStyle, codePointLength } from "../_shared/unicode";

export interface CursivePreview {
  readonly id: string;
  readonly name: string;
  readonly blurb: string;
  readonly text: string;
  readonly characters: number;
  readonly mappedCount: number;
  readonly passthrough: readonly string[];
}

export interface CursiveSupportRow {
  readonly id: string;
  readonly name: string;
  readonly uppercase: string;
  readonly lowercase: string;
  readonly digits: string;
  readonly missingGlyph: string;
}

export const CURSIVE_STYLES = stylesByIds(CURSIVE_STYLE_IDS);

export const CURSIVE_SUPPORT: readonly CursiveSupportRow[] = [
  {
    id: "script",
    name: "Script",
    uppercase: "A to Z, seven drawn from Letterlike Symbols",
    lowercase: "a to z",
    digits: "Plain digits",
    missingGlyph: "Plain letter or a box in older fonts",
  },
  {
    id: "bold-script",
    name: "Bold script",
    uppercase: "A to Z in one block",
    lowercase: "a to z in one block",
    digits: "Plain digits",
    missingGlyph: "Plain letter in fonts without the block",
  },
  {
    id: "italic",
    name: "Italic",
    uppercase: "A to Z, with the Planck constant as h",
    lowercase: "a to z, with h from Letterlike Symbols",
    digits: "Plain digits",
    missingGlyph: "Usually renders, rarely boxed",
  },
  {
    id: "bold-italic",
    name: "Bold italic",
    uppercase: "A to Z in one block",
    lowercase: "a to z in one block",
    digits: "Plain digits",
    missingGlyph: "Falls back to plain letters",
  },
];

export function generateCursive(text: string, styleId: string): CursivePreview | null {
  const style = CURSIVE_STYLES.find((entry) => entry.id === styleId);
  if (!style) return null;
  const result = applyStyle(text, style);
  return {
    id: style.id,
    name: style.name,
    blurb: style.blurb,
    text: result.text,
    characters: codePointLength(result.text),
    mappedCount: result.mappedCount,
    passthrough: result.passthrough,
  };
}

export function generateAllCursive(text: string): readonly CursivePreview[] {
  return CURSIVE_STYLES.map((style) => {
    const result = applyStyle(text, style);
    return {
      id: style.id,
      name: style.name,
      blurb: style.blurb,
      text: result.text,
      characters: codePointLength(result.text),
      mappedCount: result.mappedCount,
      passthrough: result.passthrough,
    };
  });
}

/** Digits and other characters that keep their plain form in every cursive style. */
export function cursivePassthrough(cursors: readonly CursivePreview[]): readonly string[] {
  const seen: string[] = [];
  for (const preview of cursors) {
    for (const character of preview.passthrough) {
      if (!seen.includes(character)) seen.push(character);
    }
  }
  return seen;
}

/**
 * A two-line signature card: the name in the chosen script, then a plain role
 * line so the meaning survives a font that lacks the glyphs.
 */
export function signatureBlock(name: string, role: string, styleId: string): string {
  const styled = generateCursive(name, styleId);
  if (!styled) return "";
  const firstLine = styled.text;
  const secondLine = role.trim();
  return secondLine.length > 0 ? `${firstLine}\n${secondLine}` : firstLine;
}
