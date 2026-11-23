/**
 * Bio length handling and style previews for the Instagram page.
 * Framework-free: no Solid, no DOM, no storage.
 */

import { INSTAGRAM_STYLE_IDS, stylesByIds } from "../_shared/unicode-fonts.data";
import { applyStyle, codePointLength } from "../_shared/unicode";

/** The bio field limit used by Instagram. */
export const BIO_LIMIT = 150;

export interface BioCount {
  readonly used: number;
  readonly remaining: number;
  readonly over: boolean;
  readonly limit: number;
}

export interface BioPreview {
  readonly id: string;
  readonly name: string;
  readonly text: string;
  readonly characters: number;
}

export const INSTAGRAM_STYLES = stylesByIds(INSTAGRAM_STYLE_IDS);

export function countBio(text: string, limit: number = BIO_LIMIT): BioCount {
  const used = codePointLength(text);
  return {
    used,
    remaining: Math.max(0, limit - used),
    over: used > limit,
    limit,
  };
}

/** Cuts to the limit by code point so an emoji is never split in half. */
export function trimToBioLimit(text: string, limit: number = BIO_LIMIT): string {
  const characters = Array.from(text);
  return characters.length <= limit ? text : characters.slice(0, limit).join("");
}

export function lineCount(text: string): number {
  if (text.length === 0) return 0;
  return text.split("\n").length;
}

export function generateBioStyle(text: string, styleId: string): BioPreview | null {
  const style = INSTAGRAM_STYLES.find((entry) => entry.id === styleId);
  if (!style) return null;
  const result = applyStyle(text, style);
  return {
    id: style.id,
    name: style.name,
    text: result.text,
    characters: codePointLength(result.text),
  };
}

export function generateBioStyles(text: string): readonly BioPreview[] {
  return INSTAGRAM_STYLES.map((style) => {
    const result = applyStyle(text, style);
    return {
      id: style.id,
      name: style.name,
      text: result.text,
      characters: codePointLength(result.text),
    };
  });
}

/**
 * Practical guidance for the two fields. A bio is a short identity line with a
 * hard limit; a caption can be long and is where a styled line usually fits
 * better.
 */
export function fieldAdvice(count: BioCount): string {
  if (count.over) {
    return `Cut ${count.used - count.limit} characters, or move the line to a caption.`;
  }
  if (count.remaining <= 15) {
    return "Close to the bio limit. A caption has more room.";
  }
  return `${count.remaining} characters left for the bio.`;
}
