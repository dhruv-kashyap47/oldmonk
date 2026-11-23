import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "memory-test",
  name: "Memory Test",
  title: "Memory Test: 3x3 sequence game",
  description:
    "Repeat a growing sequence of lit tiles on a 3 by 3 grid. Each level adds one step and speeds up playback. See how many levels you can clear in a single run.",
  summary: "Repeat a growing tile sequence and see how many levels you can clear.",
  category: "test",
  topics: ["memory"],
  keywords: [
    "memory test",
    "sequence memory",
    "memory game",
    "3x3 grid",
    "pattern test",
  ],
  related: ["reaction-time-test", "typing-speed-test", "click-speed-test"],
  specs: [
    { label: "Grid", value: "Nine tiles in a three by three square" },
    { label: "Sequence", value: "Starts at one step and grows by one per level" },
    { label: "Playback", value: "460 ms flashes, down to 260 ms at higher levels" },
    { label: "Gap", value: "450 ms between tiles" },
    { label: "Input", value: "Click, tap, or number keys 1 to 9" },
    { label: "Storage", value: "Best levels cleared stay in this browser" },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
