import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "url-encoder",
  name: "URL Encoder and Decoder",
  title: "URL Encoder and Decoder",
  description:
    "Percent-encode a component or a whole URL, decode escapes, and edit query parameters in a table. Malformed percent sequences are reported clearly.",
  summary: "Encode, decode, and edit URL components and query parameters.",
  category: "developer",
  topics: ["url", "encoding"],
  keywords: [
    "url encoder",
    "url decoder",
    "percent encoding",
    "encodeuri",
    "query string editor",
  ],
  related: ["base64", "json-formatter", "jwt-decoder", "diff-checker"],
  specs: [
    { label: "Input", value: "Text, a URL, or a query string" },
    { label: "Modes", value: "encodeURIComponent or encodeURI for whole URLs" },
    { label: "Output", value: "Encoded or decoded text with copy" },
    { label: "Query table", value: "Add, edit, and remove key and value pairs" },
    { label: "Spaces", value: "%20 on output, plus read as space in queries" },
    { label: "Network", value: "None. The text stays in this tab" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
