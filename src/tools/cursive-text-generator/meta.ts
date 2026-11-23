import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "cursive-text-generator",
  name: "Cursive Text Generator",
  title: "Cursive Text Generator for names and bios",
  description:
    "Write a name in cursive Unicode text with script, bold script, italic, and bold italic styles. See uppercase gaps, digit fallback, and copy a signature block.",
  summary:
    "Set a name in four handwriting-like Unicode styles, with a support table for gaps and fallback.",
  category: "text",
  topics: ["unicode", "cursive", "signature"],
  keywords: [
    "cursive text generator",
    "script text",
    "handwriting font copy paste",
    "signature text",
    "unicode cursive",
  ],
  related: ["fancy-text-generator", "instagram-fonts", "symbols", "random-name-picker"],
  specs: [
    { label: "Input", value: "A name or a line of letters" },
    { label: "Styles", value: "Script, bold script, italic, and bold italic" },
    { label: "Uppercase", value: "A to Z, with seven letters from Letterlike Symbols" },
    { label: "Digits", value: "Plain, because these styles have no digit set" },
    { label: "Signature", value: "Styled name line with a plain role line under it" },
    { label: "Network", value: "None. The text stays in this tab." },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
