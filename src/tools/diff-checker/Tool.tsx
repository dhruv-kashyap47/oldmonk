import { For, Show, createMemo, createSignal } from "solid-js";
import { track } from "../../analytics";
import { formatCount } from "../../lib/format";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { CopyButton } from "../../components/ui/CopyButton";
import { Button } from "../../components/ui/Button";
import { ErrorState, EmptyState } from "../../components/tool/states";
import { monoMeta } from "../../components/ui/styles";
import {
  DIFF_MAX_BYTES,
  DIFF_MAX_LINES,
  diffText,
  unifiedToText,
  wordDiff,
  type DiffError,
  type DiffResult,
  type DiffRow,
  type DiffSideLine,
  type WordToken,
} from "./logic";

const SAMPLE_LEFT = `const user = {
  name: "Ana",
  plan: "free"
};

console.log(user.name);`;

const SAMPLE_RIGHT = `const user = {
  name: "Ana",
  plan: "pro",
  seats: 3
};

console.log(user.name);`;

type DiffSuccess = Extract<DiffResult, { ok: true }>;
type View = "split" | "unified";
type Tone = "equal" | "delete" | "insert" | "replace" | "empty";

function toneClass(tone: Tone): string {
  if (tone === "delete") return "bg-danger/5";
  if (tone === "insert") return "bg-success/10";
  if (tone === "replace") return "bg-accent-warm/10";
  if (tone === "empty") return "bg-surface-2/50";
  return "";
}

function DiffCell(props: {
  side: DiffSideLine | null;
  tone: Tone;
  tokens?: readonly WordToken[];
  class?: string;
}) {
  return (
    <div class={`flex min-h-6 gap-2 px-2 py-0.5 ${toneClass(props.tone)} ${props.class ?? ""}`}>
      <Show when={props.tone === "delete"}>
        <span class="sr-only">Removed: </span>
      </Show>
      <Show when={props.tone === "insert"}>
        <span class="sr-only">Added: </span>
      </Show>
      <Show when={props.tone === "replace"}>
        <span class="sr-only">Changed: </span>
      </Show>
      <span class="w-8 shrink-0 select-none text-right font-mono text-[11px] leading-5 text-muted">
        {props.side?.line ?? ""}
      </span>
      <span class="min-w-0 whitespace-pre-wrap break-all font-mono text-[13px] leading-5 text-ink">
        <Show when={props.side} fallback={<span class="text-muted"> </span>}>
          {(side) => (
            <Show
              when={props.tokens}
              fallback={side().text.length > 0 ? side().text : " "}
            >
              {(tokens) => (
                <For each={tokens()}>
                  {(token) => (
                    <span class={token.changed ? "rounded-sm bg-accent-warm/30" : ""}>
                      {token.text}
                    </span>
                  )}
                </For>
              )}
            </Show>
          )}
        </Show>
      </span>
    </div>
  );
}

function SplitRow(props: { row: DiffRow }) {
  const words = createMemo(() =>
    props.row.kind === "replace" && props.row.left && props.row.right
      ? wordDiff(props.row.left.text, props.row.right.text)
      : null,
  );

  const leftTone = (): Tone =>
    props.row.kind === "equal"
      ? "equal"
      : props.row.kind === "replace"
        ? "replace"
        : props.row.kind === "delete"
          ? "delete"
          : "empty";

  const rightTone = (): Tone =>
    props.row.kind === "equal"
      ? "equal"
      : props.row.kind === "replace"
        ? "replace"
        : props.row.kind === "insert"
          ? "insert"
          : "empty";

  return (
    <div class="grid grid-cols-2 border-b border-line last:border-b-0">
      <DiffCell side={props.row.left} tone={leftTone()} tokens={words()?.left} />
      <DiffCell
        side={props.row.right}
        tone={rightTone()}
        tokens={words()?.right}
        class="border-l border-line"
      />
    </div>
  );
}

