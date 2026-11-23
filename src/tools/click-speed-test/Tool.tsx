import { Show, createMemo, createSignal, createTrackedEffect, onCleanup, onSettled } from "solid-js";
import { Button } from "../../components/ui/Button";
import { monoMeta } from "../../components/ui/styles";
import { EmptyState, ResultCard } from "../../components/tool/states";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { readBest, recordScore } from "../_shared/scores";
import {
  CLICK_WINDOW_MS,
  clicksPerSecond,
  shouldAcceptClick,
  summarizeClicks,
  type ClickResult,
} from "./logic";

type ClickPhase = "idle" | "running" | "result";

function LiveStat(props: { label: string; value: string | number }) {
  return (
    <div>
      <p class={monoMeta}>{props.label}</p>
      <p class="mt-1 font-mono text-2xl tabular-nums text-ink">{props.value}</p>
    </div>
  );
}

export default function ClickSpeedTestTool() {
  const [phase, setPhase] = createSignal<ClickPhase>("idle");
  const [elapsedMs, setElapsedMs] = createSignal(0);
  const [clickCount, setClickCount] = createSignal(0);
  const [result, setResult] = createSignal<ClickResult | null>(null);
  const [best, setBest] = createSignal<number | null>(null);
  const [statusMessage, setStatusMessage] = createSignal("");

  let targetEl: HTMLButtonElement | undefined;
  let frame = 0;
  let startAt = 0;
  let lastAccepted: number | null = null;
  let timestamps: number[] = [];

  const secondsLeft = createMemo(() =>
    Math.max(0, Math.ceil((CLICK_WINDOW_MS - elapsedMs()) / 1000)),
  );
  const liveCps = createMemo(() => {
    const elapsed = elapsedMs();
    return elapsed >= 500 ? clicksPerSecond(clickCount(), elapsed) : 0;
  });

  onSettled(() => {
    setBest(readBest("click-speed-test"));
    window.addEventListener("keydown", onWindowKeyDown);
  });

  onCleanup(() => {
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", onWindowKeyDown);
    }
  });

  createTrackedEffect(() => {
    if (phase() === "running") targetEl?.focus();
  });

  function onWindowKeyDown(event: KeyboardEvent) {
    if (event.key !== " " && event.key !== "Spacebar") return;
    if (event.repeat || phase() !== "running") return;
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
    ) {
      return;
    }
    event.preventDefault();
    registerClick();
  }

  function registerClick() {
    if (phase() !== "running") return;
    const elapsed = performance.now() - startAt;
    if (!shouldAcceptClick(elapsed, lastAccepted)) return;
    lastAccepted = elapsed;
    timestamps.push(elapsed);
    setClickCount(timestamps.length);
  }

  function tick(now: number) {
    if (phase() !== "running") return;
    const elapsed = now - startAt;
    if (elapsed >= CLICK_WINDOW_MS) {
      finish();
      return;
    }
    setElapsedMs(elapsed);
    frame = requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(frame);
    timestamps = [];
    lastAccepted = null;
    startAt = performance.now();
    setClickCount(0);
    setElapsedMs(0);
    setResult(null);
    setPhase("running");
    setStatusMessage("Test started. Ten seconds.");
    frame = requestAnimationFrame(tick);
  }

  function finish() {
    cancelAnimationFrame(frame);
    setPhase("result");
    setElapsedMs(CLICK_WINDOW_MS);
    const final = summarizeClicks(timestamps, CLICK_WINDOW_MS);
    setResult(final);

    if (final.count === 0) {
      setStatusMessage("Test complete. No clicks were recorded.");
      return;
    }

    const saved = recordScore("click-speed-test", Math.round(final.cps * 10) / 10);
    setBest(saved.best);
    setStatusMessage(
      `Test complete. ${final.count} clicks, ${final.cps.toFixed(1)} clicks per second.`,
    );
  }

  return (
    <>
      <ToolPanel label="Click speed test">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm text-ink">Ten seconds, as many clicks as you can make</p>
            <p class="mt-1 text-sm text-muted">
              Press Start, then click or tap the large target. Space works too.
            </p>
          </div>
          <p class={monoMeta}>
            Best: {best() === null ? "none yet" : `${(best() as number).toFixed(1)} CPS`}
          </p>
        </div>

        <div class="mt-5 grid grid-cols-3 gap-4">
          <LiveStat label="Time left" value={`${secondsLeft()} s`} />
          <LiveStat label="Clicks" value={clickCount()} />
          <LiveStat label="CPS" value={liveCps().toFixed(1)} />
        </div>

        <div class="mt-5">
          <Show when={phase() === "idle"}>
            <EmptyState title="One fixed window, one score">
              The timer starts when you press Start and runs for exactly ten seconds. Every click
              on the target counts once. The result lists your click count, clicks per second, the
              gaps between clicks, and how even your pace was.
            </EmptyState>
          </Show>

          <Show when={phase() === "running"}>
            <button
              ref={(element) => {
                targetEl = element;
              }}
              type="button"
              onClick={registerClick}
              class="focus-ring min-h-64 w-full touch-manipulation select-none rounded-panel border border-accent bg-accent/10 p-6 text-center transition-colors duration-150 hover:bg-accent/15 active:bg-accent/20"
              aria-label="Click target. Click or tap as fast as you can"
            >
              <span class="block font-serif text-3xl font-semibold text-ink">Click or tap</span>
              <span class="mt-2 block text-sm text-muted">
                {secondsLeft()} seconds left. Space works too.
              </span>
            </button>
          </Show>

          <Show when={phase() === "result" && result()}>
            {(current) => (
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResultCard label="Clicks" value={current().count}>
                  Recorded inside the ten second window.
                </ResultCard>
                <ResultCard label="CPS" value={current().cps.toFixed(1)}>
                  Clicks divided by ten seconds.
                </ResultCard>
                <ResultCard
                  label="Fastest gap"
                  value={
                    current().fastestIntervalMs === null
                      ? "None"
                      : `${Math.round(current().fastestIntervalMs as number)} ms`
                  }
                >
                  Shortest time between two clicks.
                </ResultCard>
                <ResultCard label="Consistency" value={`${Math.round(current().consistency)}%`}>
                  Steadiness of the gaps between clicks.
                </ResultCard>
              </div>
            )}
          </Show>
        </div>

        <Show when={phase() === "result" && result()}>
          {(current) => (
            <p class="mt-3 text-sm leading-relaxed text-muted">
              <Show
                when={current().count > 0}
                fallback="No clicks were recorded. Start again and click the target at least once."
              >
                Average gap:{" "}
                {current().averageIntervalMs === null
                  ? "none"
                  : `${Math.round(current().averageIntervalMs as number)} ms`}
                . Best CPS in this browser:{" "}
                {best() === null ? "none yet" : `${(best() as number).toFixed(1)}`}.
              </Show>
            </p>
          )}
        </Show>

        <ToolActions>
          <Show when={phase() === "idle"}>
            <Button variant="primary" onClick={start}>
              Start 10 second test
            </Button>
          </Show>
          <Show when={phase() === "running"}>
            <Button variant="quiet" onClick={start}>
              Restart
            </Button>
          </Show>
          <Show when={phase() === "result"}>
            <Button variant="primary" onClick={start}>
              Try again
            </Button>
          </Show>
          <p class={monoMeta}>CPS = clicks divided by ten seconds</p>
        </ToolActions>

        <p class="sr-only" role="status" aria-live="polite">
          {statusMessage()}
        </p>
      </ToolPanel>
    </>
  );
}
