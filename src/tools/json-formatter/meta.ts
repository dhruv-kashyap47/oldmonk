import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "json-formatter",
  name: "JSON Formatter",
  title: "JSON Formatter: format and inspect JSON",
  description:
    "Paste JSON and pretty-print it with two spaces, four spaces, or tabs. Find syntax errors by line and column, sort keys, and copy the result.",
  summary: "Pretty-print JSON, sort keys, and find the exact line of a syntax error.",
  category: "developer",
  topics: ["json"],
  keywords: ["json formatter", "pretty print json", "json beautifier", "format json", "json sort keys"],
  related: ["json-validator", "json-minifier", "jwt-decoder", "diff-checker"],
  specs: [
    { label: "Input", value: "JSON text up to 5 MB" },
    { label: "Output", value: "Indented JSON with one member per line" },
    { label: "Indentation", value: "Two spaces, four spaces, or a tab" },
    { label: "Key sorting", value: "Recursive for objects, arrays keep their order" },
    { label: "Errors", value: "Message with a one-based line and column" },
    { label: "Network", value: "None. The text stays in this tab." },
  ],
  layout: "wide",
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
