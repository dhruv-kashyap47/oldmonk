import { For, Show, createSignal } from "solid-js";
import { track } from "../../analytics";
import {
  DECIMAL_PLACES_MAX,
  NUMBER_COUNT_MAX,
  generateNumbers,
  pushNumberHistory,
  type NumberHistoryEntry,
} from "./logic";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { Button } from "../../components/ui/Button";
import { CopyButton } from "../../components/ui/CopyButton";
import { EmptyState, ErrorState, ResultCard } from "../../components/tool/states";
import { inputBase, monoMeta } from "../../components/ui/styles";

const DEFAULTS = {
  min: "1",
  max: "100",
  count: "5",
  decimals: 0,
  unique: false,
};

export default function RandomNumberGeneratorTool() {
  const [min, setMin] = createSignal(DEFAULTS.min);
  const [max, setMax] = createSignal(DEFAULTS.max);
  const [count, setCount] = createSignal(DEFAULTS.count);
  const [decimals, setDecimals] = createSignal(DEFAULTS.decimals);
  const [unique, setUnique] = createSignal(DEFAULTS.unique);
  const [values, setValues] = createSignal<string[]>([]);
  const [rangeLabel, setRangeLabel] = createSignal("");
  const [history, setHistory] = createSignal<NumberHistoryEntry[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  let sentFirstInput = false;

  function noteInput() {
    if (!sentFirstInput) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "random-number-generator" });
    }
  }

  function onFieldInput(setter: (value: string) => void, value: string) {
    setter(value);
    setError(null);
    noteInput();
  }

  function generate() {
    if (min().trim() === "" || max().trim() === "") {
      setError("Enter a minimum and a maximum.");
      return;
    }
    if (count().trim() === "") {
      setError("Enter how many numbers to draw.");
      return;
    }

    const result = generateNumbers({
      min: Number(min()),
      max: Number(max()),
      count: Number(count()),
      decimals: decimals(),
      unique: unique(),
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    setValues([...result.values]);
    setRangeLabel(`${min().trim()} and ${max().trim()}`);
    setHistory(
      pushNumberHistory(history(), {
        values: [...result.values],
        range: `${min().trim()} to ${max().trim()}`,
      }),
    );
    track("tool_complete", { slug: "random-number-generator", unique: unique() });
  }

  function resetResults() {
    setValues([]);
    setRangeLabel("");
    setError(null);
  }

  function resetDefaults() {
    setMin(DEFAULTS.min);
    setMax(DEFAULTS.max);
    setCount(DEFAULTS.count);
    setDecimals(DEFAULTS.decimals);
    setUnique(DEFAULTS.unique);
    setValues([]);
    setRangeLabel("");
    setError(null);
  }

  const output = () => values().join("\n");

  return (
    <>
      <ToolPanel label="Random number generator">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <p class="text-sm text-muted">
            Integers or decimals, with an optional unique draw.
          </p>
          <p class={monoMeta}>crypto source</p>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label class="block min-w-0">
            <span class="block text-xs text-muted">Minimum</span>
            <input
              type="number"
              inputmode="decimal"
              step="any"
              value={min()}
              onInput={(event) => onFieldInput(setMin, event.currentTarget.value)}
              class={`${inputBase} mt-1 h-11`}
            />
          </label>
          <label class="block min-w-0">
            <span class="block text-xs text-muted">Maximum</span>
            <input
              type="number"
              inputmode="decimal"
              step="any"
              value={max()}
              onInput={(event) => onFieldInput(setMax, event.currentTarget.value)}
              class={`${inputBase} mt-1 h-11`}
            />
          </label>
          <label class="block min-w-0">
            <span class="block text-xs text-muted">How many</span>
            <input
              type="number"
              inputmode="numeric"
              min="1"
              max={String(NUMBER_COUNT_MAX)}
              step="1"
              value={count()}
              onInput={(event) => onFieldInput(setCount, event.currentTarget.value)}
              class={`${inputBase} mt-1 h-11`}
            />
          </label>
          <label class="block min-w-0">
            <span class="block text-xs text-muted">Decimal places</span>
            <select
              value={String(decimals())}
              onChange={(event) => {
                setDecimals(Number(event.currentTarget.value));
                setError(null);
                noteInput();
              }}
              class={`${inputBase} mt-1 h-11`}
            >
              <For each={Array.from({ length: DECIMAL_PLACES_MAX + 1 }, (_, index) => index)}>
                {(places) => <option value={String(places)}>{places}</option>}
              </For>
            </select>
          </label>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={unique()}
              onChange={(event) => {
                setUnique(event.currentTarget.checked);
                setError(null);
              }}
              class="size-4 accent-[var(--color-accent)]"
            />
            Unique values only
          </label>
          <p class="text-xs leading-relaxed text-muted">
            Up to {NUMBER_COUNT_MAX.toLocaleString("en")} numbers. Unique draws are rejected when
            the range holds fewer values than the count.
          </p>
        </div>

        <ToolActions>
          <Button variant="primary" onClick={generate}>
            Generate numbers
          </Button>
          <CopyButton text={output()} label="Copy numbers" />
          <Button variant="quiet" onClick={resetResults} disabled={values().length === 0 && !error()}>
            Clear results
          </Button>
          <Button variant="quiet" onClick={resetDefaults}>
            Reset defaults
          </Button>
        </ToolActions>
      </ToolPanel>

      <div class="mt-5 flex flex-col gap-4">
        <Show when={error()}>
          {(message) => <ErrorState title="Check the range and count">{message()}</ErrorState>}
        </Show>

        <Show when={values().length > 0}>
          <p role="status" aria-live="polite" class="text-sm font-medium text-ink">
            {values().length === 1 ? "1 number generated" : `${values().length} numbers generated`}{" "}
            between {rangeLabel()}.
          </p>
          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <ResultCard label="Numbers drawn" value={values().length.toLocaleString("en")}>
              Between {rangeLabel()}
            </ResultCard>
            <ToolTextarea
              name="number-output"
              label="Result"
              value={output()}
              onInput={() => undefined}
              readonly
              rows={10}
              hint="Read only. Copy the list, or press Generate again for a fresh draw."
            />
          </div>
        </Show>

        <Show when={values().length === 0 && !error()}>
          <EmptyState title="No numbers yet">
            Set a minimum, a maximum, and how many values you need, then press Generate.
          </EmptyState>
        </Show>

        <Show when={history().length > 0}>
          <section aria-labelledby="number-history-heading" class="rounded-panel border border-line bg-surface p-4 sm:p-6">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="number-history-heading" class="font-serif text-xl font-semibold text-ink">
                History
              </h2>
              <p class={monoMeta}>{history().length} batches</p>
            </div>
            <ol class="mt-3">
              <For each={history()}>
                {(entry, index) => (
                  <li class="flex min-w-0 flex-col gap-1 border-t border-line py-2 text-sm first:border-t-0 sm:flex-row sm:items-baseline sm:gap-4">
                    <span class={`${monoMeta} shrink-0`}>{index() + 1}</span>
                    <span class="min-w-0 break-words text-muted">{entry.range}</span>
                    <span class="min-w-0 break-words font-mono text-[13px] text-ink">
                      {entry.values.slice(0, 12).join(", ")}
                      {entry.values.length > 12 ? " ..." : ""}
                    </span>
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
