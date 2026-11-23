export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "oldmonk:v1:theme";
const CHOICES: readonly ThemeChoice[] = ["light", "dark", "system"];

export function readThemeChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return CHOICES.includes(saved as ThemeChoice) ? (saved as ThemeChoice) : "system";
  } catch {
    return "system";
  }
}

export function preferredScheme(): ResolvedTheme {
  if (typeof matchMedia !== "function") return "light";
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  return choice === "system" ? preferredScheme() : choice;
}

export function applyTheme(choice: ThemeChoice): ResolvedTheme {
  const resolved = resolveTheme(choice);
  document.documentElement.dataset.theme = resolved;
  return resolved;
}

export function setThemeChoice(choice: ThemeChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage can be unavailable; the theme still applies for this page view.
  }
  applyTheme(choice);
}

export function toggleTheme(): ResolvedTheme {
  const next: ThemeChoice = resolveTheme(readThemeChoice()) === "dark" ? "light" : "dark";
  setThemeChoice(next);
  return next;
}

/** Runs before first paint so the saved theme never flashes the wrong colors. */
export const themeInitScript = `(function(){try{var k="oldmonk:v1:theme",s=localStorage.getItem(k),m=typeof matchMedia==="function"&&matchMedia("(prefers-color-scheme: dark)").matches,d=s==="light"?"light":s==="dark"?"dark":m?"dark":"light";document.documentElement.dataset.theme=d}catch(e){}})()`;
