import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "fancy-text-generator",
  name: "Fancy Text Generator",
  title: "Fancy Text Generator: 15 Unicode styles",
  description:
    "Type a word and preview it as Unicode bold, italic, script, fraktur, circled, fullwidth, monospace, or upside down text. Copy one style or all of them.",
  summary:
    "Preview fifteen Unicode text styles from one line, then copy a single style or the whole set.",
  category: "text",
  topics: ["unicode", "text styling", "social media"],
  keywords: [
    "fancy text generator",
    "unicode text",
    "bold text generator",
    "script text",
    "copy paste fonts",
  ],
  related: ["cursive-text-generator", "instagram-fonts", "symbols", "random-name-picker"],
  specs: [
    { label: "Input", value: "Any text with letters, numbers, or symbols" },
    { label: "Styles", value: "Fifteen Unicode alphabets and decorations" },
    { label: "Output", value: "Unicode characters that replace the original letters" },
    { label: "Digits", value: "Styled where a digit set exists, unchanged elsewhere" },
    { label: "Fallback", value: "Unmapped characters, spaces, and emoji stay as typed" },
    { label: "Network", value: "None. The text stays in this tab." },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
