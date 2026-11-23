import { Show, createSignal, createTrackedEffect, onCleanup, onSettled } from "solid-js";
import { Button } from "../../components/ui/Button";
import { monoMeta } from "../../components/ui/styles";
import { EmptyState, ErrorState, ResultCard } from "../../components/tool/states";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { readBest, recordScore } from "../_shared/scores";
import {
  beginWaiting,
  initialReactionRun,
  markReady,
  markTooSoon,
  randomReactionDelay,
  recordReaction,
  summarizeReaction,
  type ReactionRun,
  type ReactionStats,
} from "./logic";
import { formatMs, formatRoundTimes, outlierNote } from "./results";

export default function ReactionTimeTestTool() {
  const [run, setRun] = createSignal<ReactionRun>(initialReactionRun);
  const [lastMs, setLastMs] = createSignal<number | null>(null);
  const [stats, setStats] = createSignal<ReactionStats | null>(null);
  const [best, setBest] = createSignal<number | null>(null);
  const [statusMessage, setStatusMessage] = createSignal("");

  let arenaEl: HTMLButtonElement | undefined;
  let timer = 0;
  let signalAt = 0;

  onSettled(() => {
    setBest(readBest("reaction-time-test"));
  });

  onCleanup(() => {
    if (typeof window !== "undefined") window.clearTimeout(timer);
  });

  createTrackedEffect(() => {
    const phase = run().phase;
    if (phase === "waiting" || phase === "ready" || phase === "tooSoon") {
      arenaEl?.focus();
    }
  });

  function armSignal() {
    window.clearTimeout(timer);
    const delay = randomReactionDelay();
    timer = window.setTimeout(() => {
      signalAt = performance.now();
      const next = markReady(run());
      setRun(next);
      if (next.phase === "ready") {
        setStatusMessage("Signal. Click now.");
      }
    }, delay);
  }

  function startRun() {
    window.clearTimeout(timer);
    setStats(null);
    setLastMs(null);
    const next = beginWaiting(initialReactionRun);
    setRun(next);
    setStatusMessage("Round 1 of 5. Wait for the signal.");
    armSignal();
  }

  function beginRound() {
    window.clearTimeout(timer);
    setLastMs(null);
    const next = beginWaiting(run());
    setRun(next);
    setStatusMessage(`Round ${next.round} of 5. Wait for the signal.`);
    armSignal();
  }

  function press() {
    const current = run();

    if (current.phase === "waiting") {
      window.clearTimeout(timer);
      setRun(markTooSoon(current));
      setStatusMessage("Too soon. That click came before the signal. This attempt does not count.");
      return;
    }

    if (current.phase === "tooSoon") {
      beginRound();
      return;
    }

    if (current.phase !== "ready") return;

    const time = performance.now() - signalAt;
    const next = recordReaction(current, time);
    if (next === current) return;

    setLastMs(time);
    setRun(next);

    if (next.phase === "summary") {
      const summary = summarizeReaction(next.times);
      setStats(summary);
      if (summary) {
        const saved = recordScore("reaction-time-test", Math.round(summary.mean), false);
        setBest(saved.best);
        setStatusMessage(
          `Complete. Mean ${formatMs(summary.mean)}, median ${formatMs(summary.median)}, best ${formatMs(summary.best)}.`,
        );
      }
    } else {
      setStatusMessage(`Round ${current.round} of 5: ${formatMs(time)}.`);
    }
  }

  function arenaKeyDown(event: KeyboardEvent) {
    if (event.key === " " || event.key === "Spacebar" || event.key === "Enter") {
      event.preventDefault();
      press();
    }
  }

  return (
    <>
      <ToolPanel label="Reaction time test">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm text-ink">Five rounds, one signal each</p>
            <p class="mt-1 text-sm text-muted">
              The signal appears after a random delay between 1.5 and 4.5 seconds.
            </p>
          </div>
          <p class={monoMeta}>
            Best mean:{" "}
            {best() === null ? "none yet" : `${Math.round(best() as number)} ms`}
          </p>
        </div>

        <div class="mt-5">
          <Show when={run().phase === "idle"}>
            <EmptyState title="Ready when you are">
              Press Start test, then wait for the panel to turn green. Click or tap as soon as it
              does. A click before the signal ends the attempt and does not count as a round.
            </EmptyState>
          </Show>

          <Show
            when={
              run().phase === "waiting" ||
              run().phase === "ready" ||
              run().phase === "tooSoon"
            }
          >
            <button
              ref={(element) => {
                arenaEl = element;
              }}
              type="button"
              onClick={press}
              onKeyDown={arenaKeyDown}
              class={`focus-ring min-h-64 w-full touch-manipulation select-none rounded-panel border p-6 text-center transition-colors duration-150 ${
                run().phase === "waiting"
                  ? "border-line bg-surface-2 text-ink"
                  : run().phase === "ready"
                    ? "border-success bg-success/10 text-success"
                    : "border-danger/40 bg-danger/5 text-danger"
              }`}
              aria-label={
                run().phase === "waiting"
                  ? "Wait for the signal, then click"
                  : run().phase === "ready"
                    ? "Signal shown. Click now"
                    : "Too soon. Press to try this round again"
              }
            >
              <Show when={run().phase === "waiting"}>
                <span class="block font-serif text-2xl font-semibold">Wait for the signal</span>
                <span class="mt-2 block text-sm text-muted">
                  The panel turns green. Do not click yet.
                </span>
              </Show>
              <Show when={run().phase === "ready"}>
                <span class="block font-serif text-3xl font-semibold">Click now</span>
                <span class="mt-2 block text-sm">Space or Enter works.</span>
              </Show>
              <Show when={run().phase === "tooSoon"}>
                <span class="block font-serif text-3xl font-semibold">Too soon</span>
                <span class="mt-2 block text-sm">
                  That click came before the signal. Round {run().round} starts again. Press here
                  when you are ready.
                </span>
              </Show>
            </button>
          </Show>

          <Show when={run().phase === "tooSoon"}>
            <div class="mt-3">
              <ErrorState title="That attempt does not count">
                Wait for the green signal before clicking. The round number stays the same.
              </ErrorState>
            </div>
          </Show>

          <Show when={run().phase === "result"}>
            <div class="rounded-panel border border-line bg-surface-2/70 p-6 text-center">
              <p class={monoMeta}>Round {run().round - 1} of 5</p>
              <p class="mt-2 font-mono text-4xl font-semibold tabular-nums text-ink">
                {formatMs(lastMs() ?? 0)}
              </p>
              <p class="mt-2 text-sm text-muted">Take a breath, then start the next round.</p>
              <div class="mt-4 flex justify-center">
                <Button variant="primary" onClick={beginRound}>
                  Next round
                </Button>
              </div>
            </div>
          </Show>
        </div>

        <ToolActions>
          <Button
            variant="primary"
            onClick={startRun}
            disabled={run().phase !== "idle" && run().phase !== "summary"}
          >
            {run().phase === "summary" ? "Try again" : "Start test"}
          </Button>
          <Show when={run().phase !== "idle" && run().phase !== "summary"}>
            <Button variant="quiet" onClick={startRun}>
              Restart test
            </Button>
          </Show>
          <p class={monoMeta}>Early clicks are not recorded</p>
        </ToolActions>

        <p class="sr-only" role="status" aria-live="polite">
          {statusMessage()}
        </p>
      </ToolPanel>

      <Show when={run().phase === "summary" && stats()}>
        {(current) => (
          <section aria-labelledby="reaction-result" class="mt-5">
            <h2 id="reaction-result" class="font-serif text-2xl font-semibold text-ink">
              Your result
            </h2>
            <div class="mt-4 grid gap-3 sm:grid-cols-3">
              <ResultCard label="Mean" value={formatMs(current().mean)}>
                All {current().count} recorded rounds.
              </ResultCard>
              <ResultCard label="Median" value={formatMs(current().median)}>
                The middle value, which one slow round moves less.
              </ResultCard>
              <ResultCard label="Best" value={formatMs(current().best)}>
                Your fastest round.
              </ResultCard>
            </div>
            <p class="mt-3 text-sm leading-relaxed text-muted">
              Rounds: {formatRoundTimes(run().times)}. Best mean in this browser:{" "}
              {best() === null ? "none yet" : `${Math.round(best() as number)} ms`}.
            </p>
            <Show when={outlierNote(current())}>
              {(note) => <p class="mt-2 text-sm leading-relaxed text-muted">{note()}</p>}
            </Show>
            <p class="mt-3 text-sm leading-relaxed text-muted">
              Browser timing has limits. Screen refresh, input hardware, and scheduling are
              included in every number, so small differences between runs are not reliable.
            </p>
            <ToolActions>
              <Button variant="primary" onClick={startRun}>
                Try again
              </Button>
            </ToolActions>
          </section>
        )}
      </Show>
    </>
  );
}
