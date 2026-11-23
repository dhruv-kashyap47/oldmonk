import {
  For,
  Show,
  createMemo,
  createSignal,
  createTrackedEffect,
  onCleanup,
  onSettled,
} from "solid-js";
import { playFinishChime, unlockAudio } from "../../lib/audio";
import { readStoredJson, writeStoredJson } from "../../lib/storage";
import { Button } from "../../components/ui/Button";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ResultCard } from "../../components/tool/states";
import { buttonBase, inputBase, monoMeta } from "../../components/ui/styles";
import {
  createDeadlineClock,
  formatClock,
  remainingFraction,
  type DeadlineClock,
} from "../_shared/clock";
import {
  MODE_LABELS,
  MODE_ORDER,
  completePomodoro,
  createPomodoro,
  localDateKey,
  normaliseDaily,
  pausePomodoro,
  remainingAt,
  resetPomodoro,
  resumePomodoro,
  setPomodoroMode,
  setPomodoroSettings,
  skipPomodoro,
  startPomodoro,
  type PomodoroMode,
  type PomodoroSettings,
  type PomodoroState,
} from "./logic";

const SETTINGS_KEY = "pomodoro:settings";
const TODAY_KEY = "pomodoro:today";

const RADIUS = 104;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface WakeLockSentinelLike {
  release(): Promise<void>;
}

interface WakeLockApi {
  request(type: "screen"): Promise<WakeLockSentinelLike>;
}

