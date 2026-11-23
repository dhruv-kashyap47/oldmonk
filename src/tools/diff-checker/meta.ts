import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "diff-checker",
  name: "Diff Checker",
  title: "Diff Checker: compare two texts",
  description:
    "Compare two texts line by line with a Myers diff, see added and removed lines side by side or unified, and spot word changes inside a replaced line.",
  summary: "Compare two texts line by line and see added, removed, and changed words.",
  category: "developer",
  topics: ["diff", "text"],
  keywords: ["diff checker", "text compare", "compare two texts", "line diff", "unified diff"],
  related: ["json-formatter", "json-validator", "regex-tester", "timestamp-converter", "uuid-generator"],
  specs: [
    { label: "Input", value: "Two texts, up to 2,000 lines and 200 KB per side" },
    { label: "Algorithm", value: "Myers line diff with inline word changes" },
    { label: "Views", value: "Side by side and unified with three lines of context" },
    { label: "Options", value: "Ignore whitespace and ignore case while comparing" },
    { label: "Output", value: "Added and removed line counts, plus a copyable unified diff" },
    { label: "Privacy", value: "Comparison happens in this tab. No network." },
  ],
  layout: "wide",
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
