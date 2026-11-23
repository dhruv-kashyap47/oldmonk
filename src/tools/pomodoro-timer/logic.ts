/**
 * Pomodoro state machine. Framework-free: no Solid import, no DOM, no network,
 * no storage. Every transition takes an explicit clock reading, so tests can
 * move time forward without waiting.
 *
 * Time model: a running timer holds the remaining milliseconds measured at the
 * moment it started. `remainingAt` subtracts the elapsed time from the clock
 * reading, so pausing stores real remaining time and resuming starts a fresh
 * countdown from it.
 */

import { pad2 } from "../_shared/clock";

export type PomodoroMode = "work" | "short" | "long";

export type PomodoroStatus = "idle" | "running" | "paused";

export interface PomodoroSettings {
  readonly workMinutes: number;
  readonly shortMinutes: number;
  readonly longMinutes: number;
  /** Work sessions before a long break, counted from 2 to 12. */
  readonly longEvery: number;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  longEvery: 4,
};

export const MODE_LABELS: Record<PomodoroMode, string> = {
  work: "Work",
  short: "Short break",
  long: "Long break",
};

export const MODE_ORDER: readonly PomodoroMode[] = ["work", "short", "long"];

const MINUTE_LIMITS = {
  workMinutes: [1, 120],
  shortMinutes: [1, 60],
  longMinutes: [1, 90],
  longEvery: [2, 12],
} as const;

function clampInteger(value: unknown, minimum: number, maximum: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const rounded = Math.round(value);
  if (rounded < minimum) return minimum;
  if (rounded > maximum) return maximum;
  return rounded;
}

/** Keeps stored or typed settings inside ranges the timer can run. */
export function sanitiseSettings(input: Partial<PomodoroSettings>): PomodoroSettings {
  return {
    workMinutes: clampInteger(
      input.workMinutes,
      MINUTE_LIMITS.workMinutes[0],
      MINUTE_LIMITS.workMinutes[1],
      DEFAULT_SETTINGS.workMinutes,
    ),
    shortMinutes: clampInteger(
      input.shortMinutes,
      MINUTE_LIMITS.shortMinutes[0],
      MINUTE_LIMITS.shortMinutes[1],
      DEFAULT_SETTINGS.shortMinutes,
    ),
    longMinutes: clampInteger(
      input.longMinutes,
      MINUTE_LIMITS.longMinutes[0],
      MINUTE_LIMITS.longMinutes[1],
      DEFAULT_SETTINGS.longMinutes,
    ),
    longEvery: clampInteger(
      input.longEvery,
      MINUTE_LIMITS.longEvery[0],
      MINUTE_LIMITS.longEvery[1],
      DEFAULT_SETTINGS.longEvery,
    ),
  };
}

/** Length of one phase in milliseconds. */
export function durationFor(mode: PomodoroMode, settings: PomodoroSettings): number {
  const minutes =
    mode === "work"
      ? settings.workMinutes
      : mode === "short"
        ? settings.shortMinutes
        : settings.longMinutes;
  return minutes * 60_000;
}

export interface PomodoroState {
  readonly mode: PomodoroMode;
  readonly status: PomodoroStatus;
  readonly settings: PomodoroSettings;
  /** Remaining milliseconds while idle or paused. While running, use `remainingAt`. */
  readonly remainingMs: number;
  /** Clock reading when the current run started, or null when not running. */
  readonly startedAt: number | null;
  /** Full length of the current phase, for the progress ring. */
  readonly durationMs: number;
  /** Work sessions finished today, restored from storage. */
  readonly completedToday: number;
  /** Work sessions since the last long break. */
  readonly streak: number;
}

export interface PomodoroInit {
  readonly settings?: Partial<PomodoroSettings>;
  readonly completedToday?: number;
  readonly streak?: number;
  readonly mode?: PomodoroMode;
}

export function createPomodoro(init: PomodoroInit = {}): PomodoroState {
  const settings = sanitiseSettings(init.settings ?? {});
  const mode = init.mode ?? "work";
  return {
    mode,
    status: "idle",
    settings,
    remainingMs: durationFor(mode, settings),
    startedAt: null,
    durationMs: durationFor(mode, settings),
    completedToday: clampInteger(init.completedToday, 0, 100, 0),
    streak: clampInteger(init.streak, 0, 100, 0),
  };
}

