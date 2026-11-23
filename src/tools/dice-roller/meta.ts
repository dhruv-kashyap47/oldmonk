import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "dice-roller",
  name: "Dice Roller",
  title: "Dice Roller: d4 to d100 with modifiers",
  description:
    "Roll d4, d6, d8, d10, d12, d20, or d100 dice with a modifier, or type notation such as 2d6+1. See every die, the total, and a short history.",
  summary: "Roll standard dice with a modifier, or use notation like 2d6+1.",
  category: "random",
  topics: ["random", "dice"],
  keywords: [
    "dice roller",
    "roll d20",
    "dice notation",
    "2d6+1",
    "random dice",
  ],
  related: ["random-number-generator", "spin-wheel", "random-name-picker", "countdown-timer"],
  specs: [
    { label: "Dice", value: "d4, d6, d8, d10, d12, d20, and d100" },
    { label: "Count", value: "1 to 100 dice per roll" },
    { label: "Modifier", value: "A whole number from -100 to 100" },
    { label: "Notation", value: "2d6+1, 1d20, 3d8-2, or a bare d20" },
    { label: "History", value: "The 20 most recent rolls" },
    { label: "Randomness", value: "crypto.getRandomValues with rejection sampling" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
