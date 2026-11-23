import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "timestamp-converter",
  name: "Timestamp Converter",
  title: "Timestamp Converter: Unix and ISO",
  description:
    "Convert Unix seconds or milliseconds to UTC, local time, and ISO 8601, and read ISO dates as timestamps. Choose a time zone and see the relative time.",
  summary: "Convert Unix timestamps and ISO dates, with local, UTC, and zone views.",
  category: "developer",
  topics: ["unix", "time"],
  keywords: ["timestamp converter", "unix timestamp", "epoch converter", "iso 8601", "unix time"],
  related: ["uuid-generator", "jwt-decoder", "countdown-timer", "diff-checker", "json-formatter"],
  specs: [
    { label: "Input", value: "Unix seconds, Unix milliseconds, or ISO 8601" },
    { label: "Unit detection", value: "Up to 10 digits is seconds, 13 or more is milliseconds" },
    { label: "Output", value: "ISO 8601, UTC, local time, and a selected zone" },
    { label: "Time zones", value: "15 common zones via Intl, plus the device zone" },
    { label: "Relative time", value: "A rounded phrase such as in 2 hours" },
    { label: "Privacy", value: "Conversion happens in this tab. No network." },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
