import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  completePomodoro,
  createPomodoro,
  durationFor,
  localDateKey,
  normaliseDaily,
  pausePomodoro,
  pomodoroProgress,
  remainingAt,
  resetPomodoro,
  resumePomodoro,
  sanitiseSettings,
  setPomodoroMode,
  setPomodoroSettings,
  skipPomodoro,
  startPomodoro,
  type PomodoroMode,
  type PomodoroState,
} from "./logic";
import { formatClock, remainingFraction } from "../_shared/clock";

const MINUTE = 60_000;

function running(now = 0, state: PomodoroState = createPomodoro()): PomodoroState {
  return startPomodoro(state, now);
}

describe("createPomodoro", () => {
  it("starts idle on a 25 minute work phase with default settings", () => {
    const state = createPomodoro();
    expect(state.mode).toBe("work");
    expect(state.status).toBe("idle");
    expect(state.settings).toEqual(DEFAULT_SETTINGS);
    expect(state.remainingMs).toBe(25 * MINUTE);
    expect(state.durationMs).toBe(25 * MINUTE);
    expect(state.startedAt).toBeNull();
    expect(state.completedToday).toBe(0);
    expect(state.streak).toBe(0);
  });

  it("uses stored settings and counters", () => {
    const state = createPomodoro({
      settings: { workMinutes: 50, shortMinutes: 10, longMinutes: 30, longEvery: 3 },
      completedToday: 2,
      streak: 1,
    });
    expect(state.settings).toEqual({
      workMinutes: 50,
      shortMinutes: 10,
      longMinutes: 30,
      longEvery: 3,
    });
    expect(state.remainingMs).toBe(50 * MINUTE);
    expect(state.completedToday).toBe(2);
    expect(state.streak).toBe(1);
  });
});

describe("sanitiseSettings", () => {
  it("clamps each duration into a runnable range", () => {
    expect(sanitiseSettings({ workMinutes: 0, shortMinutes: 0, longMinutes: 500, longEvery: 1 })).toEqual({
      workMinutes: 1,
      shortMinutes: 1,
      longMinutes: 90,
      longEvery: 2,
    });
  });

  it("falls back to defaults for missing or non finite values", () => {
    expect(
      sanitiseSettings({
        workMinutes: Number.NaN,
        shortMinutes: Number.POSITIVE_INFINITY,
      }),
    ).toEqual({
      workMinutes: DEFAULT_SETTINGS.workMinutes,
      shortMinutes: DEFAULT_SETTINGS.shortMinutes,
      longMinutes: DEFAULT_SETTINGS.longMinutes,
      longEvery: DEFAULT_SETTINGS.longEvery,
    });
  });

  it("rounds fractional minutes", () => {
    expect(sanitiseSettings({ workMinutes: 24.6 }).workMinutes).toBe(25);
  });
});

describe("transitions", () => {
  it("runs, pauses, and resumes without losing time", () => {
    let state = running(1_000);
    expect(state.status).toBe("running");
    expect(remainingAt(state, 1_000)).toBe(25 * MINUTE);

    state = pausePomodoro(state, 1_000 + MINUTE);
    expect(state.status).toBe("paused");
    expect(state.startedAt).toBeNull();
    expect(state.remainingMs).toBe(24 * MINUTE);
    expect(remainingAt(state, 99 * MINUTE)).toBe(24 * MINUTE);

    state = resumePomodoro(state, 5 * MINUTE);
    expect(state.status).toBe("running");
    expect(state.startedAt).toBe(5 * MINUTE);
    expect(remainingAt(state, 5 * MINUTE)).toBe(24 * MINUTE);
    expect(remainingAt(state, 9 * MINUTE)).toBe(20 * MINUTE);
  });

  it("clamps remaining time at zero and reports full elapsed progress", () => {
    const state = running(0);
    expect(remainingAt(state, 26 * MINUTE)).toBe(0);
    expect(pomodoroProgress(state, 26 * MINUTE)).toBe(1);
    expect(remainingFraction(remainingAt(state, 26 * MINUTE), state.durationMs)).toBe(0);
  });

  it("ignores start while running and pause while idle", () => {
    const idle = createPomodoro();
    expect(pausePomodoro(idle, 0)).toBe(idle);
    const state = running(0);
    expect(startPomodoro(state, 5_000)).toBe(state);
  });

  it("does not start a zero length phase", () => {
    const empty: PomodoroState = { ...createPomodoro(), remainingMs: 0, durationMs: 0 };
    const state = startPomodoro(empty, 0);
    expect(state.status).toBe("idle");
  });

  it("resets to a full phase and keeps the counters", () => {
    let state = startPomodoro(createPomodoro({ completedToday: 3, streak: 1 }), 0);
    state = pausePomodoro(state, 10 * MINUTE);
    expect(state.remainingMs).toBe(15 * MINUTE);

    state = resetPomodoro(state);
    expect(state.status).toBe("idle");
    expect(state.mode).toBe("work");
    expect(state.remainingMs).toBe(25 * MINUTE);
    expect(state.durationMs).toBe(25 * MINUTE);
    expect(state.startedAt).toBeNull();
    expect(state.completedToday).toBe(3);
    expect(state.streak).toBe(1);
  });

  it("switches phase by hand and stops the run", () => {
    let state = running(0);
    state = setPomodoroMode(state, "long");
    expect(state.mode).toBe("long");
    expect(state.status).toBe("idle");
    expect(state.remainingMs).toBe(15 * MINUTE);
  });
});

