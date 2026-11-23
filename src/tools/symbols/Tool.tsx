import { For, Show, createMemo, createSignal, onCleanup, onSettled } from "solid-js";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { CopyButton } from "../../components/ui/CopyButton";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/tool/states";
import { inputBase, monoMeta } from "../../components/ui/styles";
import { copyText } from "../../lib/clipboard";
import { readStoredJson, writeStoredJson } from "../../lib/storage";
import { SYMBOL_CATEGORIES, type SymbolEntry } from "./data";
import {
  CATEGORY_OPTIONS,
  addRecent,
  copyAllText,
  filterSymbols,
  resolveRecent,
  type CategoryFilter,
} from "./logic";

const RECENT_KEY = "symbols:recent";

export default function SymbolsTool() {
  const [query, setQuery] = createSignal("");
  const [category, setCategory] = createSignal<CategoryFilter>("all");
  const [recent, setRecent] = createSignal<readonly string[]>([]);
  const [notice, setNotice] = createSignal("");
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;

  onSettled(() => {
    const stored = readStoredJson<unknown>(RECENT_KEY, []);
    if (Array.isArray(stored)) {
      const chars = stored.filter((entry): entry is string => typeof entry === "string");
      setRecent(chars.slice(0, 8));
    }
  });

  onCleanup(() => {
    if (noticeTimer) clearTimeout(noticeTimer);
  });

  const visible = createMemo(() => filterSymbols(query(), category()));
  const recentEntries = createMemo(() => resolveRecent(recent()));

  function announce(message: string): void {
    setNotice(message);
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => setNotice(""), 2400);
  }

  async function copySymbol(entry: SymbolEntry): Promise<void> {
    const result = await copyText(entry.char);
    if (!result.ok) {
      announce(result.message);
      return;
    }
    const next = addRecent(recent(), entry.char);
    setRecent(next);
    writeStoredJson(RECENT_KEY, next);
    announce(`Copied ${entry.name}.`);
  }

  function resetFilters(): void {
    setQuery("");
    setCategory("all");
  }

  return (
    <ToolPanel label="Symbols to copy">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p class="text-sm text-muted">
          Pick a category or search by name. Clicking a symbol copies it.
        </p>
        <span class={monoMeta}>{SYMBOL_CATEGORIES.length} categories</span>
      </div>

      <div class="mt-4">
        <label for="symbol-search" class="block text-xs text-muted">
          Search symbols
        </label>
        <input
          id="symbol-search"
          type="search"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="heart, arrow, euro, dice"
          autocomplete="off"
          class={`${inputBase} mt-1`}
        />
      </div>

      <div role="group" aria-label="Symbol category" class="mt-3 flex flex-wrap gap-2">
        <For each={CATEGORY_OPTIONS}>
          {(option) => (
            <button
              type="button"
              aria-pressed={category() === option.id ? "true" : "false"}
              onClick={() => setCategory(option.id)}
              class={`focus-ring inline-flex min-h-11 items-center rounded-control border px-3 text-sm transition-colors ${
                category() === option.id
                  ? "border-accent bg-accent/10 text-ink"
                  : "border-line bg-surface text-muted hover:border-accent hover:text-ink"
              }`}
            >
              {option.name}
            </button>
          )}
        </For>
      </div>

      <ToolActions>
        <CopyButton
          text={copyAllText(visible())}
          label={`Copy all visible (${visible().length})`}
        />
        <Button
          variant="quiet"
          onClick={resetFilters}
          disabled={query().length === 0 && category() === "all"}
        >
          Reset filters
        </Button>
      </ToolActions>

      <p role="status" aria-live="polite" class="mt-3 min-h-5 text-xs text-muted">
        {notice()}
      </p>

      <Show when={recentEntries().length > 0}>
        <div class="mt-2">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h3 class="text-sm font-medium text-ink">Recently used</h3>
            <span class={monoMeta}>Up to 8, saved in this browser</span>
          </div>
          <ul aria-label="Recently used symbols" class="mt-2 flex flex-wrap gap-2">
            <For each={recentEntries()}>
              {(entry) => (
                <li>
                  <button
                    type="button"
                    onClick={() => void copySymbol(entry)}
                    aria-label={`Copy ${entry.name} again`}
                    title={entry.name}
                    class="focus-ring inline-flex size-11 items-center justify-center rounded-control border border-line bg-surface text-xl text-ink transition-colors hover:border-accent"
                  >
                    <span aria-hidden="true">{entry.char}</span>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>

      <div class="mt-5 flex flex-wrap items-baseline justify-between gap-2">
        <span class={monoMeta}>{visible().length} symbols</span>
        <span class="text-xs text-muted">
          {query().trim().length > 0 ? `Matching "${query().trim()}"` : "Full catalog"}
        </span>
      </div>

      <Show
        when={visible().length > 0}
        fallback={
          <div class="mt-3">
            <EmptyState title="No symbols match">
              Try a shorter word, a single keyword such as heart or dice, or switch the
              category back to All.
            </EmptyState>
          </div>
        }
      >
        <ul class="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          <For each={visible()}>
            {(entry) => (
              <li class="min-w-0">
                <button
                  type="button"
                  onClick={() => void copySymbol(entry)}
                  aria-label={`Copy ${entry.name}`}
                  title={entry.name}
                  class="focus-ring flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-control border border-line bg-surface px-1 py-2 text-ink transition-colors hover:border-accent"
                >
                  <span aria-hidden="true" class="text-2xl leading-none">
                    {entry.char}
                  </span>
                  <span
                    aria-hidden="true"
                    class="w-full truncate text-center text-[11px] leading-tight text-muted"
                  >
                    {entry.name}
                  </span>
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </ToolPanel>
  );
}
