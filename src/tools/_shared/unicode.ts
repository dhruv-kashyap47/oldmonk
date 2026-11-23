/**
 * Style application for the Unicode text maps. Framework-free: no Solid, no
 * DOM, no storage, no network.
 *
 * Input is iterated with `Array.from`, which walks code points. A character
 * outside the Basic Multilingual Plane (an emoji, a mathematical letter) is
 * therefore kept whole instead of being split into two broken surrogates.
 */

import type { UnicodeStyle } from "./unicode-fonts.data";

export interface StyledText {
  readonly text: string;
  readonly styleId: string;
  readonly styleName: string;
  /** Visible characters whose glyph changed. */
  readonly mappedCount: number;
  /** Distinct visible characters that kept their original glyph, in first-seen order. */
  readonly passthrough: readonly string[];
}

const STRIKE_MARK = "\u0336";
const WHITESPACE = /^\s$/u;

function isLoneSurrogate(code: number): boolean {
  return (code >= 0xd800 && code <= 0xdbff) || (code >= 0xdc00 && code <= 0xdfff);
}

/** True when a high or low surrogate appears without its partner. */
export function hasLoneSurrogate(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
      index += 1;
    } else if (isLoneSurrogate(code)) {
      return true;
    }
  }
  return false;
}

/** Length in code points, which is what a person sees as characters. */
export function codePointLength(text: string): number {
  return Array.from(text).length;
}

function collectPassthrough(seen: string[], characters: readonly string[]): void {
  for (const character of characters) {
    if (WHITESPACE.test(character)) continue;
    if (!seen.includes(character)) seen.push(character);
  }
}

function mapCharacters(
  text: string,
  style: UnicodeStyle,
): { text: string; mappedCount: number; passthrough: readonly string[] } {
  const passthrough: string[] = [];
  let mappedCount = 0;
  let output = "";

  for (const character of text) {
    const glyph = style.map.get(character);
    if (glyph !== undefined && glyph !== character) {
      output += glyph;
      mappedCount += 1;
    } else {
      output += character;
      if (glyph === undefined && !WHITESPACE.test(character)) {
        collectPassthrough(passthrough, [character]);
      }
    }
  }

  return { text: output, mappedCount, passthrough };
}

function strikeCharacters(text: string): { text: string; mappedCount: number } {
  let output = "";
  let mappedCount = 0;
  for (const character of text) {
    if (WHITESPACE.test(character)) {
      output += character;
    } else {
      output += character + STRIKE_MARK;
      mappedCount += 1;
    }
  }
  return { text: output, mappedCount };
}

function upsideDownCharacters(
  text: string,
  style: UnicodeStyle,
): { text: string; mappedCount: number; passthrough: readonly string[] } {
  const passthrough: string[] = [];
  let mappedCount = 0;

  // Each line is reversed on its own so line breaks keep their position.
  const lines = text.split("\n").map((line) => {
    const reversed = Array.from(line).reverse();
    let output = "";
    for (const character of reversed) {
      const glyph = style.map.get(character);
      if (glyph !== undefined && glyph !== character) {
        output += glyph;
        mappedCount += 1;
      } else {
        output += character;
        if (glyph === undefined && !WHITESPACE.test(character)) {
          collectPassthrough(passthrough, [character]);
        }
      }
    }
    return output;
  });

  return { text: lines.join("\n"), mappedCount, passthrough };
}

/** Applies one style to a string and reports what changed. */
export function applyStyle(text: string, style: UnicodeStyle): StyledText {
  if (style.mode === "strike") {
    const result = strikeCharacters(text);
    return {
      text: result.text,
      styleId: style.id,
      styleName: style.name,
      mappedCount: result.mappedCount,
      passthrough: [],
    };
  }

  if (style.mode === "upsideDown") {
    const result = upsideDownCharacters(text, style);
    return {
      text: result.text,
      styleId: style.id,
      styleName: style.name,
      mappedCount: result.mappedCount,
      passthrough: result.passthrough,
    };
  }

  const result = mapCharacters(text, style);
  return {
    text: result.text,
    styleId: style.id,
    styleName: style.name,
    mappedCount: result.mappedCount,
    passthrough: result.passthrough,
  };
}

/** Convenience wrapper for a page that only needs the text. */
export function styledText(text: string, style: UnicodeStyle): string {
  return applyStyle(text, style).text;
}

/**
 * True when the style can draw the character with a different glyph. Digits in
 * script, for example, return false because the style has no digit forms.
 */
export function isStyledCharacter(style: UnicodeStyle, character: string): boolean {
  if (style.mode === "strike") return !WHITESPACE.test(character);
  const glyph = style.map.get(character);
  return glyph !== undefined && glyph !== character;
}
