import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "random-number-generator",
  name: "Random Number Generator",
  title: "Random Number Generator: min to max",
  description:
    "Generate random integers or decimals between any two values, with up to 1,000 numbers at once, optional unique values, and a history you can copy from.",
  summary: "Draw integers or decimals in a range, with optional unique values.",
  category: "random",
  topics: ["random", "numbers"],
  keywords: [
    "random number generator",
    "random integer",
    "random decimal",
    "number picker",
    "random numbers in a range",
  ],
  related: ["dice-roller", "random-name-picker", "spin-wheel", "uuid-generator"],
  specs: [
    { label: "Range", value: "Any two finite numbers, minimum up to maximum" },
    { label: "Count", value: "1 to 1,000 values per draw" },
    { label: "Precision", value: "Integers or 1 to 6 decimal places" },
    { label: "Unique mode", value: "Every value distinct, or a clear range error" },
    { label: "History", value: "The 20 most recent batches" },
    { label: "Randomness", value: "crypto.getRandomValues with rejection sampling" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