function unifiedTone(tone: Tone): string {
  if (tone === "insert") return "bg-success/10";
  if (tone === "delete") return "bg-danger/5";
  if (tone === "empty") return "bg-surface-2/50";
  return "";
}

export default function DiffCheckerTool() {
  const [left, setLeft] = createSignal("");
  const [right, setRight] = createSignal("");
  const [ignoreWhitespace, setIgnoreWhitespace] = createSignal(false);
  const [ignoreCase, setIgnoreCase] = createSignal(false);
  const [view, setView] = createSignal<View>("split");
  const [result, setResult] = createSignal<DiffSuccess | null>(null);
  const [error, setError] = createSignal<DiffError | null>(null);
  const [announcement, setAnnouncement] = createSignal("");
  let sentFirstInput = false;

  function resetResult() {
    setResult(null);
    setError(null);
    setAnnouncement("");
  }

  function onLeftInput(value: string) {
    setLeft(value);
    resetResult();
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "diff-checker" });
    }
  }

  function onRightInput(value: string) {
    setRight(value);
    resetResult();
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "diff-checker" });
    }
  }

  function compare() {
    const outcome = diffText(left(), right(), {
      ignoreWhitespace: ignoreWhitespace(),
      ignoreCase: ignoreCase(),
    });
    if (outcome.ok) {
      setResult(outcome);
      setError(null);
      setAnnouncement(
        outcome.changes.length === 0
          ? "The two texts are identical under the current options."
          : `${formatCount(outcome.stats.additions, "addition")}, ${formatCount(outcome.stats.deletions, "deletion")}.`,
      );
      track("tool_complete", { slug: "diff-checker" });
    } else {
      setResult(null);
      setError(outcome.error);
      setAnnouncement("");
    }
  }

  function swap() {
    const previousLeft = left();
    setLeft(right());
    setRight(previousLeft);
    resetResult();
  }

  function loadSample() {
    setLeft(SAMPLE_LEFT);
    setRight(SAMPLE_RIGHT);
    resetResult();
  }

  function clear() {
    setLeft("");
    setRight("");
    resetResult();
  }

  return (
    <>
      <ToolPanel label="Diff checker">
        <div class="grid gap-4 lg:grid-cols-2">
          <ToolTextarea
            name="diff-left"
            label="Original text"
            value={left()}
            onInput={onLeftInput}
            placeholder="Paste the original text here"
            rows={14}
            hint="Up to 2,000 lines and 200 KB."
          />
          <ToolTextarea
            name="diff-right"
            label="Changed text"
            value={right()}
            onInput={onRightInput}
            placeholder="Paste the changed text here"
            rows={14}
            hint="Up to 2,000 lines and 200 KB."
          />
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
          <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={ignoreWhitespace()}
              onChange={(event) => {
                setIgnoreWhitespace(event.currentTarget.checked);
                resetResult();
              }}
              class="size-4 accent-[var(--color-accent)]"
            />
            Ignore whitespace
          </label>
          <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={ignoreCase()}
              onChange={(event) => {
                setIgnoreCase(event.currentTarget.checked);
                resetResult();
              }}
              class="size-4 accent-[var(--color-accent)]"
            />
            Ignore case
          </label>
          <span class={monoMeta}>
            Limits: {DIFF_MAX_LINES.toLocaleString("en")} lines, {DIFF_MAX_BYTES / 1024} KB per side
          </span>
        </div>

        <ToolActions>
          <Button variant="primary" onClick={compare} disabled={left().length === 0 && right().length === 0}>
            Compare texts
          </Button>
          <Button variant="quiet" onClick={swap} disabled={left().length === 0 && right().length === 0}>
            Swap sides
          </Button>
          <Button variant="quiet" onClick={loadSample}>
            Load sample
          </Button>
          <Button variant="quiet" onClick={clear} disabled={left().length === 0 && right().length === 0}>
            Clear
          </Button>
          <p role="status" aria-live="polite" class={monoMeta}>
            {announcement()}
          </p>
        </ToolActions>

        <Show when={error()}>
          {(current) => (
            <div class="mt-5">
              <ErrorState title={current().title}>{current().message}</ErrorState>
            </div>
          )}
        </Show>

        <Show when={result()}>
          {(current) => (
            <div class="mt-6">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-sm text-muted">
                  <span class="font-medium text-success">
                    {formatCount(current().stats.additions, "addition")}
                  </span>
                  ,{" "}
                  <span class="font-medium text-danger">
                    {formatCount(current().stats.deletions, "deletion")}
                  </span>
                  , {formatCount(current().stats.unchanged, "unchanged line")}
                </p>
                <CopyButton text={unifiedToText(current().unified)} label="Copy unified diff" />
              </div>

              <Show
                when={current().changes.length > 0}
                fallback={
                  <p class="mt-4 rounded-panel border border-dashed border-line bg-surface-2/60 p-4 text-sm text-muted">
                    The two texts are identical under the current options.
                  </p>
                }
              >
                <fieldset class="mt-4 flex flex-wrap items-center gap-4">
                  <legend class="sr-only">Diff view</legend>
                  <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
                    <input
                      type="radio"
                      name="diff-view"
                      value="split"
                      checked={view() === "split"}
                      onChange={() => setView("split")}
                    />
                    Side by side
                  </label>
                  <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
                    <input
                      type="radio"
                      name="diff-view"
                      value="unified"
                      checked={view() === "unified"}
                      onChange={() => setView("unified")}
                    />
                    Unified
                  </label>
                </fieldset>

                <Show when={view() === "split"}>
                  <div class="mt-2 overflow-hidden rounded-control border border-line">
                    <div class="grid grid-cols-2 border-b border-line bg-surface-2">
                      <p class="px-2 py-2 text-xs font-medium text-muted">Original</p>
                      <p class="border-l border-line px-2 py-2 text-xs font-medium text-muted">
                        Changed
                      </p>
                    </div>
                    <div class="max-h-[32rem] overflow-auto">
                      <For each={current().rows}>{(row) => <SplitRow row={row} />}</For>
                    </div>
                  </div>
                </Show>

                <Show when={view() === "unified"}>
                  <div class="mt-2 max-h-[32rem] overflow-auto rounded-control border border-line">
                    <For each={current().unified}>
                      {(line) => (
                        <Show
                          when={line.kind !== "header"}
                          fallback={
                            <div class="bg-surface-2 px-3 py-1 font-mono text-[12px] text-muted">
                              {line.text}
                            </div>
                          }
                        >
                          <div
                            class={`grid grid-cols-[2.5rem_2.5rem_1.25rem_1fr] ${
                              line.kind === "insert"
                                ? unifiedTone("insert")
                                : line.kind === "delete"
                                  ? unifiedTone("delete")
                                  : ""
                            }`}
                          >
                            <span class="select-none pr-2 text-right font-mono text-[11px] leading-5 text-muted">
                              {line.oldLine ?? ""}
                            </span>
                            <span class="select-none pr-2 text-right font-mono text-[11px] leading-5 text-muted">
                              {line.newLine ?? ""}
                            </span>
                            <span class="select-none font-mono text-[12px] leading-5 text-muted">
                              {line.kind === "insert" ? "+" : line.kind === "delete" ? "-" : " "}
                            </span>
                            <span class="whitespace-pre-wrap break-all pr-2 font-mono text-[13px] leading-5 text-ink">
                              {line.text.length > 0 ? line.text : " "}
                            </span>
                          </div>
                        </Show>
                      )}
                    </For>
                  </div>
                </Show>
              </Show>
            </div>
          )}
        </Show>

        <Show when={!result() && !error()}>
          <div class="mt-5">
            <EmptyState title="Nothing compared yet">
              Paste the original text on the left and the changed text on the right, then press
              Compare texts. The sample shows a replaced line and an added line.
            </EmptyState>
          </div>
        </Show>
      </ToolPanel>
    </>
  );
}
