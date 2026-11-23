import { describe, expect, it } from "vitest";
import {
  COUNTDOWN_PRESETS,
  MAX_DURATION_MS,
  MIN_DURATION_MS,
  clampDuration,
  countdownProgress,
  createCountdown,
  finishCountdown,
  parseDuration,
  pauseCountdown,
  remainingAt,
  resetCountdown,
  setCountdownDuration,
  startCountdown,
} from "./logic";
import { formatClock, remainingFraction } from "../_shared/clock";

const MINUTE = 60_000;

describe("parseDuration", () => {
  it.each([
    { input: "5", expected: 5 * MINUTE },
    { input: "25", expected: 25 * MINUTE },
    { input: "00:30", expected: 30_000 },
    { input: "05:00", expected: 5 * MINUTE },
    { input: "5:00", expected: 5 * MINUTE },
    { input: "90:00", expected: 90 * MINUTE },
    { input: "00:00:45", expected: 45_000 },
    { input: "01:00:00", expected: 60 * MINUTE },
    { input: "1:30:00", expected: 90 * MINUTE },
    { input: "02:05:10", expected: 2 * 3_600_000 + 5 * MINUTE + 10_000 },
    { input: " 10:00 ", expected: 10 * MINUTE },
    { input: "24:00:00", expected: MAX_DURATION_MS },
  ])("parses $input", ({ input, expected }) => {
    expect(parseDuration(input)).toBe(expected);
  });

  it.each([
    ["", "empty"],
    ["   ", "blank"],
    ["0", "zero minutes"],
    ["00:00", "zero with minutes and seconds"],
    ["00:00:00", "zero with hours"],
    ["-5", "negative"],
    ["-05:00", "negative with a colon"],
    ["5:60", "sixty seconds"],
    ["00:60:00", "sixty minutes"],
    ["1:2:3:4", "too many segments"],
    ["abc", "not a number"],
    ["1.5", "decimal minutes"],
    ["5m", "unit suffix"],
    ["25:00:00", "more than a day"],
    ["1441", "more than a day in minutes"],
  ])("rejects %j (%s)", (input) => {
    expect(parseDuration(input)).toBeNull();
  });
});

describe("clampDuration", () => {
  it("keeps a runnable length", () => {
    expect(clampDuration(5 * MINUTE)).toBe(5 * MINUTE);
    expect(clampDuration(0)).toBe(MIN_DURATION_MS);
    expect(clampDuration(-10)).toBe(MIN_DURATION_MS);
    expect(clampDuration(Number.NaN)).toBe(MIN_DURATION_MS);
    expect(clampDuration(MAX_DURATION_MS + 1)).toBe(MAX_DURATION_MS);
  });

  it("rounds to whole milliseconds", () => {
    expect(clampDuration(4_999.6)).toBe(5_000);
  });
});

describe("countdown state", () => {
  it("starts idle with the full duration", () => {
    const state = createCountdown(5 * MINUTE);
    expect(state.status).toBe("idle");
    expect(state.remainingMs).toBe(5 * MINUTE);
    expect(state.durationMs).toBe(5 * MINUTE);
    expect(state.startedAt).toBeNull();
    expect(remainingAt(state, 10 * MINUTE)).toBe(5 * MINUTE);
  });

  it("counts down from a target timestamp", () => {
    const state = startCountdown(createCountdown(10 * MINUTE), 1_000);
    expect(state.status).toBe("running");
    expect(remainingAt(state, 1_000)).toBe(10 * MINUTE);
    expect(remainingAt(state, 1_000 + MINUTE)).toBe(9 * MINUTE);
    expect(remainingAt(state, 1_000 + 9 * MINUTE)).toBe(MINUTE);
  });

  it("pauses with the real remaining time, then resumes from it", () => {
    let state = startCountdown(createCountdown(10 * MINUTE), 0);
    state = pauseCountdown(state, 4 * MINUTE);
    expect(state.status).toBe("paused");
    expect(state.startedAt).toBeNull();
    expect(state.remainingMs).toBe(6 * MINUTE);
    expect(remainingAt(state, 60 * MINUTE)).toBe(6 * MINUTE);

    state = startCountdown(state, 100 * MINUTE);
    expect(state.status).toBe("running");
    expect(state.startedAt).toBe(100 * MINUTE);
    expect(remainingAt(state, 102 * MINUTE)).toBe(4 * MINUTE);
  });

  it("never reports negative remaining time", () => {
    const state = startCountdown(createCountdown(MINUTE), 0);
    expect(remainingAt(state, 2 * MINUTE)).toBe(0);
    expect(remainingAt(state, 99 * MINUTE)).toBe(0);
    expect(countdownProgress(state, 99 * MINUTE)).toBe(1);
  });

  it("finishes once and stays at zero", () => {
    let state = startCountdown(createCountdown(MINUTE), 0);
    expect(remainingAt(state, MINUTE)).toBe(0);
    expect(countdownProgress(state, MINUTE)).toBe(1);

    state = finishCountdown(state);
    expect(state.status).toBe("finished");
    expect(state.remainingMs).toBe(0);
    expect(state.startedAt).toBeNull();
    expect(remainingAt(state, 10 * MINUTE)).toBe(0);

    const again = finishCountdown(state);
    expect(again).toEqual(state);
  });

  it("restarts a finished countdown from the full duration", () => {
    const finished = finishCountdown(createCountdown(5 * MINUTE));
    const state = startCountdown(finished, 1_000);
    expect(state.status).toBe("running");
    expect(remainingAt(state, 1_000)).toBe(5 * MINUTE);
  });

  it("resets to idle with the chosen duration", () => {
    let state = startCountdown(createCountdown(5 * MINUTE), 0);
    state = pauseCountdown(state, 2 * MINUTE);
    state = resetCountdown(state);
    expect(state.status).toBe("idle");
    expect(state.durationMs).toBe(5 * MINUTE);
    expect(state.remainingMs).toBe(5 * MINUTE);
    expect(state.startedAt).toBeNull();
  });

  it("changes duration only while not running", () => {
    const running = startCountdown(createCountdown(5 * MINUTE), 0);
    const changed = setCountdownDuration(running, 10 * MINUTE);
    expect(changed.status).toBe("idle");
    expect(changed.durationMs).toBe(10 * MINUTE);
    expect(changed.remainingMs).toBe(10 * MINUTE);
    expect(changed.startedAt).toBeNull();
  });

  it("ignores a second start while running", () => {
    const state = startCountdown(createCountdown(MINUTE), 0);
    expect(startCountdown(state, 5_000)).toBe(state);
  });

  it("computes progress for the ring", () => {
    const state = startCountdown(createCountdown(10 * MINUTE), 0);
    expect(countdownProgress(state, 0)).toBe(0);
    expect(countdownProgress(state, 5 * MINUTE)).toBe(0.5);
    expect(remainingFraction(remainingAt(state, 5 * MINUTE), state.durationMs)).toBe(0.5);
  });
});

describe("presets and display", () => {
  it("offers the 1, 5, 10, and 25 minute presets", () => {
    expect(COUNTDOWN_PRESETS).toEqual([1, 5, 10, 25]);
    for (const minutes of COUNTDOWN_PRESETS) {
      expect(parseDuration(formatClock(minutes * MINUTE))).toBe(minutes * MINUTE);
    }
  });

  it("formats the chosen duration back into the input", () => {
    expect(formatClock(5 * MINUTE)).toBe("05:00");
    expect(formatClock(90 * MINUTE)).toBe("1:30:00");
  });
});
