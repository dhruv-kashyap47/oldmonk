import { Show, createSignal } from "solid-js";
import { track } from "../../analytics";
import { downloadText } from "../../lib/download";
import { formatBytes } from "../../lib/format";
import { formatJson, type JsonError, type JsonIndent } from "./logic";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { CopyButton } from "../../components/ui/CopyButton";
import { Button } from "../../components/ui/Button";
import { ErrorState, EmptyState } from "../../components/tool/states";
import { monoMeta } from "../../components/ui/styles";

const SAMPLE = `{"name":"oldmonk","categories":["developer","text"],"meta":{"version":1,"private":true},"tools":[{"slug":"json-formatter","indent":2}]}`;

export default function JsonFormatterTool() {
  const [input, setInput] = createSignal("");
  const [output, setOutput] = createSignal("");
  const [error, setError] = createSignal<JsonError | null>(null);
  const [indent, setIndent] = createSignal<JsonIndent>(2);
  const [sortKeys, setSortKeys] = createSignal(false);
  const [stats, setStats] = createSignal<{
    before: number;
    after: number;
    duplicates: readonly string[];
  } | null>(null);
  let sentFirstInput = false;

  function onInput(value: string) {
    setInput(value);
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "json-formatter" });
    }
  }

  function run(options?: { indent?: JsonIndent; sortKeys?: boolean }) {
    const result = formatJson(input(), {
      indent: options?.indent ?? indent(),
      sortKeys: options?.sortKeys ?? sortKeys(),
    });
    if (result.ok) {
      setOutput(result.output);
      setError(null);
      setStats({
        before: result.bytesBefore,
        after: result.bytesAfter,
        duplicates: result.duplicateKeys,
      });
      track("tool_complete", { slug: "json-formatter" });
    } else {
      setOutput("");
      setStats(null);
      setError(result.error);
    }
  }

  function refreshFormattedOutput(options?: { indent?: JsonIndent; sortKeys?: boolean }) {
    if (output().length > 0) run(options);
  }

  function loadSample() {
    setInput(SAMPLE);
    setOutput("");
    setError(null);
    setStats(null);
  }

  function clear() {
    setInput("");
    setOutput("");
    setError(null);
    setStats(null);
  }

  function download() {
    downloadText("formatted.json", output(), "application/json");
  }

  return (
    <>
      <ToolPanel label="JSON formatter">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="flex flex-wrap items-end gap-4">
            <div>
              <label for="json-indent" class="block text-xs text-muted">
                Indent
              </label>
              <select
                id="json-indent"
                value={String(indent())}
                onChange={(event) => {
                  const next =
                    event.currentTarget.value === "tab"
                      ? "tab"
                      : (Number(event.currentTarget.value) as 2 | 4);
                  setIndent(next);
                  refreshFormattedOutput({ indent: next });
                }}
                class="focus-ring mt-1 h-11 rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="tab">Tab</option>
              </select>
            </div>
            <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={sortKeys()}
                onChange={(event) => {
                  const next = event.currentTarget.checked;
                  setSortKeys(next);
                  refreshFormattedOutput({ sortKeys: next });
                }}
                class="size-4 accent-[var(--color-accent)]"
              />
              Sort keys
            </label>
          </div>
          <p class={monoMeta}>Paste, format, copy</p>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-2">
          <ToolTextarea
            name="json-input"
            label="JSON input"
            value={input()}
            onInput={onInput}
            placeholder='Paste JSON here, for example {"a":1}'
            rows={16}
            hint="Up to 5 MB. A leading byte order mark is ignored."
          />
          <ToolTextarea
            name="json-output"
            label="Formatted JSON"
            value={output()}
            onInput={() => undefined}
            readonly
            rows={16}
            placeholder="The formatted result appears here."
            hint="Read only. Copy or download the result."
          />
        </div>

        <ToolActions>
          <Button variant="primary" onClick={() => run()} disabled={input().trim().length === 0}>
            Format JSON
          </Button>
          <CopyButton text={output()} label="Copy output" />
          <Button variant="quiet" onClick={download} disabled={output().length === 0}>
            Download
          </Button>
          <Button variant="quiet" onClick={loadSample}>
            Load sample
          </Button>
          <Button variant="quiet" onClick={clear} disabled={input().length === 0 && output().length === 0}>
            Clear
          </Button>
        </ToolActions>
      </ToolPanel>

      <div class="mt-5 flex flex-col gap-4">
        <Show when={error()}>
          {(current) => (
            <ErrorState title={`Line ${current().line}, column ${current().column}`}>
              {current().message}
            </ErrorState>
          )}
        </Show>

        <Show when={stats()}>
          {(current) => (
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              <span>
                {formatBytes(current().before)} in, {formatBytes(current().after)} out
              </span>
              <Show when={current().duplicates.length > 0}>
                <span class="text-accent-warm">
                  Duplicate keys collapsed, last value kept:{" "}
                  {current().duplicates.slice(0, 5).join(", ")}
                  {current().duplicates.length > 5 ? " and more" : ""}
                </span>
              </Show>
            </div>
          )}
        </Show>

        <Show when={!error() && !stats() && input().length === 0 && output().length === 0}>
          <EmptyState title="Nothing to format yet">
            Paste a JSON document, or load the sample to see the output and the error
            handling.
          </EmptyState>
        </Show>
      </div>
    </>
  );
}
