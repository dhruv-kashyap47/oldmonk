import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "uuid-generator",
  name: "UUID Generator",
  title: "UUID Generator: random v4 and v7",
  description:
    "Generate 1 to 1,000 random UUIDs in version 4 or version 7, switch uppercase and hyphens, then copy or download the list as a text file.",
  summary: "Generate random v4 or v7 UUIDs, formatted to your taste, up to 1,000 at a time.",
  category: "developer",
  topics: ["uuid", "random"],
  keywords: ["uuid generator", "guid generator", "uuid v4", "uuid v7", "random uuid"],
  related: ["random-number-generator", "timestamp-converter", "base64", "jwt-decoder"],
  specs: [
    { label: "Versions", value: "Version 4 random and version 7 time ordered" },
    { label: "Count", value: "1 to 1,000 per run" },
    { label: "Formatting", value: "Uppercase and hyphens as separate toggles" },
    { label: "Randomness", value: "crypto.getRandomValues, never Math.random" },
    { label: "Output", value: "One UUID per line, ready to copy or download" },
    { label: "Privacy", value: "Generated locally. No network request." },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
