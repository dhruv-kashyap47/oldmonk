import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "spin-wheel",
  name: "Spin Wheel",
  title: "Spin Wheel: pick a random name",
  description:
    "Add names to a wheel, spin it with the browser's crypto source, and stop inside the winning sector. A plain list and result history keep every entry readable.",
  summary: "Spin a wheel and get one of your entries, with a result history.",
  category: "random",
  topics: ["random", "names", "wheel"],
  keywords: [
    "spin wheel",
    "random wheel",
    "wheel of names",
    "name spinner",
    "random picker wheel",
  ],
  related: ["random-name-picker", "random-number-generator", "dice-roller", "countdown-timer"],
  specs: [
    { label: "Input", value: "One entry per line" },
    { label: "Selection", value: "Each entry occupies an equal sector" },
    { label: "Stop", value: "Inside the winning sector, 8 percent clear of its edges" },
    { label: "History", value: "The 20 most recent results" },
    { label: "Animation", value: "Request animation frame, skipped for reduced motion" },
    { label: "Randomness", value: "crypto.getRandomValues with rejection sampling" },
  ],
  layout: "standard",
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
