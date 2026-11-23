import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "instagram-fonts",
  name: "Instagram Fonts",
  title: "Instagram Fonts: 150 character bio styles",
  description:
    "Write a bio up to 150 characters, choose from nine Unicode font styles that keep line breaks, and copy the styled text. Not affiliated with Instagram.",
  summary:
    "Style a 150 character bio in nine Unicode fonts, with line breaks kept and a live character counter.",
  category: "text",
  topics: ["instagram", "unicode", "bio"],
  keywords: [
    "instagram fonts",
    "instagram bio fonts",
    "bio text generator",
    "caption fonts",
    "unicode bio",
  ],
  related: ["fancy-text-generator", "cursive-text-generator", "symbols", "random-name-picker"],
  specs: [
    { label: "Limit", value: "150 characters in the plain input" },
    { label: "Counter", value: "Live count with an over limit warning" },
    { label: "Styles", value: "Nine Unicode alphabets chosen for bios" },
    { label: "Line breaks", value: "Kept exactly as typed in every style" },
    { label: "Output", value: "Plain text ready to paste into a bio field" },
    { label: "Network", value: "None. The text stays in this tab." },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
