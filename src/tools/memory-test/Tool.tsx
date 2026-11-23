import { For, Show, createSignal, createTrackedEffect, onCleanup, onSettled } from "solid-js";
import { Button } from "../../components/ui/Button";
import { monoMeta } from "../../components/ui/styles";
import { EmptyState, ResultCard } from "../../components/tool/states";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { readBest, recordScore } from "../_shared/scores";
import {
  GRID_SIZE,
  advanceLevel,
  applyMemoryInput,
  beginInput,
  keyToTile,
  playbackTiming,
  startMemoryRun,
  type MemoryRun,
} from "./logic";

const TILE_KEYS = Array.from({ length: GRID_SIZE }, (_, index) => index);

export default function MemoryTestTool() {
  const [run, setRun] = createSignal<MemoryRun>({
    level: 1,
    cleared: 0,
    sequence: [],
    cursor: 0,
    phase: "idle",
  });
  const [activeTile, setActiveTile] = createSignal<number | null>(null);
  const [best, setBest] = createSignal<number | null>(null);
  const [statusMessage, setStatusMessage] = createSignal("");
  const [reducedMotion, setReducedMotion] = createSignal(false);

  let gridEl: HTMLDivElement | undefined;
  let playbackTimer = 0;
  let feedbackTimer = 0;
  let playbackToken = 0;
  let query: MediaQueryList | null = null;
  let onMotionChange: ((event: MediaQueryListEvent) => void) | null = null;

  onSettled(() => {
    setBest(readBest("memory-test"));
    query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    onMotionChange = (event) => setReducedMotion(event.matches);
    query.addEventListener("change", onMotionChange);
  });

  onCleanup(() => {
    playbackToken += 1;
    if (typeof window !== "undefined") {
      window.clearTimeout(playbackTimer);
      window.clearTimeout(feedbackTimer);
    }
    if (query && onMotionChange) query.removeEventListener("change", onMotionChange);
  });

  createTrackedEffect(() => {
    if (run().phase === "input") gridEl?.focus();
  });

  function clearTimers() {
    window.clearTimeout(playbackTimer);
    window.clearTimeout(feedbackTimer);
  }

  function play(current: MemoryRun) {
    clearTimers();
    const token = (playbackToken += 1);
    const timing = playbackTiming(current.level, reducedMotion());
    const sequence = current.sequence;
    setRun({ ...current, phase: "playback", cursor: 0 });
    setActiveTile(null);
    setStatusMessage(
      `Level ${current.level}. Watch ${sequence.length} ${sequence.length === 1 ? "tile" : "tiles"}.`,
    );

    let index = 0;
    const step = () => {
      if (token !== playbackToken) return;
      if (index >= sequence.length) {
        setActiveTile(null);
        setRun(beginInput(current));
        return;
      }
      const tile = sequence[index] as number;
      index += 1;
      setActiveTile(tile);
      playbackTimer = window.setTimeout(() => {
        if (token !== playbackToken) return;
        setActiveTile(null);
        playbackTimer = window.setTimeout(step, timing.gapMs);
      }, timing.flashMs);
    };
    step();
  }

  function startGame() {
    clearTimers();
    setActiveTile(null);
    const next = startMemoryRun();
    setRun(next);
    play(next);
  }

  function handleTile(tile: number) {
    const current = run();
    if (current.phase !== "input") return;

    const result = applyMemoryInput(current, tile);
    if (result.outcome === "ignored") return;

    setRun(result.run);
    setActiveTile(tile);
    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => setActiveTile(null), 140);

    if (result.outcome === "wrong") {
      const cleared = current.cleared;
      setStatusMessage(
        `Game over. You cleared ${cleared} ${cleared === 1 ? "level" : "levels"}.`,
      );
      const saved = recordScore("memory-test", cleared);
      setBest(saved.best);
      return;
    }

    if (result.outcome === "complete") {
      const completed = result.run;
      setRun({ ...completed, phase: "playback" });
      playbackTimer = window.setTimeout(
        () => {
          const advanced = advanceLevel(completed);
          setRun(advanced);
          play(advanced);
        },
        reducedMotion() ? 300 : 550,
      );
    }
  }

  function gridKeyDown(event: KeyboardEvent) {
    const tile = keyToTile(event.key);
    if (tile === null || run().phase !== "input") return;
    event.preventDefault();
    handleTile(tile);
  }

  const phaseText = () => {
    switch (run().phase) {
      case "playback":
        return "Watch the tiles.";
      case "input":
        return "Your turn. Repeat the sequence.";
      case "over":
        return "Run over.";
      default:
        return "Press Start to see the first sequence.";
    }
  };

  return (
    <>
      <ToolPanel label="Memory test">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-ink">{phaseText()}</p>
            <p class="mt-1 text-sm text-muted">
              A new tile is added at every level. The sequence never repeats a tile twice in a
              row.
            </p>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-1">
            <p class={monoMeta}>Level {run().level}</p>
            <p class={monoMeta}>Cleared {run().cleared}</p>
            <p class={monoMeta}>
              Best {best() === null ? "none yet" : `${best() as number} ${best() === 1 ? "level" : "levels"}`}
            </p>
          </div>
        </div>

        <Show when={run().phase === "idle"}>
          <div class="mt-5">
            <EmptyState title="Three by three, one step at a time">
              Watch the tiles light up, then repeat the sequence by clicking them or pressing
              number keys 1 to 9. One wrong tile ends the run.
            </EmptyState>
          </div>
        </Show>

        <div
          ref={(element) => {
            gridEl = element;
          }}
          tabindex={0}
          role="group"
          aria-label="Sequence grid. Use keys 1 to 9 in reading order."
          onKeyDown={gridKeyDown}
          class="focus-ring mt-5 grid grid-cols-3 gap-2 rounded-panel sm:gap-3"
        >
          <For each={TILE_KEYS}>
            {(tile) => (
              <button
                type="button"
                disabled={run().phase !== "input"}
                onClick={() => handleTile(tile)}
                aria-label={`Tile ${tile + 1}, row ${Math.floor(tile / 3) + 1}, column ${(tile % 3) + 1}`}
                class={`focus-ring flex aspect-square min-h-16 items-center justify-center rounded-control border transition-colors duration-150 disabled:cursor-default ${
                  activeTile() === tile
                    ? "border-accent bg-accent text-paper"
                    : "border-line bg-surface-2 text-muted hover:border-accent"
                }`}
              >
                <span class="font-mono text-sm tabular-nums">{tile + 1}</span>
              </button>
            )}
          </For>
        </div>

        <p class="mt-3 text-xs leading-relaxed text-muted">
          Keys 1 to 9 follow reading order. Playback speeds up as the sequence grows. Reduced
          motion shortens the flashes and the gaps between them.
        </p>

        <ToolActions>
          <Show when={run().phase === "idle"}>
            <Button variant="primary" onClick={startGame}>
              Start
            </Button>
          </Show>
          <Show when={run().phase === "playback" || run().phase === "input"}>
            <Button variant="quiet" onClick={startGame}>
              Restart
            </Button>
          </Show>
          <p class={monoMeta}>One wrong tile ends the run</p>
        </ToolActions>

        <p class="sr-only" role="status" aria-live="polite">
          {statusMessage()}
        </p>
      </ToolPanel>

      <Show when={run().phase === "over"}>
        <section aria-labelledby="memory-result" class="mt-5">
          <h2 id="memory-result" class="font-serif text-2xl font-semibold text-ink">
            Your result
          </h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-3">
            <ResultCard label="Level reached" value={run().level}>
              The level where the run ended.
            </ResultCard>
            <ResultCard label="Levels cleared" value={run().cleared}>
              Complete sequences in this run.
            </ResultCard>
            <ResultCard label="Best" value={best() === null ? "None yet" : `${best()} ${best() === 1 ? "level" : "levels"}`}>
              Stored in this browser.
            </ResultCard>
          </div>
          <p class="mt-3 text-sm leading-relaxed text-muted">
            The sequence reached {run().sequence.length} {run().sequence.length === 1 ? "tile" : "tiles"}.
            One wrong tile ends the run, so the best score changes only when a new run clears more
            levels.
          </p>
          <ToolActions>
            <Button variant="primary" onClick={startGame}>
              Play again
            </Button>
          </ToolActions>
        </section>
      </Show>
    </>
  );
}
