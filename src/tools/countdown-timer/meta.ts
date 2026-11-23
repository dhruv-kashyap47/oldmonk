import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "countdown-timer",
  name: "Countdown Timer",
  title: "Countdown Timer: set a precise timer",
  description:
    "Set a countdown in hours, minutes, and seconds, or pick 1, 5, 10, or 25 minutes. The timer keeps time in a background tab and chimes when it reaches zero.",
  summary: "Set a precise countdown with presets, a ring, and an alarm chime.",
  category: "timer",
  topics: ["countdown", "timer", "time"],
  keywords: [
    "countdown timer",
    "online timer",
    "minute timer",
    "hour timer",
    "kitchen timer",
    "alarm timer",
  ],
  related: ["pomodoro-timer", "timestamp-converter", "typing-speed-test", "memory-test", "dice-roller"],
  specs: [
    { label: "Formats", value: "HH:MM:SS, MM:SS, or a bare number of minutes" },
    { label: "Range", value: "1 second to 24 hours" },
    { label: "Presets", value: "1, 5, 10, and 25 minutes" },
    { label: "Timing", value: "Deadline based, so a background tab still finishes on time" },
    { label: "Finish", value: "One chime, a finished state, and no negative time" },
    { label: "Storage", value: "None. The chosen duration is not saved." },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
