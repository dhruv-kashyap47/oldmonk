import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "regex-tester",
  name: "Regex Tester",
  title: "Regex Tester: matches, groups, replace",
  description:
    "Test a regular expression against your own text, see matches with indices and named groups, and preview a replacement. Long runs stop after 750 ms.",
  summary: "Test a regex, inspect groups and indices, and preview replacements in a worker.",
  category: "developer",
  topics: ["regex", "text"],
  keywords: ["regex tester", "regular expression", "regex match", "capture groups", "regex replace"],
  related: ["diff-checker", "json-formatter", "base64", "url-encoder", "jwt-decoder"],
  specs: [
    { label: "Flags", value: "g, i, m, s, u, y as independent toggles" },
    { label: "Output", value: "Match index, text, capture groups, and named groups" },
    { label: "Replace", value: "Live preview with $1 and $<name> references" },
    { label: "Time limit", value: "750 ms in a Web Worker, then the worker stops" },
    { label: "Match cap", value: "1,000 matches, with a truncation notice" },
    { label: "Privacy", value: "Pattern and text stay in this tab. No network." },
  ],
  layout: "wide",
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
