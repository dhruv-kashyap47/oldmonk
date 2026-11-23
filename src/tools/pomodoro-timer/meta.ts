import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "pomodoro-timer",
  name: "Pomodoro Timer",
  title: "Pomodoro Timer: 25 minute focus cycles",
  description:
    "Run a 25 minute focus session, take a 5 minute break, and take a longer break after four sessions. Durations are adjustable and the count resets daily.",
  summary: "Work in 25 minute focus blocks with short and long breaks.",
  category: "timer",
  topics: ["pomodoro", "focus", "time management"],
  keywords: [
    "pomodoro timer",
    "25 minute timer",
    "focus timer",
    "study timer",
    "work break timer",
    "pomodoro technique",
  ],
  related: [
    "countdown-timer",
    "timestamp-converter",
    "typing-speed-test",
    "reaction-time-test",
    "memory-test",
  ],
  specs: [
    { label: "Phases", value: "Work, short break, and long break, switchable by hand" },
    { label: "Defaults", value: "25 minutes work, 5 short, 15 long, long break every 4 sessions" },
    { label: "Timing", value: "Deadline based with requestAnimationFrame, correct after a hidden tab" },
    { label: "Storage", value: "Durations, today's session count, and the streak stay in this browser" },
    { label: "Chime", value: "Two tone Web Audio signal at the end of a phase, after a click" },
    { label: "Keyboard", value: "Start, pause, reset, and skip are buttons in tab order" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