export default function PomodoroTimerTool() {
  const initial = createPomodoro();
  const [state, setState] = createSignal<PomodoroState>(initial);
  const [displayMs, setDisplayMs] = createSignal(initial.remainingMs);
  const [announcement, setAnnouncement] = createSignal("");

  let clock: DeadlineClock | undefined;
  let wakeLock: WakeLockSentinelLike | null = null;
  let titleBefore: string | null = null;
  let titleOurs: string | null = null;
  let disposed = false;

  const clockText = createMemo(() => formatClock(displayMs()));
  const modeLabel = createMemo(() => MODE_LABELS[state().mode]);
  const statusLabel = createMemo(() => {
    const status = state().status;
    if (status === "running") return "Running";
    if (status === "paused") return "Paused";
    return "Ready";
  });
  const fraction = createMemo(() => remainingFraction(displayMs(), state().durationMs));
  const dashOffset = createMemo(() => CIRCUMFERENCE * (1 - fraction()));

  function persistCount(value: PomodoroState): void {
    writeStoredJson(TODAY_KEY, {
      date: localDateKey(new Date()),
      sessions: value.completedToday,
      streak: value.streak,
    });
  }

  function releaseWakeLock(): void {
    const current = wakeLock;
    wakeLock = null;
    if (current) {
      try {
        void current.release().catch(() => undefined);
      } catch {
        // A released or unsupported sentinel can throw synchronously.
      }
    }
  }

  function requestWakeLock(): void {
    if (typeof navigator === "undefined") return;
    const api = (navigator as unknown as { wakeLock?: WakeLockApi }).wakeLock;
    if (!api) return;
    try {
      api
        .request("screen")
        .then((sentinel) => {
          if (!disposed && state().status === "running") {
            wakeLock = sentinel;
          } else {
            void sentinel.release().catch(() => undefined);
          }
        })
        .catch(() => undefined);
    } catch {
      // The request can fail outright when the page is not visible.
    }
  }

  function handleFinish(): void {
    const previous = state();
    const next = completePomodoro(previous);
    setState(next);
    setDisplayMs(next.remainingMs);
    releaseWakeLock();
    persistCount(next);
    playFinishChime();
    if (previous.mode === "work") {
      const sessions = next.completedToday === 1 ? "session" : "sessions";
      setAnnouncement(
        `Work session complete. ${next.completedToday} ${sessions} today. Next is a ${MODE_LABELS[
          next.mode
        ].toLowerCase()} of ${formatClock(next.remainingMs)}.`,
      );
    } else {
      setAnnouncement(
        `Break complete. Next is a work session of ${formatClock(next.remainingMs)}.`,
      );
    }
  }

  onSettled(() => {
    clock = createDeadlineClock({
      onTick: (remaining) => setDisplayMs(remaining),
      onFinish: handleFinish,
    });

    const today = localDateKey(new Date());
    const storedSettings = readStoredJson<Partial<PomodoroSettings>>(SETTINGS_KEY, {});
    const storedToday = readStoredJson<{ date?: unknown; sessions?: unknown; streak?: unknown }>(
      TODAY_KEY,
      {},
    );
    const daily = normaliseDaily(storedToday, today);
    const streak =
      storedToday.date === today && typeof storedToday.streak === "number" && Number.isFinite(storedToday.streak)
        ? storedToday.streak
        : 0;

    const restored = createPomodoro({
      settings: storedSettings,
      completedToday: daily.sessions,
      streak,
    });
    setState(restored);
    setDisplayMs(restored.remainingMs);
  });

  createTrackedEffect(() => {
    const text = clockText();
    const current = state();
    if (typeof document === "undefined") return;
    if (current.status === "running") {
      if (titleBefore === null) titleBefore = document.title;
      titleOurs = `${text} · ${MODE_LABELS[current.mode]}`;
      document.title = titleOurs;
    } else if (titleBefore !== null) {
      document.title = titleBefore;
      titleBefore = null;
      titleOurs = null;
    }
  });

  onCleanup(() => {
    disposed = true;
    clock?.dispose();
    releaseWakeLock();
    if (titleBefore !== null && typeof document !== "undefined" && document.title === titleOurs) {
      document.title = titleBefore;
    }
    titleBefore = null;
    titleOurs = null;
  });

  function toggle(): void {
    unlockAudio();
    const now = performance.now();
    const current = state();

    if (current.status === "running") {
      const left = clock?.pause() ?? remainingAt(current, now);
      const paused = pausePomodoro(current, now);
      setState({ ...paused, remainingMs: left });
      setDisplayMs(left);
      releaseWakeLock();
      setAnnouncement(`Paused with ${formatClock(left)} left.`);
      return;
    }

    const next =
      current.status === "paused" ? resumePomodoro(current, now) : startPomodoro(current, now);
    const left = remainingAt(next, now);
    setState(next);
    setDisplayMs(left);
    clock?.start(left);
    requestWakeLock();
    setAnnouncement(
      current.status === "paused"
        ? `Resumed with ${formatClock(left)} left.`
        : `${MODE_LABELS[next.mode]} started. ${formatClock(left)} on the clock.`,
    );
  }

  function reset(): void {
    clock?.stop();
    releaseWakeLock();
    const next = resetPomodoro(state());
    setState(next);
    setDisplayMs(next.remainingMs);
    setAnnouncement(`${MODE_LABELS[next.mode]} reset to ${formatClock(next.remainingMs)}.`);
  }

  function skip(): void {
    clock?.stop();
    releaseWakeLock();
    const next = skipPomodoro(state());
    setState(next);
    setDisplayMs(next.remainingMs);
    setAnnouncement(
      `Skipped to ${MODE_LABELS[next.mode].toLowerCase()}, ${formatClock(next.remainingMs)}.`,
    );
  }

  function selectMode(mode: PomodoroMode): void {
    if (mode === state().mode) return;
    clock?.stop();
    releaseWakeLock();
    const next = setPomodoroMode(state(), mode);
    setState(next);
    setDisplayMs(next.remainingMs);
    setAnnouncement(`${MODE_LABELS[mode]} selected, ${formatClock(next.remainingMs)}.`);
  }

  function applySettings(partial: Partial<PomodoroSettings>): void {
    const now = performance.now();
    const current = state();
    const wasRunning = current.status === "running";
    const next = setPomodoroSettings(current, partial, now);
    const left = remainingAt(next, now);
    setState(next);
    setDisplayMs(left);
    writeStoredJson(SETTINGS_KEY, next.settings);
    if (wasRunning) clock?.start(left);
  }

  function updateSetting(field: keyof PomodoroSettings, input: HTMLInputElement): void {
    const raw = input.value;
    const value = Number(raw);
    if (raw.trim().length === 0 || !Number.isFinite(value)) {
      input.value = String(state().settings[field]);
      return;
    }
    applySettings({ [field]: value } as Partial<PomodoroSettings>);
  }

  return (
    <>
      <ToolPanel label="Pomodoro timer">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div role="group" aria-label="Timer phase" class="flex flex-wrap gap-2">
            <For each={MODE_ORDER}>
              {(mode) => (
                <button
                  type="button"
                  aria-pressed={state().mode === mode ? "true" : "false"}
                  onClick={() => selectMode(mode)}
                  class={`${buttonBase} ${
                    state().mode === mode
                      ? "bg-accent text-paper hover:bg-accent-hover"
                      : "border border-line bg-surface text-ink hover:border-accent"
                  }`}
                >
                  {MODE_LABELS[mode]}
                </button>
              )}
            </For>
          </div>
          <p class={monoMeta}>Session {state().completedToday + 1}</p>
        </div>

        <div class="mt-6 flex justify-center">
          <div class="relative w-full max-w-[20rem]">
            <svg viewBox="0 0 240 240" aria-hidden="true" class="w-full">
              <circle
                cx="120"
                cy="120"
                r={String(RADIUS)}
                fill="none"
                stroke-width="10"
                class="stroke-line"
              />
              <circle
                cx="120"
                cy="120"
                r={String(RADIUS)}
                fill="none"
                stroke-width="10"
                stroke-linecap="round"
                transform="rotate(-90 120 120)"
                stroke-dasharray={CIRCUMFERENCE.toFixed(2)}
                stroke-dashoffset={dashOffset().toFixed(2)}
                class="stroke-accent transition-[stroke-dashoffset] duration-150 ease-out"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <p role="timer" aria-live="off" class="font-mono text-6xl font-medium tabular-nums text-ink">
                {clockText()}
              </p>
              <p class="text-sm text-muted">
                {modeLabel()} · {statusLabel()}
              </p>
            </div>
          </div>
        </div>

        <ToolActions>
          <Button variant="primary" onClick={toggle}>
            {state().status === "running" ? "Pause" : state().status === "paused" ? "Resume" : "Start"}
          </Button>
          <Button variant="secondary" onClick={reset}>
            Reset
          </Button>
          <Button variant="quiet" onClick={skip}>
            Skip phase
          </Button>
        </ToolActions>

        <p role="status" aria-live="polite" class="sr-only">
          {announcement()}
        </p>

        <div class="mt-6 border-t border-line pt-4">
          <p id="pomodoro-durations" class="text-sm font-medium text-ink">
            Durations
          </p>
          <p class="mt-1 text-xs leading-relaxed text-muted">
            Changes apply to this phase when it is idle, and to the next phase when it is not.
          </p>
          <div
            role="group"
            aria-labelledby="pomodoro-durations"
            class="mt-3 flex flex-wrap items-end gap-4"
          >
            <div class="w-28">
              <label for="pomodoro-work" class="block text-xs text-muted">
                Work minutes
              </label>
              <input
                id="pomodoro-work"
                type="number"
                min="1"
                max="120"
                step="1"
                inputmode="numeric"
                value={state().settings.workMinutes}
                onChange={(event) => updateSetting("workMinutes", event.currentTarget)}
                class={`${inputBase} mt-1 font-mono tabular-nums`}
              />
            </div>
            <div class="w-28">
              <label for="pomodoro-short" class="block text-xs text-muted">
                Short break
              </label>
              <input
                id="pomodoro-short"
                type="number"
                min="1"
                max="60"
                step="1"
                inputmode="numeric"
                value={state().settings.shortMinutes}
                onChange={(event) => updateSetting("shortMinutes", event.currentTarget)}
                class={`${inputBase} mt-1 font-mono tabular-nums`}
              />
            </div>
            <div class="w-28">
              <label for="pomodoro-long" class="block text-xs text-muted">
                Long break
              </label>
              <input
                id="pomodoro-long"
                type="number"
                min="1"
                max="90"
                step="1"
                inputmode="numeric"
                value={state().settings.longMinutes}
                onChange={(event) => updateSetting("longMinutes", event.currentTarget)}
                class={`${inputBase} mt-1 font-mono tabular-nums`}
              />
            </div>
            <div class="w-32">
              <label for="pomodoro-every" class="block text-xs text-muted">
                Long break every
              </label>
              <input
                id="pomodoro-every"
                type="number"
                min="2"
                max="12"
                step="1"
                inputmode="numeric"
                value={state().settings.longEvery}
                onChange={(event) => updateSetting("longEvery", event.currentTarget)}
                class={`${inputBase} mt-1 font-mono tabular-nums`}
              />
            </div>
          </div>
        </div>
      </ToolPanel>

      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <ResultCard label="Sessions today" value={String(state().completedToday)}>
          Reset at midnight in your local time.
        </ResultCard>
        <ResultCard
          label="Until long break"
          value={`${Math.max(0, state().settings.longEvery - state().streak)} of ${state().settings.longEvery}`}
        >
          Work sessions left before the longer break.
        </ResultCard>
      </div>

      <Show when={state().status === "paused"}>
        <p class="mt-4 text-sm text-muted">
          Paused with {formatClock(displayMs())} left. Resume to continue from here.
        </p>
      </Show>
    </>
  );
}
