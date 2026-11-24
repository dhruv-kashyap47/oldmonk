import { For, Show, createSignal, onCleanup } from "solid-js";
import { track } from "../../analytics";
import { formatCount } from "../../lib/format";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { CopyButton } from "../../components/ui/CopyButton";
import { Button } from "../../components/ui/Button";
import { ErrorState, EmptyState } from "../../components/tool/states";
import { inputBase, monoMeta } from "../../components/ui/styles";
import {
  canonicalFlags,
  highlightSegments,
  REGEX_PRESETS,
  type RegexFlag,
  type RegexPreset,
  type RegexReplaceResult,
  type RegexSearchResult,
} from "./logic";
import type { RegexWorkerResponse } from "./worker";

type SearchSuccess = Extract<RegexSearchResult, { ok: true }>;

const FLAG_OPTIONS: readonly { flag: RegexFlag; label: string }[] = [
  { flag: "g", label: "global" },
  { flag: "i", label: "ignore case" },
  { flag: "m", label: "multiline" },
  { flag: "s", label: "dot all" },
  { flag: "u", label: "unicode" },
  { flag: "y", label: "sticky" },
];

export default function RegexTesterTool() {
  const [pattern, setPattern] = createSignal("");
  const [input, setInput] = createSignal("");
  const [replacement, setReplacement] = createSignal("");
  const [flags, setFlags] = createSignal<RegexFlag[]>(["g"]);
  const [search, setSearch] = createSignal<SearchSuccess | null>(null);
  const [replaced, setReplaced] = createSignal<RegexReplaceResult | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [timedOut, setTimedOut] = createSignal(false);
  const [running, setRunning] = createSignal(false);
  let worker: Worker | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let requestId = 0;
  let sentFirstInput = false;

  function stopWorker() {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (worker) {
      worker.terminate();
      worker = null;
    }
  }

  onCleanup(stopWorker);

  function clearResult() {
    setSearch(null);
    setReplaced(null);
    setError(null);
    setTimedOut(false);
  }

  function onPatternInput(value: string) {
    setPattern(value);
    clearResult();
  }

  function onTextInput(value: string) {
    setInput(value);
    clearResult();
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "regex-tester" });
    }
  }

  function onReplacementInput(value: string) {
    setReplacement(value);
    clearResult();
  }

  function toggleFlag(flag: RegexFlag, enabled: boolean) {
    setFlags((current) =>
      enabled ? [...new Set([...current, flag])] : current.filter((item) => item !== flag),
    );
    clearResult();
  }

  function run() {
    stopWorker();
    setRunning(true);
    setError(null);
    setTimedOut(false);
    setSearch(null);
    setReplaced(null);

    const id = ++requestId;
    let current: Worker;
    try {
      current = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    } catch {
      setRunning(false);
      setError("This browser could not start the worker needed to test the pattern.");
      return;
    }
    worker = current;
    timer = setTimeout(() => {
      if (worker !== current) return;
      stopWorker();
      setRunning(false);
      setTimedOut(true);
      setSearch(null);
      setReplaced(null);
    }, 750);

    current.onmessage = (event: MessageEvent<RegexWorkerResponse>) => {
      if (worker !== current || event.data.id !== id) return;
      stopWorker();
      setRunning(false);
      if (event.data.search.ok) {
        setSearch(event.data.search);
        setReplaced(event.data.replaced);
        setError(null);
        track("tool_complete", { slug: "regex-tester" });
      } else {
        setSearch(null);
        setReplaced(null);
        setError(event.data.search.error);
      }
    };

    current.onerror = () => {
      if (worker !== current) return;
      stopWorker();
      setRunning(false);
      setError("The worker stopped before it returned a result.");
    };

    current.postMessage({
      id,
      pattern: pattern(),
      flags: canonicalFlags(flags().join("")),
      input: input(),
      replacement: replacement(),
    });
  }

  function loadPreset(preset: RegexPreset) {
    setPattern(preset.pattern);
    setFlags(preset.flags.split("") as RegexFlag[]);
    setReplacement(preset.replacement);
    if (input().trim().length === 0) setInput(preset.sample);
    clearResult();
  }

  function loadSample() {
    const preset = REGEX_PRESETS[0];
    if (preset) loadPreset(preset);
  }

  function clear() {
    stopWorker();
    setRunning(false);
    setPattern("");
    setInput("");
    setReplacement("");
    setFlags(["g"]);
    clearResult();
  }

  const segments = () => highlightSegments(input(), search()?.matches ?? []);
  const matchCount = () => search()?.matches.length ?? 0;
  const replaceOutput = () => {
    const current = replaced();
    return current?.ok ? current.output : "";
  };
  const replaceError = () => {
    const current = replaced();
    return current && !current.ok ? current.error : null;
  };

  return (
    <>
      <ToolPanel label="Regex tester">
        <div class="grid gap-5 lg:grid-cols-2">
          <div>
            <label for="regex-pattern" class="block text-sm font-medium text-ink">
              Pattern
            </label>
            <input
              id="regex-pattern"
              type="text"
              value={pattern()}
              onInput={(event) => onPatternInput(event.currentTarget.value)}
              class={`${inputBase} mt-1 font-mono text-[13px]`}
              placeholder="[A-Za-z]+"
              autocomplete="off"
              spellcheck={false}
            />
            <fieldset class="mt-3">
              <legend class="text-xs text-muted">Flags</legend>
              <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <For each={FLAG_OPTIONS}>
                  {(option) => (
                    <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={flags().includes(option.flag)}
                        onChange={(event) => toggleFlag(option.flag, event.currentTarget.checked)}
                        class="size-4 accent-[var(--color-accent)]"
                      />
                      <span class="font-mono text-xs text-muted">{option.flag}</span>
                      {option.label}
                    </label>
                  )}
                </For>
              </div>
            </fieldset>
          </div>

          <div>
            <label for="regex-replacement" class="block text-sm font-medium text-ink">
              Replace with
            </label>
            <input
              id="regex-replacement"
              type="text"
              value={replacement()}
              onInput={(event) => onReplacementInput(event.currentTarget.value)}
              class={`${inputBase} mt-1 font-mono text-[13px]`}
              placeholder="$1"
              autocomplete="off"
              spellcheck={false}
            />
            <p class="mt-2 text-xs leading-relaxed text-muted">
              Use <code>$1</code> for a capture group, <code>$&amp;</code> for the whole match, and{" "}
              <code>$&lt;name&gt;</code> for a named group.
            </p>
            <div class="mt-3">
              <p class="text-xs text-muted">Pattern library</p>
              <div class="mt-1 flex flex-wrap gap-1">
                <For each={REGEX_PRESETS}>
                  {(preset) => (
                    <Button variant="quiet" class="px-2" onClick={() => loadPreset(preset)}>
                      {preset.name}
                    </Button>
                  )}
                </For>
              </div>
              <p class="mt-1 text-xs text-muted">
                A preset fills the pattern, flags, and replacement. Press Run test when you are
                ready.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <ToolTextarea
            name="regex-input"
            label="Test text"
            value={input()}
            onInput={onTextInput}
            placeholder="Paste the text to search here"
            rows={10}
            hint="Matches are capped at 1,000, and the pattern stops after 750 ms."
          />
        </div>

        <ToolActions>
          <Button variant="primary" onClick={run} disabled={running()}>
            {running() ? "Testing" : "Run test"}
          </Button>
          <CopyButton text={replaceOutput()} label="Copy replaced text" />
          <Button variant="quiet" onClick={loadSample}>
            Load sample
          </Button>
          <Button
            variant="quiet"
            onClick={clear}
            disabled={pattern().length === 0 && input().length === 0 && replacement().length === 0}
          >
            Clear
          </Button>
          <p role="status" aria-live="polite" class={monoMeta}>
            {search() ? `${formatCount(matchCount(), "match", "matches")} found.` : ""}
          </p>
        </ToolActions>

        <Show when={error()}>
          {(message) => (
            <div class="mt-5">
              <ErrorState title="Pattern error">{message()}</ErrorState>
            </div>
          )}
        </Show>

        <Show when={timedOut()}>
          <div class="mt-5">
            <ErrorState title="Pattern stopped after 750 milliseconds">
              The expression took too long and the worker was terminated. A nested quantifier
              such as <code class="font-mono">(a+)+</code> can backtrack for a very long time.
              Simplify the pattern or make it more specific.
            </ErrorState>
          </div>
        </Show>

        <Show when={search()}>
          {(current) => (
            <div class="mt-6">
              <div class="grid gap-5 lg:grid-cols-2">
                <section aria-labelledby="regex-highlight">
                  <h2 id="regex-highlight" class="font-serif text-lg font-semibold text-ink">
                    Highlighted text
                  </h2>
                  <div class="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-control border border-line bg-surface-2 p-3 font-mono text-[13px] leading-relaxed text-ink">
                    <For each={segments()}>
                      {(segment) =>
                        segment.matched ? (
                          <mark class="rounded-sm bg-accent-warm/30 text-ink">{segment.text}</mark>
                        ) : (
                          <span>{segment.text}</span>
                        )
                      }
                    </For>
                  </div>
                </section>

                <section aria-labelledby="regex-matches">
                  <h2 id="regex-matches" class="font-serif text-lg font-semibold text-ink">
                    Matches
                  </h2>
                  <p class="mt-1 text-sm text-muted">
                    {formatCount(matchCount(), "match", "matches")}
                    {current().truncated ? ", stopped at the 1,000 match cap" : ""}.
                  </p>
                  <Show
                    when={matchCount() > 0}
                    fallback={<p class="mt-2 text-sm text-muted">The pattern found no matches.</p>}
                  >
                    <ol class="mt-2 max-h-96 divide-y divide-line overflow-auto rounded-control border border-line">
                      <For each={current().matches.slice(0, 100)}>
                        {(match, index) => (
                          <li class="px-3 py-2">
                            <div class="flex flex-wrap items-baseline gap-3">
                              <span class={monoMeta}>#{index() + 1}</span>
                              <span class={monoMeta}>index {match.index}</span>
                              <span class="break-all font-mono text-[13px] text-ink">
                                {match.text.length > 0 ? match.text : "(empty match)"}
                              </span>
                            </div>
                            <Show when={match.groups.length > 0}>
                              <div class="mt-1 flex flex-wrap gap-1">
                                <For each={match.groups}>
                                  {(group, groupIndex) => (
                                    <span class="rounded-control bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                                      Group {groupIndex() + 1}: {group ?? "not matched"}
                                    </span>
                                  )}
                                </For>
                              </div>
                            </Show>
                            <Show when={match.namedGroups.length > 0}>
                              <div class="mt-1 flex flex-wrap gap-1">
                                <For each={match.namedGroups}>
                                  {(group) => (
                                    <span class="rounded-control bg-accent/10 px-2 py-0.5 font-mono text-[11px] text-accent">
                                      {group.name}: {group.value ?? "not matched"}
                                    </span>
                                  )}
                                </For>
                              </div>
                            </Show>
                          </li>
                        )}
                      </For>
                    </ol>
                    <Show when={matchCount() > 100}>
                      <p class="mt-1 text-xs text-muted">
                        The list shows the first 100 matches. The count covers all of them.
                      </p>
                    </Show>
                  </Show>
                </section>
              </div>

              <div class="mt-5">
                <ToolTextarea
                  name="regex-replaced"
                  label="Replace preview"
                  value={replaceOutput()}
                  onInput={() => undefined}
                  readonly
                  rows={6}
                  hint="Uses the same flags. Without g, only the first match is replaced."
                />
              </div>

              <Show when={replaceError()}>
                {(message) => (
                  <div class="mt-4">
                    <ErrorState title="Replacement error">{message()}</ErrorState>
                  </div>
                )}
              </Show>
            </div>
          )}
        </Show>

        <Show when={!search() && !error() && !timedOut() && !running()}>
          <div class="mt-5">
            <EmptyState title="Nothing tested yet">
              Enter a pattern and some text, then press Run test. The pattern library fills in a
              common expression so you can start from a working example.
            </EmptyState>
          </div>
        </Show>
      </ToolPanel>
    </>
  );
}
