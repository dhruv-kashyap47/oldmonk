import { For, Show, createSignal } from "solid-js";
import { track } from "../../analytics";
import {
  DICE_COUNT_MAX,
  DICE_MODIFIER_MAX,
  DICE_SIDES,
  formatNotation,
  pushRollHistory,
  rollDice,
  rollNotation,
  validateDiceRequest,
  type DiceRoll,
  type DieSides,
  type RollHistoryEntry,
} from "./logic";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { Button } from "../../components/ui/Button";
import { CopyButton } from "../../components/ui/CopyButton";
import { EmptyState, ErrorState, ResultCard } from "../../components/tool/states";
import { inputBase, monoMeta, primaryButton, secondaryButton } from "../../components/ui/styles";

export default function DiceRollerTool() {
  const [sides, setSides] = createSignal<DieSides>(6);
  const [count, setCount] = createSignal("1");
  const [modifier, setModifier] = createSignal("0");
  const [notation, setNotation] = createSignal("2d6+1");
  const [roll, setRoll] = createSignal<DiceRoll | null>(null);
  const [rollLabel, setRollLabel] = createSignal("");
  const [history, setHistory] = createSignal<RollHistoryEntry[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  let sentFirstInput = false;

  function noteInput() {
    if (!sentFirstInput) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "dice-roller" });
    }
  }

  function applyRoll(result: DiceRoll, label: string) {
    setRoll(result);
    setRollLabel(label);
    setError(null);
    setHistory(pushRollHistory(history(), { notation: label, total: result.total }));
    track("tool_complete", { slug: "dice-roller", dice: result.count });
  }

  function rollSelected() {
    const diceCount = Number(count());
    const modifierValue = modifier().trim() === "" ? 0 : Number(modifier());
    const problem = validateDiceRequest(sides(), diceCount, modifierValue);
    if (problem) {
      setError(problem);
      return;
    }
    applyRoll(rollDice(sides(), diceCount, modifierValue), formatNotation(sides(), diceCount, modifierValue));
  }

  function rollFromNotation() {
    const result = rollNotation(notation());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    applyRoll(result.roll, result.notation);
  }

  function clearResults() {
    setRoll(null);
    setRollLabel("");
    setError(null);
  }

  const resultText = () => {
    const current = roll();
    if (!current) return "";
    return `${rollLabel()}: ${current.total} (${current.rolls.join(", ")})`;
  };

  return (
    <>
      <ToolPanel label="Dice roller">
        <p class="text-sm text-muted">
          Pick a die, set the count and modifier, then roll. Every face comes from the browser's
          crypto source.
        </p>

        <div class="mt-4" role="group" aria-label="Die size">
          <div class="flex flex-wrap gap-2">
            <For each={DICE_SIDES}>
              {(die) => (
                <button
                  type="button"
                  aria-pressed={sides() === die ? "true" : "false"}
                  aria-label={`Select a ${die}-sided die`}
                  title={`d${die}`}
                  onClick={() => {
                    setSides(die);
                    setError(null);
                  }}
                  class={sides() === die ? primaryButton : secondaryButton}
                >
                  d{die}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <label class="block min-w-0">
            <span class="block text-xs text-muted">Number of dice</span>
            <input
              type="number"
              inputmode="numeric"
              min="1"
              max={String(DICE_COUNT_MAX)}
              step="1"
              value={count()}
              onInput={(event) => {
                setCount(event.currentTarget.value);
                setError(null);
                noteInput();
              }}
              class={`${inputBase} mt-1 h-11`}
            />
          </label>
          <label class="block min-w-0">
            <span class="block text-xs text-muted">Modifier</span>
            <input
              type="number"
              inputmode="numeric"
              min={String(-DICE_MODIFIER_MAX)}
              max={String(DICE_MODIFIER_MAX)}
              step="1"
              value={modifier()}
              onInput={(event) => {
                setModifier(event.currentTarget.value);
                setError(null);
                noteInput();
              }}
              class={`${inputBase} mt-1 h-11`}
            />
          </label>
          <Button variant="primary" onClick={rollSelected}>
            Roll {count().trim() === "" ? "" : `${count().trim()}d${sides()}`}
            {modifier().trim() !== "" && Number(modifier()) !== 0
              ? Number(modifier()) > 0
                ? `+${modifier().trim()}`
                : modifier().trim()
              : ""}
          </Button>
        </div>

        <div class="mt-5 rounded-panel border border-line bg-surface-2/60 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              rollFromNotation();
            }}
            class="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <label class="block min-w-0 sm:flex-1">
              <span class="block text-xs text-muted">Dice notation</span>
              <input
                type="text"
                value={notation()}
                onInput={(event) => {
                  setNotation(event.currentTarget.value);
                  setError(null);
                  noteInput();
                }}
                placeholder="2d6+1"
                autocomplete="off"
                spellcheck={false}
                class={`${inputBase} mt-1 h-11 font-mono`}
              />
            </label>
            <Button type="submit" variant="secondary">
              Roll notation
            </Button>
          </form>
          <p class="mt-2 text-xs leading-relaxed text-muted">
            Use a form such as 2d6+1, 1d20, or 3d8-2. The count can be left out for a single die.
          </p>
        </div>

        <ToolActions>
          <CopyButton text={resultText()} label="Copy result" />
          <Button variant="quiet" onClick={clearResults} disabled={!roll() && !error()}>
            Clear result
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              setHistory([]);
              setError(null);
            }}
            disabled={history().length === 0}
          >
            Clear history
          </Button>
        </ToolActions>
      </ToolPanel>

      <div class="mt-5 flex flex-col gap-4">
        <Show when={error()}>
          {(message) => <ErrorState title="Check the roll">{message()}</ErrorState>}
        </Show>

        <Show when={roll()}>
          {(current) => (
            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <div aria-live="polite">
                <ResultCard label="Total" value={current().total.toLocaleString("en")}>
                  {current().count}d{current().sides} with sum {current().sum} and modifier{" "}
                  {current().modifier >= 0 ? `+${current().modifier}` : current().modifier}
                </ResultCard>
              </div>
              <section
                aria-labelledby="dice-values-heading"
                class="min-w-0 rounded-panel border border-line bg-surface p-4"
              >
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="dice-values-heading" class="text-sm font-medium text-ink">
                    Individual dice
                  </h2>
                  <p class={monoMeta}>
                    {current().count} {current().count === 1 ? "die" : "dice"}
                  </p>
                </div>
                <div class="mt-3 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                  <For each={current().rolls} keyed={false}>
                    {(value) => (
                      <span class="inline-flex min-h-9 min-w-9 items-center justify-center rounded-control border border-line bg-surface-2 px-2 font-mono text-sm text-ink">
                        {value()}
                      </span>
                    )}
                  </For>
                </div>
              </section>
            </div>
          )}
        </Show>

        <Show when={!roll() && !error()}>
          <EmptyState title="No roll yet">
            Choose a die and press Roll, or type notation such as 2d6+1.
          </EmptyState>
        </Show>

        <Show when={history().length > 0}>
          <section aria-labelledby="dice-history-heading" class="rounded-panel border border-line bg-surface p-4 sm:p-6">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="dice-history-heading" class="font-serif text-xl font-semibold text-ink">
                History
              </h2>
              <p class={monoMeta}>{history().length} rolls</p>
            </div>
            <ol class="mt-3">
              <For each={history()}>
                {(entry, index) => (
                  <li class="flex min-w-0 items-baseline gap-3 border-t border-line py-1.5 text-sm first:border-t-0">
                    <span class={`${monoMeta} shrink-0`}>{index() + 1}</span>
                    <span class="font-mono text-[13px] text-muted">{entry.notation}</span>
                    <span class="ml-auto font-semibold text-ink">{entry.total}</span>
                  </li>
                )}
              </For>
            </ol>
          </section>
        </Show>
      </div>
    </>
  );
}
