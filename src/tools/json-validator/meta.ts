import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "json-validator",
  name: "JSON Validator",
  title: "JSON Validator: find the exact syntax error",
  description:
    "Check JSON syntax in your browser and see the exact line and column of the first error, plus any duplicate keys. Nothing you paste leaves the tab.",
  summary: "Validate JSON and find the exact line and column of a syntax error.",
  category: "developer",
  topics: ["json", "validation"],
  keywords: [
    "json validator",
    "validate json",
    "json syntax checker",
    "json error line",
    "check json online",
  ],
  related: ["json-formatter", "json-minifier", "jwt-decoder", "diff-checker"],
  specs: [
    { label: "Input", value: "JSON text up to 5 MB" },
    { label: "Verdict", value: "Valid or invalid, with the document shape" },
    { label: "Errors", value: "Message with a one-based line and column" },
    { label: "Duplicate keys", value: "Listed after a valid parse" },
    { label: "Repair", value: "None. The input is never rewritten" },
    { label: "Network", value: "None. The text stays in this tab" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
