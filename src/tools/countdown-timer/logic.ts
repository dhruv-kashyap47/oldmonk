/**
 * Countdown state machine and duration parsing. Framework-free: no Solid
 * import, no DOM, no network, no storage.
 *
 * A running countdown stores the clock reading at which it started, so the
 * remaining time at any later reading is a subtraction, not a running total.
 * That keeps a throttled or hidden tab from drifting.
 */

export type CountdownStatus = "idle" | "running" | "paused" | "finished";

export interface CountdownState {
  readonly status: CountdownStatus;
  /** Chosen length of the countdown, in milliseconds. */
  readonly durationMs: number;
  /** Remaining milliseconds while idle or paused. While running, use `remainingAt`. */
  readonly remainingMs: number;
  /** Clock reading when the run started, or null when not running. */
  readonly startedAt: number | null;
}

export const MIN_DURATION_MS = 1_000;
export const MAX_DURATION_MS = 24 * 60 * 60 * 1_000;
export const COUNTDOWN_PRESETS: readonly number[] = [1, 5, 10, 25];

export function clampDuration(ms: number): number {
  if (!Number.isFinite(ms)) return MIN_DURATION_MS;
  const rounded = Math.round(ms);
  if (rounded < MIN_DURATION_MS) return MIN_DURATION_MS;
  if (rounded > MAX_DURATION_MS) return MAX_DURATION_MS;
  return rounded;
}

/**
 * Accepts `HH:MM:SS`, `MM:SS`, or a bare number of minutes. Returns null for
 * anything else and for a total of zero, since a zero length countdown has
 * nothing to run.
 */
export function parseDuration(input: string): number | null {
  const text = input.trim();
  if (text.length === 0) return null;

  const parts = text.split(":");
  let seconds: number;

  if (parts.length === 1) {
    if (!/^\d{1,4}$/.test(text)) return null;
    seconds = Number(text) * 60;
  } else if (parts.length === 2) {
    const [minutes, secs] = parts;
    if (minutes === undefined || secs === undefined) return null;
    if (!/^\d{1,3}$/.test(minutes) || !/^\d{1,2}$/.test(secs)) return null;
    const secondsPart = Number(secs);
    if (secondsPart > 59) return null;
    seconds = Number(minutes) * 60 + secondsPart;
  } else if (parts.length === 3) {
    const [hours, minutes, secs] = parts;
    if (hours === undefined || minutes === undefined || secs === undefined) return null;
    if (!/^\d{1,2}$/.test(hours) || !/^\d{1,2}$/.test(minutes) || !/^\d{1,2}$/.test(secs)) {
      return null;
    }
    const minutesPart = Number(minutes);
    const secondsPart = Number(secs);
    if (minutesPart > 59 || secondsPart > 59) return null;
    seconds = Number(hours) * 3600 + minutesPart * 60 + secondsPart;
  } else {
    return null;
  }

  const ms = seconds * 1_000;
  if (ms <= 0 || ms > MAX_DURATION_MS) return null;
  return ms;
}

export function createCountdown(durationMs: number): CountdownState {
  const safe = clampDuration(durationMs);
  return { status: "idle", durationMs: safe, remainingMs: safe, startedAt: null };
}

/** Sets a new length and returns the countdown to its idle start. */
export function setCountdownDuration(state: CountdownState, durationMs: number): CountdownState {
  const safe = clampDuration(durationMs);
  return { status: "idle", durationMs: safe, remainingMs: safe, startedAt: null };
}

export function remainingAt(state: CountdownState, now: number): number {
  if (state.status === "finished") return 0;
  if (state.status !== "running" || state.startedAt === null) {
    return Math.max(0, state.remainingMs);
  }
  const left = state.remainingMs - (now - state.startedAt);
  return left > 0 ? left : 0;
}

/** Starts from idle with a full duration, resumes from paused, restarts from finished. */
export function startCountdown(state: CountdownState, now: number): CountdownState {
  if (state.status === "running") return state;
  const remainingMs = state.status === "paused" ? state.remainingMs : state.durationMs;
  if (remainingMs <= 0) return finishCountdown(state);
  return { ...state, status: "running", startedAt: now, remainingMs };
}

export function pauseCountdown(state: CountdownState, now: number): CountdownState {
  if (state.status !== "running") return state;
  return {
    ...state,
    status: "paused",
    startedAt: null,
    remainingMs: remainingAt(state, now),
  };
}

/** Back to the full duration, ready to start again. */
export function resetCountdown(state: CountdownState): CountdownState {
  return {
    status: "idle",
    durationMs: state.durationMs,
    remainingMs: state.durationMs,
    startedAt: null,
  };
}

/** The single finish transition. Remaining is pinned at zero. */
export function finishCountdown(state: CountdownState): CountdownState {
  return {
    status: "finished",
    durationMs: state.durationMs,
    remainingMs: 0,
    startedAt: null,
  };
}

/** Elapsed share of the countdown, 0 at the start and 1 at zero. */
export function countdownProgress(state: CountdownState, now: number): number {
  if (state.durationMs <= 0) return 1;
  const elapsed = 1 - remainingAt(state, now) / state.durationMs;
  if (elapsed < 0) return 0;
  if (elapsed > 1) return 1;
  return elapsed;
}
