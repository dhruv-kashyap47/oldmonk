import { Show, createSignal } from "solid-js";
import { track } from "../../analytics";
import { formatBytes } from "../../lib/format";
import { validateJson, type ValidationResult } from "./logic";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { Button } from "../../components/ui/Button";
import { EmptyState, ErrorState, ResultCard } from "../../components/tool/states";
import { monoMeta } from "../../components/ui/styles";

const INVALID_SAMPLE = `{
  "name": "oldmonk",
  "tools": ["json-formatter", "json-validator",],
  "private": true
}`;

export default function JsonValidatorTool() {
  const [input, setInput] = createSignal("");
  const [result, setResult] = createSignal<ValidationResult | null>(null);
  let sentFirstInput = false;

  const success = () => {
    const current = result();
    return current && current.ok ? current : null;
  };
  const failure = () => {
    const current = result();
    return current && !current.ok ? current : null;
  };

  function onInput(value: string) {
    setInput(value);
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "json-validator" });
    }
  }

  function run() {
    const verdict = validateJson(input());
    setResult(verdict);
    if (verdict.ok) {
      track("tool_complete", { slug: "json-validator", valid: true });
    } else {
      track("tool_complete", { slug: "json-validator", valid: false });
    }
  }

  function loadInvalidSample() {
    setInput(INVALID_SAMPLE);
    setResult(null);
  }

  function clear() {
    setInput("");
    setResult(null);
  }

  return (
    <>
      <ToolPanel label="JSON validator">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <p class="text-sm text-ink">
            Paste a document and check it against the JSON grammar.
          </p>
          <p class={monoMeta}>Up to 5 MB</p>
        </div>

        <div class="mt-5">
          <ToolTextarea
            name="json-validator-input"
            label="JSON input"
            value={input()}
            onInput={onInput}
            placeholder='Paste JSON here, for example {"a":1}'
            rows={16}
            hint="A leading byte order mark is ignored. The document is not rewritten."
          />
        </div>

        <ToolActions>
          <Button variant="primary" onClick={run} disabled={input().trim().length === 0}>
            Validate JSON
          </Button>
          <Button variant="quiet" onClick={loadInvalidSample}>
            Load invalid sample
          </Button>
          <Button variant="quiet" onClick={clear} disabled={input().length === 0 && !result()}>
            Clear
          </Button>
        </ToolActions>
      </ToolPanel>

      <div class="mt-5 flex flex-col gap-4">
        <Show when={success()}>
          {(current) => (
            <div role="status">
              <ResultCard label="Verdict" value="Valid JSON">
                {formatBytes(current().bytes)} across{" "}
                {current().lines === 1 ? "1 line" : `${current().lines} lines`}. Top level is{" "}
                {current().valueType}.
              </ResultCard>
            </div>
          )}
        </Show>

        <Show when={success()?.duplicateKeys.length ? success() : null}>
          {(current) => (
            <div
              role="status"
              class="rounded-panel border border-accent-warm/40 bg-accent-warm/5 p-4"
            >
              <p class="text-sm font-medium text-ink">Duplicate keys found</p>
              <p class="mt-1 text-sm leading-relaxed text-muted">
                {current().duplicateKeys.slice(0, 8).join(", ")}
                {current().duplicateKeys.length > 8
                  ? ` and ${current().duplicateKeys.length - 8} more`
                  : ""}
                . The document is still valid JSON. This parser keeps the last value, matching
                JSON.parse in browsers.
              </p>
            </div>
          )}
        </Show>

        <Show when={failure()}>
          {(current) => (
            <ErrorState
              title={`Invalid JSON at line ${current().error.line}, column ${current().error.column}`}
            >
              <p>{current().error.message}</p>
              <Show when={current().lineText !== null}>
                <pre class="mt-3 overflow-x-auto rounded-control border border-line bg-surface-2 p-3 font-mono text-[13px] leading-relaxed text-ink">
                  <code>{current().lineText}</code>
                </pre>
              </Show>
            </ErrorState>
          )}
        </Show>

        <Show when={!result()}>
          <EmptyState title="No verdict yet">
            Paste a JSON document and press Validate JSON. The sample contains a trailing
            comma, one of the most common syntax errors.
          </EmptyState>
        </Show>
      </div>
    </>
  );
}