/** Remaining milliseconds at a clock reading, never below zero. */
export function remainingAt(state: PomodoroState, now: number): number {
  if (state.status !== "running" || state.startedAt === null) {
    return Math.max(0, state.remainingMs);
  }
  const left = state.remainingMs - (now - state.startedAt);
  return left > 0 ? left : 0;
}

function withPhase(state: PomodoroState, mode: PomodoroMode): PomodoroState {
  const durationMs = durationFor(mode, state.settings);
  return {
    ...state,
    mode,
    status: "idle",
    remainingMs: durationMs,
    durationMs,
    startedAt: null,
  };
}

/** Idle to running. From paused it resumes with the stored remaining time. */
export function startPomodoro(state: PomodoroState, now: number): PomodoroState {
  if (state.status === "running") return state;
  const remainingMs = state.status === "paused" ? state.remainingMs : state.durationMs;
  if (remainingMs <= 0) return withPhase(state, state.mode);
  return { ...state, status: "running", startedAt: now, remainingMs };
}

export function pausePomodoro(state: PomodoroState, now: number): PomodoroState {
  if (state.status !== "running") return state;
  return {
    ...state,
    status: "paused",
    startedAt: null,
    remainingMs: remainingAt(state, now),
  };
}

export function resumePomodoro(state: PomodoroState, now: number): PomodoroState {
  if (state.status !== "paused") return state;
  return { ...state, status: "running", startedAt: now };
}

/** Back to the start of the current phase, without touching the counters. */
export function resetPomodoro(state: PomodoroState): PomodoroState {
  return withPhase(state, state.mode);
}

/**
 * Moves to the next phase without credit. Skipping work does not count as a
 * finished session, and skipping a long break still restarts the cadence.
 */
export function skipPomodoro(state: PomodoroState): PomodoroState {
  if (state.mode === "work") {
    const next: PomodoroMode = state.streak >= state.settings.longEvery ? "long" : "short";
    return withPhase(state, next);
  }
  const streak = state.mode === "long" ? 0 : state.streak;
  return { ...withPhase(state, "work"), streak };
}

/**
 * Ends the current phase at the deadline. A finished work session counts today
 * and advances the streak; the long break arrives every `longEvery` sessions.
 */
export function completePomodoro(state: PomodoroState): PomodoroState {
  if (state.mode === "work") {
    const completedToday = state.completedToday + 1;
    const streak = state.streak + 1;
    const next: PomodoroMode = streak >= state.settings.longEvery ? "long" : "short";
    return { ...withPhase(state, next), completedToday, streak };
  }
  const streak = state.mode === "long" ? 0 : state.streak;
  return { ...withPhase(state, "work"), streak };
}

/** Switches phase by hand and stops the current run. */
export function setPomodoroMode(state: PomodoroState, mode: PomodoroMode): PomodoroState {
  return withPhase(state, mode);
}

/**
 * Applies new durations. An idle timer shows the new length of its phase; a
 * running timer keeps working toward the new length measured from `now`.
 */
export function setPomodoroSettings(
  state: PomodoroState,
  settings: Partial<PomodoroSettings>,
  now: number,
): PomodoroState {
  const next = sanitiseSettings({ ...state.settings, ...settings });
  const durationMs = durationFor(state.mode, next);
  if (state.status === "idle") {
    return { ...state, settings: next, durationMs, remainingMs: durationMs };
  }
  const left = Math.min(remainingAt(state, now), durationMs);
  return {
    ...state,
    settings: next,
    durationMs,
    remainingMs: left,
    startedAt: state.status === "running" ? now : null,
  };
}

/** Elapsed share of the phase, 0 at the start and 1 at the deadline. */
export function pomodoroProgress(state: PomodoroState, now: number): number {
  if (state.durationMs <= 0) return 1;
  const left = remainingAt(state, now);
  const elapsed = 1 - left / state.durationMs;
  if (elapsed < 0) return 0;
  if (elapsed > 1) return 1;
  return elapsed;
}

/** Local calendar day as `YYYY-MM-DD`, used to reset the daily session count. */
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export interface DailyRecord {
  readonly date: string;
  readonly sessions: number;
}

/** Reads a stored daily record and drops it when it belongs to an earlier day. */
export function normaliseDaily(value: unknown, today: string): DailyRecord {
  if (typeof value !== "object" || value === null) {
    return { date: today, sessions: 0 };
  }
  const record = value as { date?: unknown; sessions?: unknown };
  if (record.date !== today) {
    return { date: today, sessions: 0 };
  }
  return {
    date: today,
    sessions: clampInteger(record.sessions, 0, 100, 0),
  };
}
