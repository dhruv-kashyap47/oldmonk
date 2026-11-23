/**
 * Fancy text conversion. Wraps the shared Unicode maps so the page deals in
 * previews, not raw maps. Framework-free: no Solid, no DOM, no storage.
 */

import { UNICODE_STYLES, getUnicodeStyle, type UnicodeStyle } from "../_shared/unicode-fonts.data";
import { applyStyle, codePointLength } from "../_shared/unicode";

export interface StylePreview {
  readonly id: string;
  readonly name: string;
  readonly blurb: string;
  readonly text: string;
  readonly characters: number;
  readonly mappedCount: number;
  readonly passthrough: readonly string[];
}

export const FANCY_STYLES: readonly UnicodeStyle[] = UNICODE_STYLES;

/** Shown in previews until the input has a letter in it. */
export const PREVIEW_SAMPLE = "Old monk";

export function generateStyle(text: string, styleId: string): StylePreview | null {
  const style = getUnicodeStyle(styleId);
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

export function generateAll(text: string): readonly StylePreview[] {
  return FANCY_STYLES.map((style) => {
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

/** One copyable block with a label per style. */
export function formatAllStyles(previews: readonly StylePreview[]): string {
  return previews.map((preview) => `${preview.name}: ${preview.text}`).join("\n");
}

/** Distinct characters that keep their plain glyph in at least one style. */
export function passthroughCharacters(previews: readonly StylePreview[]): readonly string[] {
  const seen: string[] = [];
  for (const preview of previews) {
    for (const character of preview.passthrough) {
      if (!seen.includes(character)) seen.push(character);
    }
  }
  return seen;
}

/** True when at least one style changes a visible character. */
export function hasStyledCharacters(previews: readonly StylePreview[]): boolean {
  return previews.some((preview) => preview.mappedCount > 0);
}
