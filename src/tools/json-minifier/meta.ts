import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "json-minifier",
  name: "JSON Minifier",
  title: "JSON Minifier: shrink JSON and see savings",
  description:
    "Strip whitespace from JSON and see the byte count before and after, the bytes removed, and the percentage saved. Copy or download the result.",
  summary: "Minify JSON and see honestly measured bytes saved.",
  category: "developer",
  topics: ["json", "minification"],
  keywords: [
    "json minifier",
    "minify json",
    "compress json",
    "json size",
    "remove whitespace json",
  ],
  related: ["json-formatter", "json-validator", "base64", "diff-checker"],
  specs: [
    { label: "Input", value: "JSON text up to 5 MB" },
    { label: "Output", value: "One line with no insignificant whitespace" },
    { label: "Size report", value: "UTF-8 bytes before and after" },
    { label: "Percentage", value: "Rounded to one decimal, with a zero guard" },
    { label: "Transport", value: "gzip or Brotli is separate and not measured" },
    { label: "Network", value: "None. The text stays in this tab" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
