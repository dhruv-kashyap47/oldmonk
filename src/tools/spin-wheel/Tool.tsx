import { For, Show, createMemo, createSignal, onSettled } from "solid-js";
import { track } from "../../analytics";
import { normalizeRotation, parseWheelEntries, spinWheel, type WheelSpin } from "./logic";
import { Wheel } from "./Wheel";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { Button } from "../../components/ui/Button";
import { CopyButton } from "../../components/ui/CopyButton";
import { EmptyState, ResultCard } from "../../components/tool/states";
import { monoMeta } from "../../components/ui/styles";

const SAMPLE = [
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Katherine Johnson",
  "Margaret Hamilton",
  "Linus Torvalds",
  "Barbara Liskov",
  "Edsger Dijkstra",
].join("\n");

const HISTORY_LIMIT = 20;
const SPIN_MS = 3200;
const FULL_TURNS = 5;

function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function SpinWheelTool() {
  const [input, setInput] = createSignal(SAMPLE);
  const [rotation, setRotation] = createSignal(0);
  const [spinning, setSpinning] = createSignal(false);
  const [result, setResult] = createSignal<WheelSpin | null>(null);
  const [history, setHistory] = createSignal<string[]>([]);
  const [notice, setNotice] = createSignal("");
  let frame = 0;
  let fallback = 0;
  let sentFirstInput = false;

  const entries = createMemo(() => parseWheelEntries(input()));

  onSettled(() => () => {
    if (frame !== 0) cancelAnimationFrame(frame);
    if (fallback !== 0) clearTimeout(fallback);
    frame = 0;
    fallback = 0;
  });

  function onEntriesInput(value: string) {
    setInput(value);
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "spin-wheel" });
    }
    if (!spinning()) {
      setResult(null);
      setNotice("");
    }
  }

  function finish(outcome: WheelSpin) {
    if (fallback !== 0) {
      clearTimeout(fallback);
      fallback = 0;
    }
    setResult(outcome);
    setHistory((current) => [outcome.label, ...current].slice(0, HISTORY_LIMIT));
    setSpinning(false);
    track("tool_complete", { slug: "spin-wheel" });
  }

  function spin() {
    if (spinning()) return;
    const outcome = spinWheel(entries());
    if (!outcome) {
      setNotice("Add at least one entry before spinning.");
      return;
    }
    setNotice("");
    setResult(null);

    if (prefersReducedMotion()) {
      setRotation(outcome.rotation);
      finish(outcome);
      return;
    }

    const startRotation = rotation();
    const delta = normalizeRotation(outcome.rotation - normalizeRotation(startRotation));
    const endRotation = startRotation + FULL_TURNS * 360 + delta;
    const startTime = performance.now();
    setSpinning(true);
    if (frame !== 0) cancelAnimationFrame(frame);
    if (fallback !== 0) clearTimeout(fallback);

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / SPIN_MS);
      const eased = 1 - (1 - progress) ** 3;
      setRotation(startRotation + (endRotation - startRotation) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        frame = 0;
        setRotation(normalizeRotation(endRotation));
        finish(outcome);
      }
    };
    frame = requestAnimationFrame(step);
    // A hidden or throttled tab can pause frames indefinitely. Finish on time
    // anyway so the result is ready when the tab is seen again.
    fallback = setTimeout(() => {
      fallback = 0;
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      setRotation(normalizeRotation(endRotation));
      finish(outcome);
    }, SPIN_MS + 250) as unknown as number;
  }

  function reset() {
    if (frame !== 0) cancelAnimationFrame(frame);
    if (fallback !== 0) clearTimeout(fallback);
    frame = 0;
    fallback = 0;
    setSpinning(false);
    setRotation(0);
    setResult(null);
    setHistory([]);
    setNotice("");
  }

  return (
    <>
      <ToolPanel label="Spin wheel">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div class="flex min-w-0 flex-col items-center gap-4">
            <Wheel entries={entries()} rotation={rotation()} />
            <p
              role="status"
              aria-live="polite"
              class="min-h-6 text-center text-sm font-medium text-ink"
            >
              <Show
                when={!spinning()}
                fallback="Spinning..."
              >
                <Show when={result()} fallback="Ready to spin.">
                  {(current) => <>Result: {current().label}</>}
                </Show>
              </Show>
            </p>
            <p class={`${monoMeta} text-center`}>
              {entries().length.toLocaleString("en")} entries
            </p>
          </div>

          <div class="flex min-w-0 flex-col gap-4">
            <ToolTextarea
              name="wheel-entries"
              label="Entries"
              value={input()}
              onInput={onEntriesInput}
              readonly={spinning()}
              placeholder={"Ada\nGrace\nAlan"}
              rows={12}
              hint="One entry per line. Each entry takes an equal sector on the wheel."
            />

            <ResultCard
              label="Last winner"
              value={<span class="break-words">{result()?.label ?? "Not spun yet"}</span>}
            >
              <Show when={history().length > 0} fallback="Spin the wheel to see a result.">
                {history().length === 1
                  ? "1 result in the history."
                  : `${history().length} results in the history.`}
              </Show>
            </ResultCard>

            <Show when={notice().length > 0}>
              <p role="status" class="text-sm leading-relaxed text-accent-warm">
                {notice()}
              </p>
            </Show>
          </div>
        </div>

        <ToolActions>
          <Button
            variant="primary"
            onClick={spin}
            disabled={entries().length === 0 || spinning()}
          >
            {spinning() ? "Spinning" : "Spin the wheel"}
          </Button>
          <Button variant="quiet" onClick={reset} disabled={spinning()}>
            Reset wheel
          </Button>
          <CopyButton text={history().join("\n")} label="Copy results" />
        </ToolActions>
      </ToolPanel>

      <div class="mt-5 grid gap-5 md:grid-cols-2">
        <Show when={entries().length === 0}>
          <EmptyState title="No entries yet">
            Type one entry per line. The wheel redraws as you type, and the list below is the
            text alternative to the drawing.
          </EmptyState>
        </Show>

        <Show when={entries().length > 0}>
          <section aria-labelledby="wheel-entries-heading" class="rounded-panel border border-line bg-surface p-4 sm:p-6">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="wheel-entries-heading" class="font-serif text-xl font-semibold text-ink">
                Entries
              </h2>
              <p class={monoMeta}>equal sectors</p>
            </div>
            <ol class="mt-3 max-h-64 overflow-y-auto">
              <For each={entries()} keyed={false}>
                {(entry, index) => (
                  <li class="flex min-w-0 items-baseline gap-3 border-t border-line py-1.5 text-sm first:border-t-0">
                    <span class={`${monoMeta} shrink-0`}>{index + 1}</span>
                    <span class="min-w-0 break-words text-ink">{entry()}</span>
                  </li>
                )}
              </For>
            </ol>
          </section>
        </Show>

        <Show when={history().length > 0}>
          <section aria-labelledby="wheel-history-heading" class="rounded-panel border border-line bg-surface p-4 sm:p-6">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="wheel-history-heading" class="font-serif text-xl font-semibold text-ink">
                History
              </h2>
              <p class={monoMeta}>
                {history().length} of {HISTORY_LIMIT}
              </p>
            </div>
            <ol class="mt-3">
              <For each={history().slice(0, 10)} keyed={false}>
                {(label, index) => (
                  <li class="flex min-w-0 items-baseline gap-3 border-t border-line py-1.5 text-sm first:border-t-0">
                    <span class={`${monoMeta} shrink-0`}>{index + 1}</span>
                    <span class="min-w-0 break-words text-ink">{label()}</span>
                  </li>
                )}
              </For>
            </ol>
            <Show when={history().length > 10}>
              <p class="mt-2 text-xs text-muted">
                Plus {history().length - 10} earlier{" "}
                {history().length - 10 === 1 ? "result" : "results"}.
              </p>
            </Show>
          </section>
        </Show>
      </div>
    </>
  );
}