describe("completion", () => {
  it("moves work to a short break and counts the session", () => {
    const done = completePomodoro(createPomodoro());
    expect(done.mode).toBe("short");
    expect(done.status).toBe("idle");
    expect(done.remainingMs).toBe(5 * MINUTE);
    expect(done.completedToday).toBe(1);
    expect(done.streak).toBe(1);
  });

  it("returns a short break to work without changing the streak", () => {
    const work = completePomodoro(completePomodoro(createPomodoro()));
    expect(work.mode).toBe("work");
    expect(work.streak).toBe(1);
    expect(work.completedToday).toBe(1);
    expect(work.remainingMs).toBe(25 * MINUTE);
  });

  it("offers a long break after every fourth work session", () => {
    let state = createPomodoro();
    const breaks: PomodoroMode[] = [];
    for (let session = 0; session < 8; session += 1) {
      expect(state.mode).toBe("work");
      state = completePomodoro(state);
      breaks.push(state.mode);
      state = completePomodoro(state);
      expect(state.mode).toBe("work");
    }
    expect(breaks).toEqual(["short", "short", "short", "long", "short", "short", "short", "long"]);
    expect(state.completedToday).toBe(8);
  });

  it("follows a custom long break cadence", () => {
    let state = createPomodoro({ settings: { longEvery: 3 } });
    const seen: PomodoroMode[] = [];
    for (let session = 0; session < 3; session += 1) {
      state = completePomodoro(state);
      seen.push(state.mode);
      state = completePomodoro(state);
    }
    expect(seen).toEqual(["short", "short", "long"]);
    expect(state.completedToday).toBe(3);
  });

  it("clears the streak when the long break is over", () => {
    let state = createPomodoro({ streak: 3 });
    state = completePomodoro(state);
    expect(state.mode).toBe("long");
    expect(state.streak).toBe(4);
    state = completePomodoro(state);
    expect(state.mode).toBe("work");
    expect(state.streak).toBe(0);
  });
});

describe("skip", () => {
  it("leaves work without credit", () => {
    let state = createPomodoro({ streak: 2, completedToday: 2 });
    state = skipPomodoro(state);
    expect(state.mode).toBe("short");
    expect(state.completedToday).toBe(2);
    expect(state.streak).toBe(2);
  });

  it("skips straight to a long break when the cadence is due", () => {
    const state = skipPomodoro(createPomodoro({ streak: 4 }));
    expect(state.mode).toBe("long");
    expect(state.remainingMs).toBe(15 * MINUTE);
  });

  it("resets the cadence when a long break is skipped", () => {
    let state = setPomodoroMode(createPomodoro({ streak: 4 }), "long");
    state = skipPomodoro(state);
    expect(state.mode).toBe("work");
    expect(state.streak).toBe(0);
  });

  it("keeps the streak after a skipped short break", () => {
    let state = createPomodoro({ streak: 2 });
    state = setPomodoroMode(state, "short");
    state = skipPomodoro(state);
    expect(state.mode).toBe("work");
    expect(state.streak).toBe(2);
  });
});

