import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "reaction-time-test",
  name: "Reaction Time Test",
  title: "Reaction Time Test: five rounds in ms",
  description:
    "Measure how quickly you respond to a visual signal over five rounds. See your mean, median, and best reaction time in milliseconds. Early clicks are ignored.",
  summary: "Measure visual reaction time across five rounds with a randomized delay.",
  category: "test",
  topics: ["reaction"],
  keywords: [
    "reaction time test",
    "reaction speed",
    "reflex test",
    "response time",
    "milliseconds",
  ],
  related: ["typing-speed-test", "memory-test", "click-speed-test"],
  specs: [
    { label: "Rounds", value: "Five recorded reactions" },
    { label: "Signal delay", value: "Randomized from 1.5 to 4.5 seconds" },
    { label: "Input", value: "Mouse click, touch, Space, or Enter" },
    { label: "Result", value: "Mean, median, and best in milliseconds" },
    { label: "Early click", value: "Shown as too soon and not recorded" },
    { label: "Storage", value: "Best mean stays in this browser" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
