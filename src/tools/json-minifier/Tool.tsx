import { Show, createSignal } from "solid-js";
import { track } from "../../analytics";
import { downloadText } from "../../lib/download";
import { formatBytes } from "../../lib/format";
import { minifyText, type MinifyResult } from "./logic";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { Button } from "../../components/ui/Button";
import { CopyButton } from "../../components/ui/CopyButton";
import { EmptyState, ErrorState, ResultCard } from "../../components/tool/states";
import { monoMeta } from "../../components/ui/styles";

const SAMPLE = `{
  "name": "oldmonk",
  "categories": ["developer", "text"],
  "meta": {
    "version": 1,
    "private": true
  }
}`;

export default function JsonMinifierTool() {
  const [input, setInput] = createSignal("");
  const [result, setResult] = createSignal<MinifyResult | null>(null);
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
      track("tool_first_input", { slug: "json-minifier" });
    }
  }

  function run() {
    const next = minifyText(input());
    setResult(next);
    if (next.ok) track("tool_complete", { slug: "json-minifier" });
  }

  function loadSample() {
    setInput(SAMPLE);
    setResult(null);
  }

  function clear() {
    setInput("");
    setResult(null);
  }

  function download() {
    const current = success();
    if (!current) return;
    downloadText("minified.json", current.output, "application/json");
  }

  return (
    <>
      <ToolPanel label="JSON minifier">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <p class="text-sm text-ink">
            Remove indentation and line breaks without changing the values.
          </p>
          <p class={monoMeta}>Up to 5 MB</p>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-2">
          <ToolTextarea
            name="json-minifier-input"
            label="JSON input"
            value={input()}
            onInput={onInput}
            placeholder='Paste JSON here, for example { "a": 1 }'
            rows={16}
            hint="A leading byte order mark is ignored."
          />
          <ToolTextarea
            name="json-minifier-output"
            label="Minified JSON"
            value={success()?.output ?? ""}
            onInput={() => undefined}
            readonly
            rows={16}
            placeholder="The minified result appears here."
            hint="Read only. Long strings scroll inside the box."
          />
        </div>

        <ToolActions>
          <Button variant="primary" onClick={run} disabled={input().trim().length === 0}>
            Minify JSON
          </Button>
          <CopyButton text={success()?.output ?? ""} label="Copy output" />
          <Button variant="quiet" onClick={download} disabled={!success()}>
            Download
          </Button>
          <Button variant="quiet" onClick={loadSample}>
            Load sample
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
              <div class="grid gap-4 sm:grid-cols-3">
                <ResultCard label="Before" value={formatBytes(current().bytesBefore)}>
                  Original UTF-8 size
                </ResultCard>
                <ResultCard label="After" value={formatBytes(current().bytesAfter)}>
                  Minified UTF-8 size
                </ResultCard>
                <ResultCard label="Saved" value={`${current().percentSaved}%`}>
                  {formatBytes(Math.abs(current().removedBytes))}{" "}
                  {current().removedBytes < 0 ? "added" : "removed"}
                </ResultCard>
              </div>
              <p class="mt-3 text-sm leading-relaxed text-muted">
                Transport compression such as gzip or Brotli is a separate step. The numbers
                above describe the text before any compression.
              </p>
            </div>
          )}
        </Show>

        <Show when={failure()}>
          {(current) => (
            <ErrorState
              title={`Invalid JSON at line ${current().error.line}, column ${current().error.column}`}
            >
              {current().error.message}
            </ErrorState>
          )}
        </Show>

        <Show when={!result()}>
          <EmptyState title="Nothing to minify yet">
            Paste a JSON document and press Minify JSON. The size report appears after the
            document parses.
          </EmptyState>
        </Show>
      </div>
    </>
  );
}
