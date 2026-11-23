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
import { Button } from "../../components/ui/Button";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ResultCard } from "../../components/tool/states";
import { buttonBase, inputBase } from "../../components/ui/styles";
import {
  createDeadlineClock,
  formatClock,
  remainingFraction,
  type DeadlineClock,
} from "../_shared/clock";
import {
  COUNTDOWN_PRESETS,
  createCountdown,
  finishCountdown,
  parseDuration,
  pauseCountdown,
  remainingAt,
  resetCountdown,
  setCountdownDuration,
  startCountdown,
  type CountdownState,
} from "./logic";

const MINUTE = 60_000;
const RADIUS = 104;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DEFAULT_DURATION = 5 * MINUTE;

const HINT = "HH:MM:SS, MM:SS, or minutes. From 1 second to 24 hours.";
const INVALID_MESSAGE = "Use 05:00, 1:30:00, or a number of minutes from 1 to 1440.";

export default function CountdownTimerTool() {
  const initial = createCountdown(DEFAULT_DURATION);
  const [state, setState] = createSignal<CountdownState>(initial);
  const [displayMs, setDisplayMs] = createSignal(initial.remainingMs);
  const [draft, setDraft] = createSignal("05:00");
  const [error, setError] = createSignal<string | null>(null);
  const [announcement, setAnnouncement] = createSignal("");

  let clock: DeadlineClock | undefined;
  let titleBefore: string | null = null;
  let titleOurs: string | null = null;

  const busy = createMemo(() => state().status === "running" || state().status === "paused");
  const draftMs = createMemo(() => parseDuration(draft()));
  const clockText = createMemo(() => formatClock(displayMs()));
  const fraction = createMemo(() => remainingFraction(displayMs(), state().durationMs));
  const dashOffset = createMemo(() => CIRCUMFERENCE * (1 - fraction()));
  const actionLabel = createMemo(() => {
    const status = state().status;
    if (status === "running") return "Pause";
    if (status === "paused") return "Resume";
    if (status === "finished") return "Start again";
    return "Start";
  });
  const statusLabel = createMemo(() => {
    const status = state().status;
    if (status === "running") return "Running";
    if (status === "paused") return "Paused";
    if (status === "finished") return "Time is up";
    return "Ready";
  });

  function handleFinish(): void {
    setDisplayMs(0);
    setState((current) => finishCountdown(current));
    playFinishChime();
    setAnnouncement("Time is up. The countdown has finished.");
  }

  onSettled(() => {
    clock = createDeadlineClock({
      onTick: (remaining) => setDisplayMs(remaining),
      onFinish: handleFinish,
    });
  });

  createTrackedEffect(() => {
    const text = clockText();
    const current = state();
    if (typeof document === "undefined") return;
    if (current.status === "running") {
      if (titleBefore === null) titleBefore = document.title;
      titleOurs = `${text} · Countdown`;
      document.title = titleOurs;
    } else if (titleBefore !== null) {
      document.title = titleBefore;
      titleBefore = null;
      titleOurs = null;
    }
  });

  onCleanup(() => {
    clock?.dispose();
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
      const paused = pauseCountdown(current, now);
      setState({ ...paused, remainingMs: left });
      setDisplayMs(left);
      setAnnouncement(`Paused with ${formatClock(left)} left.`);
      return;
    }

    if (current.status === "paused") {
      const left = current.remainingMs;
      const next = startCountdown(current, now);
      setState(next);
      setDisplayMs(left);
      clock?.start(left);
      setAnnouncement(`Resumed with ${formatClock(left)} left.`);
      return;
    }

    const parsed = parseDuration(draft());
    if (parsed === null) {
      setError(INVALID_MESSAGE);
      setAnnouncement("That duration is not valid.");
      return;
    }
    setError(null);
    const next = startCountdown(setCountdownDuration(current, parsed), now);
    setState(next);
    setDisplayMs(parsed);
    clock?.start(parsed);
    setAnnouncement(`Countdown started. ${formatClock(parsed)} on the clock.`);
  }

  function reset(): void {
    clock?.stop();
    const next = resetCountdown(state());
    setState(next);
    setDisplayMs(next.remainingMs);
    setDraft(formatClock(next.durationMs));
    setError(null);
    setAnnouncement(`${formatClock(next.durationMs)} ready to start.`);
  }

  function choosePreset(minutes: number): void {
    if (busy()) return;
    clock?.stop();
    const ms = minutes * MINUTE;
    const next = setCountdownDuration(state(), ms);
    setState(next);
    setDisplayMs(next.remainingMs);
    setDraft(formatClock(ms));
    setError(null);
    setAnnouncement(`${minutes} minute preset selected.`);
  }

  function onDraftInput(value: string): void {
    setDraft(value);
    if (error() !== null) setError(null);
  }

  return (
    <>
      <ToolPanel label="Countdown timer">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <label for="countdown-duration" class="block text-sm font-medium text-ink">
              Duration
            </label>
            <input
              id="countdown-duration"
              type="text"
              autocomplete="off"
              spellcheck={false}
              value={draft()}
              disabled={busy()}
              aria-invalid={error() !== null ? "true" : undefined}
              aria-describedby={error() !== null ? "countdown-hint countdown-error" : "countdown-hint"}
              onInput={(event) => onDraftInput(event.currentTarget.value)}
              class={`${inputBase} mt-1 max-w-40 font-mono tabular-nums disabled:opacity-60`}
            />
            <p id="countdown-hint" class="mt-2 max-w-[28ch] text-xs leading-relaxed text-muted">
              {HINT}
            </p>
            <Show when={error()}>
              {(message) => (
                <p id="countdown-error" role="alert" class="mt-2 max-w-[36ch] text-sm text-danger">
                  {message()}
                </p>
              )}
            </Show>
          </div>
          <div role="group" aria-label="Duration presets" class="flex flex-wrap gap-2">
            <For each={COUNTDOWN_PRESETS}>
              {(minutes) => (
                <button
                  type="button"
                  aria-pressed={draftMs() === minutes * MINUTE ? "true" : "false"}
                  disabled={busy()}
                  onClick={() => choosePreset(minutes)}
                  class={`${buttonBase} disabled:cursor-not-allowed disabled:opacity-50 ${
                    draftMs() === minutes * MINUTE
                      ? "bg-accent text-paper hover:bg-accent-hover"
                      : "border border-line bg-surface text-ink hover:border-accent"
                  }`}
                >
                  {minutes} min
                </button>
              )}
            </For>
          </div>
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
              <p class="text-sm text-muted">{statusLabel()}</p>
            </div>
          </div>
        </div>

        <ToolActions>
          <Button variant="primary" onClick={toggle}>
            {actionLabel()}
          </Button>
          <Button
            variant="secondary"
            onClick={reset}
            disabled={state().status === "idle"}
          >
            Reset
          </Button>
        </ToolActions>

        <p role="status" aria-live="polite" class="sr-only">
          {announcement()}
        </p>

        <Show when={state().status === "finished"}>
          <div class="mt-5 border-t border-line pt-4">
            <p class="font-serif text-xl font-semibold text-ink">Time is up</p>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              Set another duration and start again, or close the tab.
            </p>
          </div>
        </Show>
      </ToolPanel>

      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <ResultCard label="Set for" value={formatClock(state().durationMs)}>
          The full length, restored by reset.
        </ResultCard>
        <ResultCard label="Status" value={statusLabel()}>
          {draftMs() === null ? "Check the duration" : "Target timestamp, no drift"}
        </ResultCard>
      </div>
    </>
  );
}
