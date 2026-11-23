import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "typing-speed-test",
  name: "Typing Speed Test",
  title: "Typing Speed Test: WPM and accuracy",
  description:
    "Measure your typing speed in 15, 30, or 60 seconds. See words per minute, raw speed, accuracy, and consistency, with every correct and wrong character marked.",
  summary: "Measure typing speed, accuracy, and consistency in a 15, 30, or 60 second run.",
  category: "test",
  topics: ["typing"],
  keywords: [
    "typing speed test",
    "typing test",
    "wpm test",
    "words per minute",
    "typing accuracy",
  ],
  related: ["reaction-time-test", "memory-test", "click-speed-test"],
  specs: [
    { label: "Modes", value: "15, 30, or 60 seconds" },
    { label: "Input", value: "Physical keyboard or on-screen keyboard" },
    { label: "Speed", value: "Words per minute at five characters per word" },
    { label: "Accuracy", value: "Correct characters over characters typed" },
    { label: "Result", value: "WPM, raw WPM, accuracy, and consistency" },
    { label: "Storage", value: "Best WPM stays in this browser" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
