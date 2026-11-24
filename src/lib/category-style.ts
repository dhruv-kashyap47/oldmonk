import type { ToolCategory } from "../tools/types";

const colors: Record<ToolCategory, string> = {
  developer: "var(--color-cat-dev)",
  text: "var(--color-cat-text)",
  random: "var(--color-cat-random)",
  timer: "var(--color-cat-timer)",
  test: "var(--color-cat-test)",
};

/** Full-strength category color as a CSS value, for rules and chips. */
export function categoryColor(category: ToolCategory): string {
  return colors[category];
}

/** Category color mixed toward ink, so small text clears WCAG AA on the tint. */
export function categoryInk(category: ToolCategory): string {
  return `var(--cat-${category === "developer" ? "dev" : category}-ink)`;
}
