import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "random-name-picker",
  name: "Random Name Picker",
  title: "Random Name Picker: draw from a list",
  description:
    "Pick a random name from any list, with optional no-repeat draws so nobody wins twice, a 50-entry history, and even team splitting. Runs in your browser.",
  summary: "Pick a winner from a list, with no-repeat draws and team splits.",
  category: "random",
  topics: ["random", "names"],
  keywords: [
    "random name picker",
    "name draw",
    "pick a winner",
    "random picker",
    "team generator",
  ],
  related: ["spin-wheel", "random-number-generator", "dice-roller", "countdown-timer"],
  specs: [
    { label: "Input", value: "Names on separate lines or separated by commas" },
    { label: "Limit", value: "10,000 names per list" },
    { label: "No repeat", value: "Picked names leave the pool until you reset it" },
    { label: "History", value: "The 50 most recent winners" },
    { label: "Teams", value: "Round-robin deal, sizes differ by at most one" },
    { label: "Randomness", value: "crypto.getRandomValues with rejection sampling" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
