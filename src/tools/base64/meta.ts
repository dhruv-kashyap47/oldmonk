import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "base64",
  name: "Base64 Encoder and Decoder",
  title: "Base64 Encoder and Decoder",
  description:
    "Encode text or a local file to Base64, or decode Base64 back to UTF-8 text. URL-safe mode removes padding and swaps the two special characters.",
  summary: "Encode and decode Base64 text or files, with a URL-safe option.",
  category: "developer",
  topics: ["base64", "encoding"],
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "base64 to text",
    "url safe base64",
    "encode file base64",
  ],
  related: ["url-encoder", "jwt-decoder", "json-formatter", "json-minifier"],
  specs: [
    { label: "Input", value: "UTF-8 text or a local file up to 10 MB" },
    { label: "Output", value: "Base64 text, or decoded UTF-8 text" },
    { label: "URL-safe", value: "Uses - and _ and drops the padding" },
    { label: "Decoding", value: "Accepts both variants with or without padding" },
    { label: "Errors", value: "Invalid characters, bad padding, non-UTF-8 bytes" },
    { label: "Network", value: "None. Files are read in this tab" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
