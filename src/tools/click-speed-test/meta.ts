import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "click-speed-test",
  name: "Click Speed Test",
  title: "Click Speed Test: clicks per second",
  description:
    "Click or tap a large target for 10 seconds. See your click count, clicks per second, the gaps between clicks, and how steady your pace was.",
  summary: "Count clicks and measure clicks per second over a fixed 10 second window.",
  category: "test",
  topics: ["clicking"],
  keywords: [
    "click speed test",
    "clicks per second",
    "cps test",
    "click counter",
    "clicking speed",
  ],
  related: ["typing-speed-test", "reaction-time-test", "memory-test"],
  specs: [
    { label: "Window", value: "10 seconds, fixed" },
    { label: "Input", value: "Mouse, touch, or Space" },
    { label: "Result", value: "Clicks, CPS, gaps, and consistency" },
    { label: "Duplicate guard", value: "Two events inside 40 ms count once" },
    { label: "Zero clicks", value: "Reported as 0 CPS, no recorded best" },
    { label: "Storage", value: "Best CPS stays in this browser" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
