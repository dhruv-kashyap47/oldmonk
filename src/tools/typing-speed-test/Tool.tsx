import {
  For,
  Show,
  createMemo,
  createSignal,
  createTrackedEffect,
  onCleanup,
  onSettled,
} from "solid-js";
import { Button } from "../../components/ui/Button";
import { monoMeta } from "../../components/ui/styles";
import { ErrorState, ResultCard } from "../../components/tool/states";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { readBest, recordScore } from "../_shared/scores";
import { PASSAGES } from "./passages";
import {
  TYPING_MODES,
  accuracyPercent,
  buildTestText,
  characterStates,
  computeTypingResult,
  countCorrect,
  wpm,
  type TypingChange,
  type TypingMode,
  type TypingResult,
} from "./logic";

function LiveStat(props: { label: string; value: string | number }) {
  return (
    <div>
      <p class={monoMeta}>{props.label}</p>
      <p class="mt-1 font-mono text-2xl tabular-nums text-ink">{props.value}</p>
    </div>
  );
}

export default function TypingSpeedTestTool() {
  const [mode, setMode] = createSignal<TypingMode>(30);
  const [passageIndex, setPassageIndex] = createSignal(0);
  const [typed, setTyped] = createSignal("");
  const [elapsedMs, setElapsedMs] = createSignal(0);
  const [running, setRunning] = createSignal(false);
  const [finished, setFinished] = createSignal(false);
  const [result, setResult] = createSignal<TypingResult | null>(null);
  const [notice, setNotice] = createSignal("");
  const [best, setBest] = createSignal<number | null>(null);
  const [statusMessage, setStatusMessage] = createSignal("");

  let inputEl: HTMLTextAreaElement | undefined;
  let passageEl: HTMLDivElement | undefined;
  let frame = 0;
  let startAt: number | null = null;
  let changes: TypingChange[] = [{ at: 0, length: 0 }];

  const text = createMemo(() => buildTestText(PASSAGES, mode() * 20, passageIndex()));
  const states = createMemo(() => characterStates(text(), typed()));
  const correctChars = createMemo(() => countCorrect(states()));
  const errorCount = createMemo(() => Math.max(0, typed().length - correctChars()));
  const accuracy = createMemo(() => accuracyPercent(text(), typed()));
  const liveWpm = createMemo(() => (elapsedMs() >= 1000 ? wpm(correctChars(), elapsedMs()) : 0));
  const secondsLeft = createMemo(() =>
    Math.max(0, Math.ceil((mode() * 1000 - elapsedMs()) / 1000)),
  );

  onSettled(() => {
    setBest(readBest("typing-speed-test"));
  });

  onCleanup(() => {
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
  });

  createTrackedEffect(() => {
    const index = typed().length;
    const container = passageEl;
    if (!container) return;
    const active = container.querySelectorAll("span")[index] as HTMLElement | undefined;
    if (!active) return;
    const top = active.offsetTop;
    const bottom = top + active.offsetHeight;
    if (top < container.scrollTop) {
      container.scrollTop = top;
    } else if (bottom > container.scrollTop + container.clientHeight) {
      container.scrollTop = bottom - container.clientHeight;
    }
  });

  function blockPaste() {
    setNotice("Pasting is turned off in this test. Type the passage instead.");
  }

  function startClock() {
    const now = performance.now();
    startAt = now;
    changes = [{ at: 0, length: 0 }];
    setRunning(true);
    setStatusMessage(`Test started. ${mode()} seconds.`);
    frame = requestAnimationFrame(tick);
  }

  function tick(now: number) {
    if (!running() || startAt === null) return;
    const elapsed = now - startAt;
    setElapsedMs(elapsed);
    if (elapsed >= mode() * 1000) {
      finish(mode() * 1000);
      return;
    }
    frame = requestAnimationFrame(tick);
  }

  function finish(durationMs: number) {
    if (!running()) return;
    cancelAnimationFrame(frame);
    setRunning(false);
    setFinished(true);
    setElapsedMs(durationMs);
    const final = computeTypingResult({
      expected: text(),
      typed: typed(),
      elapsedMs: durationMs,
      changes,
    });
    setResult(final);
    const saved = recordScore("typing-speed-test", Math.round(final.wpm));
    setBest(saved.best);
    setStatusMessage(
      `Test complete. ${Math.round(final.wpm)} words per minute, ${Math.round(final.accuracy)} percent accuracy.`,
    );
  }

  function handleInput(value: string) {
    if (finished()) return;
    setNotice("");
    if (!running() && value.length > typed().length) startClock();
    setTyped(value);
    if (running() && startAt !== null) {
      changes.push({ at: performance.now() - startAt, length: value.length });
      if (value.length >= text().length) {
        finish(performance.now() - startAt);
      }
    }
  }

  function reset() {
    cancelAnimationFrame(frame);
    startAt = null;
    changes = [{ at: 0, length: 0 }];
    setRunning(false);
    setFinished(false);
    setResult(null);
    setTyped("");
    setElapsedMs(0);
    setNotice("");
    setPassageIndex((index) => (index + 1) % PASSAGES.length);
    setStatusMessage("Test reset. The clock starts on the first character.");
    inputEl?.focus();
  }

  function changeMode(next: TypingMode) {
    if (next === mode()) return;
    setMode(next);
    reset();
    setStatusMessage(`${next} second mode selected. The clock starts on the first character.`);
  }

  function startMode(next: TypingMode) {
    setMode(next);
    reset();
    setStatusMessage(`${next} second mode selected. The clock starts on the first character.`);
  }

  function focusInput() {
    inputEl?.focus();
    setStatusMessage("The clock starts on the first character.");
  }

  function beforeInput(event: InputEvent) {
    if (
      event.inputType === "insertFromPaste" ||
      event.inputType === "insertFromDrop" ||
      event.inputType === "insertLineBreak" ||
      event.inputType === "insertParagraph"
    ) {
      event.preventDefault();
      if (event.inputType === "insertFromPaste" || event.inputType === "insertFromDrop") {
        blockPaste();
      }
    }
  }

  function keyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
      event.preventDefault();
      blockPaste();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      return;
    }
    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
    }
  }

  return (
    <>
      <ToolPanel label="Typing speed test">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div role="group" aria-label="Test length">
            <p class="text-xs text-muted">Test length</p>
            <div class="mt-1 flex gap-1">
              <For each={TYPING_MODES}>
                {(seconds) => (
                  <button
                    type="button"
                    aria-pressed={mode() === seconds ? "true" : "false"}
                    disabled={running()}
                    onClick={() => changeMode(seconds)}
                    class={`focus-ring min-h-11 rounded-control border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${mode() === seconds ? "border-accent bg-accent text-paper" : "border-line bg-surface text-muted hover:text-ink"}`}
                  >
                    {seconds} s
                  </button>
                )}
              </For>
            </div>
          </div>
          <p class={monoMeta}>
            Best: {best() === null ? "none yet" : `${Math.round(best() as number)} WPM`}
          </p>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <LiveStat label="Time left" value={`${secondsLeft()} s`} />
          <LiveStat label="Net WPM" value={Math.round(liveWpm())} />
          <LiveStat label="Accuracy" value={`${Math.round(accuracy())}%`} />
          <LiveStat label="Errors" value={errorCount()} />
        </div>

        <div class="relative mt-5 rounded-control focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
          <div
            ref={(element) => {
              passageEl = element;
            }}
            class="relative max-h-64 overflow-y-auto rounded-control border border-line bg-surface-2/60 p-4 text-base leading-8 whitespace-pre-wrap"
          >
            <For each={states()} keyed={false}>
              {(state, index) => {
                const position = index;
                const character = () =>
                  position < text().length ? text().charAt(position) : typed().charAt(position);
                const isActive = () => position === typed().length;
                return (
                  <span
                    class={`${
                      state() === "pending"
                        ? "text-muted"
                        : state() === "correct"
                          ? "text-ink"
                          : state() === "wrong"
                            ? "bg-danger/15 text-danger underline decoration-danger"
                            : "bg-danger/15 text-danger line-through"
                    }${isActive() ? " outline outline-2 -outline-offset-2 outline-accent" : ""}`}
                  >
                    {character() === " " ? "\u00A0" : character()}
                  </span>
                );
              }}
            </For>
          </div>
          <textarea
            ref={(element) => {
              inputEl = element;
            }}
            value={typed()}
            onInput={(event) => handleInput(event.currentTarget.value)}
            onBeforeInput={beforeInput}
            onKeyDown={keyDown}
            onPaste={(event) => {
              event.preventDefault();
              blockPaste();
            }}
            onDrop={(event) => {
              event.preventDefault();
              blockPaste();
            }}
            onClick={(event) => {
              const field = event.currentTarget;
              field.setSelectionRange(field.value.length, field.value.length);
            }}
            onFocus={(event) => {
              const field = event.currentTarget;
              field.setSelectionRange(field.value.length, field.value.length);
            }}
            disabled={finished()}
            rows={4}
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck={false}
            inputmode="text"
            aria-label="Typing input. Type the passage shown here."
            aria-describedby="typing-instructions"
            class={`absolute inset-0 h-full w-full resize-none rounded-control border-0 bg-transparent p-4 text-transparent caret-transparent opacity-0${finished() ? " pointer-events-none" : ""}`}
          />
        </div>

        <p id="typing-instructions" class="mt-2 text-xs leading-relaxed text-muted">
          Tap the passage or press Start typing. The clock starts on the first character, not on
          the button. Backspace is allowed. Paste and drop are blocked.
        </p>

        <Show when={notice()}>
          <div class="mt-3">
            <ErrorState title="Paste blocked">{notice()}</ErrorState>
          </div>
        </Show>

        <ToolActions>
          <Button
            variant="primary"
            onClick={() => (finished() ? reset() : focusInput())}
            disabled={running()}
          >
            {finished() ? "Try again" : "Start typing"}
          </Button>
          <Button variant="quiet" onClick={reset} disabled={typed().length === 0 && !finished()}>
            Restart
          </Button>
          <p class={monoMeta}>Clock starts on the first character</p>
        </ToolActions>

        <p class="sr-only" role="status" aria-live="polite">
          {statusMessage()}
        </p>
      </ToolPanel>

      <Show when={result()}>
        {(current) => (
          <section aria-labelledby="typing-result" class="mt-5">
            <h2 id="typing-result" class="font-serif text-2xl font-semibold text-ink">
              Your result
            </h2>
            <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultCard label="Net WPM" value={`${Math.round(current().wpm)} WPM`}>
                Correct characters divided by five, per minute.
              </ResultCard>
              <ResultCard label="Raw WPM" value={`${Math.round(current().rawWpm)} WPM`}>
                Every typed character counted, including mistakes.
              </ResultCard>
              <ResultCard label="Accuracy" value={`${Math.round(current().accuracy)}%`}>
                {current().correctChars} correct of {current().typedChars} typed.
              </ResultCard>
              <ResultCard label="Consistency" value={`${Math.round(current().consistency)}%`}>
                Steadiness of the per-second speed samples.
              </ResultCard>
            </div>
            <p class="mt-3 text-sm leading-relaxed text-muted">
              The run lasted {Math.round(current().durationMs / 100) / 10} seconds and recorded{" "}
              {current().errors} error {current().errors === 1 ? "character" : "characters"}. Best
              net speed in this browser:{" "}
              {best() === null ? "none yet" : `${Math.round(best() as number)} WPM`}.
            </p>
            <ToolActions>
              <Button variant="primary" onClick={reset}>
                Try again
              </Button>
              <Button variant="quiet" onClick={() => startMode(15)}>
                15 second run
              </Button>
              <Button variant="quiet" onClick={() => startMode(60)}>
                60 second run
              </Button>
            </ToolActions>
          </section>
        )}
      </Show>
    </>
  );
}