describe("duration changes", () => {
  it("updates an idle phase immediately", () => {
    const state = setPomodoroSettings(createPomodoro(), { workMinutes: 50 }, 0);
    expect(state.remainingMs).toBe(50 * MINUTE);
    expect(state.durationMs).toBe(50 * MINUTE);
    expect(durationFor("work", state.settings)).toBe(50 * MINUTE);
  });

  it("shortens a paused phase without going negative", () => {
    let state = running(0);
    state = pausePomodoro(state, 15 * MINUTE);
    expect(state.remainingMs).toBe(10 * MINUTE);

    state = setPomodoroSettings(state, { workMinutes: 5 }, 15 * MINUTE);
    expect(state.status).toBe("paused");
    expect(state.durationMs).toBe(5 * MINUTE);
    expect(state.remainingMs).toBe(5 * MINUTE);
  });

  it("re-anchors a running phase at the moment of the change", () => {
    let state = running(0);
    state = setPomodoroSettings(state, { workMinutes: 40 }, MINUTE);
    expect(state.status).toBe("running");
    expect(state.startedAt).toBe(MINUTE);
    expect(state.durationMs).toBe(40 * MINUTE);
    expect(remainingAt(state, MINUTE)).toBe(24 * MINUTE);
    expect(remainingAt(state, 2 * MINUTE)).toBe(23 * MINUTE);
  });

  it("applies the new length to the next phase", () => {
    let state = setPomodoroSettings(createPomodoro(), { shortMinutes: 7 }, 0);
    state = completePomodoro(state);
    expect(state.mode).toBe("short");
    expect(state.remainingMs).toBe(7 * MINUTE);
  });

  it("rejects settings it cannot run", () => {
    const state = setPomodoroSettings(createPomodoro(), { workMinutes: 0, longEvery: 99 }, 0);
    expect(state.settings.workMinutes).toBe(1);
    expect(state.settings.longEvery).toBe(12);
    expect(state.remainingMs).toBe(MINUTE);
  });
});

describe("clock formatting", () => {
  it.each([
    { ms: 0, text: "00:00" },
    { ms: 1, text: "00:01" },
    { ms: 999, text: "00:01" },
    { ms: 1_000, text: "00:01" },
    { ms: 59_000, text: "00:59" },
    { ms: MINUTE, text: "01:00" },
    { ms: 25 * MINUTE, text: "25:00" },
    { ms: 60 * MINUTE, text: "1:00:00" },
    { ms: 90 * MINUTE, text: "1:30:00" },
  ])("formats $ms ms as $text", ({ ms, text }) => {
    expect(formatClock(ms)).toBe(text);
  });

  it("never shows negative time", () => {
    expect(formatClock(-1)).toBe("00:00");
    expect(formatClock(Number.NaN)).toBe("00:00");
  });

  it("computes a remaining fraction for the ring", () => {
    expect(remainingFraction(25 * MINUTE, 25 * MINUTE)).toBe(1);
    expect(remainingFraction(0, 25 * MINUTE)).toBe(0);
    expect(remainingFraction(-1, 25 * MINUTE)).toBe(0);
    expect(remainingFraction(0, 0)).toBe(0);
  });
});

describe("daily count", () => {
  it("formats the local day as an ISO date", () => {
    expect(localDateKey(new Date(2026, 10, 23, 18, 30))).toBe("2026-11-23");
    expect(localDateKey(new Date(2026, 0, 2))).toBe("2026-01-02");
  });

  it("keeps today's count and drops an older day", () => {
    expect(normaliseDaily({ date: "2026-11-23", sessions: 4 }, "2026-11-23")).toEqual({
      date: "2026-11-23",
      sessions: 4,
    });
    expect(normaliseDaily({ date: "2026-11-22", sessions: 4 }, "2026-11-23")).toEqual({
      date: "2026-11-23",
      sessions: 0,
    });
  });

  it("survives malformed stored data", () => {
    expect(normaliseDaily(null, "2026-11-23")).toEqual({ date: "2026-11-23", sessions: 0 });
    expect(normaliseDaily("nope", "2026-11-23")).toEqual({ date: "2026-11-23", sessions: 0 });
    expect(normaliseDaily({ date: "2026-11-23", sessions: "many" }, "2026-11-23")).toEqual({
      date: "2026-11-23",
      sessions: 0,
    });
    expect(normaliseDaily({ date: "2026-11-23", sessions: -3 }, "2026-11-23")).toEqual({
      date: "2026-11-23",
      sessions: 0,
    });
  });
});
