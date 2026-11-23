/**
 * Deadline clock and clock formatting shared by the timer tools.
 *
 * A running timer stores an absolute deadline in one time base. Every frame
 * computes the remaining milliseconds from that deadline instead of subtracting
 * a fixed step, so a slow frame or a background tab cannot accumulate drift.
 * Rendering happens on requestAnimationFrame and visibilitychange forces an
 * immediate recompute when the tab comes back to the front.
 *
 * No framework import. The module is safe to load during server rendering:
 * nothing touches `document` or `requestAnimationFrame` until a clock is built.
 */

/** Two digit, zero padded. */
export function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Clamps to 0 and rounds up, so a clock shows 00:00 only at the deadline. */
export function secondsLeft(ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.ceil(ms / 1000);
}

/**
 * `MM:SS` under an hour, `H:MM:SS` from an hour up. Negative input reads as
 * zero, which keeps a finished timer from showing a minus sign.
 */
export function formatClock(ms: number): string {
  const total = secondsLeft(ms);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/** Share of the duration still to run, 0 to 1. Drives the progress ring. */
export function remainingFraction(remainingMs: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  return clamp01(remainingMs / durationMs);
}

export interface ClockScheduler {
  request(callback: () => void): number;
  cancel(handle: number): void;
}

export interface DeadlineClockOptions {
  /** Called with the clamped remaining milliseconds on each frame and on pause. */
  onTick(remainingMs: number): void;
  /** Called once when the deadline passes. */
  onFinish(): void;
  /** Injectable time source. Defaults to `performance.now`. */
  now?: () => number;
  /** Injectable frame source. Defaults to `requestAnimationFrame`. */
  scheduler?: ClockScheduler;
  /** Injectable document for the visibility listener. Defaults to the global one. */
  doc?: Document | null;
}

export interface DeadlineClock {
  /** Starts or restarts from `remainingMs`, measured from now. */
  start(remainingMs: number): void;
  /** Stops the frame loop and returns the remaining milliseconds. */
  pause(): number;
  /** Stops the frame loop and forgets the deadline. */
  stop(): void;
  /** Stops the frame loop and removes the visibility listener. */
  dispose(): void;
  readonly running: boolean;
  readonly remaining: number;
}

function defaultScheduler(): ClockScheduler {
  if (typeof requestAnimationFrame === "function" && typeof cancelAnimationFrame === "function") {
    return {
      request: (callback) => requestAnimationFrame(() => callback()),
      cancel: (handle) => cancelAnimationFrame(handle),
    };
  }
  // Only reached outside a browser. One timeout per frame, never an interval.
  return {
    request: (callback) => setTimeout(callback, 250) as unknown as number,
    cancel: (handle) => clearTimeout(handle as unknown as ReturnType<typeof setTimeout>),
  };
}

function resolveDocument(doc: Document | null | undefined): Document | null {
  if (doc !== undefined) return doc;
  return typeof document === "undefined" ? null : document;
}

export function createDeadlineClock(options: DeadlineClockOptions): DeadlineClock {
  const now = options.now ?? (() => performance.now());
  const scheduler = options.scheduler ?? defaultScheduler();
  const doc = resolveDocument(options.doc);

  let deadline: number | null = null;
  let frame: number | null = null;
  let running = false;
  let last = 0;

  function cancelFrame(): void {
    if (frame !== null) {
      scheduler.cancel(frame);
      frame = null;
    }
  }

  function schedule(): void {
    if (running && frame === null) {
      frame = scheduler.request(tick);
    }
  }

  function finish(): void {
    cancelFrame();
    running = false;
    deadline = null;
    last = 0;
    options.onTick(0);
    options.onFinish();
  }

  function tick(): void {
    frame = null;
    if (!running || deadline === null) return;
    const left = deadline - now();
    if (left <= 0) {
      finish();
      return;
    }
    last = left;
    options.onTick(left);
    schedule();
  }

  function onVisibilityChange(): void {
    if (running && doc?.visibilityState === "visible") {
      cancelFrame();
      tick();
    }
  }

  doc?.addEventListener("visibilitychange", onVisibilityChange);

  return {
    start(remainingMs: number) {
      cancelFrame();
      const safe = Number.isFinite(remainingMs) ? Math.max(0, remainingMs) : 0;
      last = safe;
      if (safe === 0) {
        finish();
        return;
      }
      running = true;
      deadline = now() + safe;
      options.onTick(safe);
      schedule();
    },
    pause() {
      if (!running) return last;
      cancelFrame();
      const left = deadline === null ? last : Math.max(0, deadline - now());
      running = false;
      deadline = null;
      last = left;
      options.onTick(left);
      return left;
    },
    stop() {
      cancelFrame();
      running = false;
      deadline = null;
    },
    dispose() {
      cancelFrame();
      running = false;
      deadline = null;
      doc?.removeEventListener("visibilitychange", onVisibilityChange);
    },
    get running() {
      return running;
    },
    get remaining() {
      if (!running || deadline === null) return last;
      return Math.max(0, deadline - now());
    },
  };
}
