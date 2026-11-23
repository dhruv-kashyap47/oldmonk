import { For, Show, createSignal } from "solid-js";
import { track } from "../../analytics";
import {
  buildUrl,
  decodeUrlText,
  encodeUrlText,
  parseUrl,
  type ParsedUrl,
  type QueryPair,
  type UrlScope,
} from "./logic";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { Button } from "../../components/ui/Button";
import { CopyButton } from "../../components/ui/CopyButton";
import { EmptyState, ErrorState } from "../../components/tool/states";
import { inputBase, monoMeta } from "../../components/ui/styles";

type UrlAction = "encode" | "decode";

const SAMPLE = "search terms & more/less?";

export default function UrlEncoderTool() {
  const [scope, setScope] = createSignal<UrlScope>("component");
  const [action, setAction] = createSignal<UrlAction>("encode");
  const [input, setInput] = createSignal("");
  const [output, setOutput] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);

  const [urlInput, setUrlInput] = createSignal("");
  const [parsed, setParsed] = createSignal<ParsedUrl | null>(null);
  const [pairs, setPairs] = createSignal<QueryPair[]>([]);
  const [tableUrl, setTableUrl] = createSignal("");
  const [tableError, setTableError] = createSignal<string | null>(null);

  let sentFirstInput = false;

  function onInput(value: string) {
    setInput(value);
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "url-encoder" });
    }
  }

  function run() {
    const result =
      action() === "encode"
        ? encodeUrlText(input(), scope())
        : decodeUrlText(input(), scope());

    if (result.ok) {
      setOutput(result.output);
      setError(null);
      track("tool_complete", { slug: "url-encoder", action: action() });
    } else {
      setOutput("");
      setError(result.message);
    }
  }

  function rebuild(base: ParsedUrl, next: readonly QueryPair[]) {
    setPairs([...next]);
    const built = buildUrl(base, next);
    if (built.ok) {
      setTableUrl(built.output);
      setTableError(null);
    } else {
      setTableUrl("");
      setTableError(built.message);
    }
  }

  function parseCurrent() {
    const result = parseUrl(urlInput());
    if (!result.ok) {
      setParsed(null);
      setPairs([]);
      setTableUrl("");
      setTableError(result.message);
      return;
    }
    setParsed(result.parsed);
    rebuild(result.parsed, result.parsed.pairs);
  }

  function updatePair(index: number, field: "key" | "value", value: string) {
    const base = parsed();
    if (!base) return;
    const next = pairs().map((pair, position) => {
      if (position !== index) return pair;
      return field === "key"
        ? { key: value, value: pair.value }
        : { key: pair.key, value };
    });
    rebuild(base, next);
  }

  function removePair(index: number) {
    const base = parsed();
    if (!base) return;
    rebuild(
      base,
      pairs().filter((_, position) => position !== index),
    );
  }

  function addPair() {
    const base = parsed();
    if (!base) return;
    rebuild(base, [...pairs(), { key: "", value: "" }]);
  }

  function loadSample() {
    setScope("component");
    setAction("encode");
    setInput(SAMPLE);
    setOutput("");
    setError(null);
  }

  function clearMain() {
    setInput("");
    setOutput("");
    setError(null);
  }

  function clearQuery() {
    setUrlInput("");
    setParsed(null);
    setPairs([]);
    setTableUrl("");
    setTableError(null);
  }

  const inputLabel = () =>
    action() === "encode" ? "Text to encode" : "Text to decode";

  const outputLabel = () =>
    action() === "encode" ? "Encoded text" : "Decoded text";

  return (
    <>
      <ToolPanel label="URL encoder and decoder">
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label for="url-scope" class="block text-xs text-muted">
              Scope
            </label>
            <select
              id="url-scope"
              value={scope()}
              onChange={(event) => {
                setScope(event.currentTarget.value === "full" ? "full" : "component");
                setOutput("");
                setError(null);
              }}
              class="focus-ring mt-1 h-11 rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
            >
              <option value="component">Component</option>
              <option value="full">Whole URL</option>
            </select>
          </div>

          <div>
            <label for="url-action" class="block text-xs text-muted">
              Direction
            </label>
            <select
              id="url-action"
              value={action()}
              onChange={(event) => {
                setAction(event.currentTarget.value === "decode" ? "decode" : "encode");
                setOutput("");
                setError(null);
              }}
              class="focus-ring mt-1 h-11 rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
            >
              <option value="encode">Encode</option>
              <option value="decode">Decode</option>
            </select>
          </div>

          <p class={`${monoMeta} ml-auto`}>
            {scope() === "component"
              ? "Reserved characters such as & and = are escaped."
              : "URL structure such as ? and & is preserved."}
          </p>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-2">
          <ToolTextarea
            name="url-input"
            label={inputLabel()}
            value={input()}
            onInput={onInput}
            placeholder={
              action() === "encode"
                ? "Type or paste text, for example search terms & more"
                : "Paste encoded text, for example search%20terms%20%26%20more"
            }
            rows={12}
            hint={
              scope() === "component"
                ? "Component mode escapes every reserved character."
                : "Whole URL mode keeps ?, &, =, /, and # readable."
            }
          />
          <ToolTextarea
            name="url-output"
            label={outputLabel()}
            value={output()}
            onInput={() => undefined}
            readonly
            rows={12}
            placeholder="The result appears here."
            hint="Read only. Copy the result."
          />
        </div>

        <ToolActions>
          <Button variant="primary" onClick={run} disabled={input().trim().length === 0}>
            {action() === "encode" ? "Encode text" : "Decode text"}
          </Button>
          <CopyButton text={output()} label="Copy output" />
          <Button variant="quiet" onClick={loadSample}>
            Load sample
          </Button>
          <Button
            variant="quiet"
            onClick={clearMain}
            disabled={input().length === 0 && output().length === 0}
          >
            Clear
          </Button>
        </ToolActions>
      </ToolPanel>

      <div class="mt-5 flex flex-col gap-4">
        <Show when={error()}>
          {(message) => <ErrorState title="Percent encoding error">{message()}</ErrorState>}
        </Show>

        <Show when={output().length > 0}>
          <p role="status" class={monoMeta}>
            {output().length.toLocaleString("en")} characters in the result
          </p>
        </Show>

        <Show when={output().length === 0 && !error()}>
          <EmptyState title="No output yet">
            Paste text and press the button. Whole URL mode leaves the query separators
            readable, while component mode escapes them so the value can sit inside a query.
          </EmptyState>
        </Show>
      </div>

      <ToolPanel label="Query parameters" class="mt-8">
        <h2 class="text-lg font-medium text-ink">Query parameters</h2>
        <p class="mt-1 text-sm leading-relaxed text-muted">
          Paste a URL, edit the table, and copy the rebuilt URL. Percent escapes in keys and
          values are decoded for editing.
        </p>

        <div class="mt-4 flex flex-wrap items-end gap-3">
          <div class="min-w-0 flex-1">
            <label for="url-query-input" class="block text-sm font-medium text-ink">
              URL with a query string
            </label>
            <input
              id="url-query-input"
              type="text"
              value={urlInput()}
              onInput={(event) => setUrlInput(event.currentTarget.value)}
              placeholder="https://example.com/search?q=tea&page=2#results"
              class={`${inputBase} mt-2 font-mono text-[13px]`}
            />
          </div>
          <Button variant="secondary" onClick={parseCurrent} disabled={urlInput().trim().length === 0}>
            Parse URL
          </Button>
          <Button
            variant="quiet"
            onClick={clearQuery}
            disabled={
              urlInput().length === 0 &&
              !parsed() &&
              tableUrl().length === 0 &&
              !tableError()
            }
          >
            Clear
          </Button>
        </div>

        <Show when={tableError()}>
          {(message) => (
            <div class="mt-4">
              <ErrorState title="Query string error">{message()}</ErrorState>
            </div>
          )}
        </Show>

        <Show when={parsed()}>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="border-b border-line text-left">
                  <th scope="col" class="py-2 pr-3 text-[13px] font-normal text-muted">
                    Key
                  </th>
                  <th scope="col" class="py-2 pr-3 text-[13px] font-normal text-muted">
                    Value
                  </th>
                  <th scope="col" class="py-2 text-[13px] font-normal text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <For each={pairs()} keyed={false}>
                  {(pair, index) => (
                    <tr class="border-b border-line">
                      <td class="py-2 pr-3">
                        <input
                          type="text"
                          value={pair().key}
                          onInput={(event) =>
                            updatePair(index, "key", event.currentTarget.value)
                          }
                          aria-label={`Key for parameter ${index + 1}`}
                          class={`${inputBase} min-w-36 font-mono text-[13px]`}
                        />
                      </td>
                      <td class="py-2 pr-3">
                        <input
                          type="text"
                          value={pair().value}
                          onInput={(event) =>
                            updatePair(index, "value", event.currentTarget.value)
                          }
                          aria-label={`Value for parameter ${index + 1}`}
                          class={`${inputBase} min-w-36 font-mono text-[13px]`}
                        />
                      </td>
                      <td class="py-2">
                        <Button
                          variant="quiet"
                          aria-label={`Remove parameter ${index + 1}`}
                          onClick={() => removePair(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>

          <ToolActions>
            <Button variant="secondary" onClick={addPair}>
              Add parameter
            </Button>
          </ToolActions>

          <div class="mt-4">
            <label for="url-rebuilt" class="block text-sm font-medium text-ink">
              Rebuilt URL
            </label>
            <input
              id="url-rebuilt"
              type="text"
              value={tableUrl()}
              readonly
              class={`${inputBase} mt-2 font-mono text-[13px]`}
            />
            <div class="mt-2">
              <CopyButton text={tableUrl()} label="Copy URL" />
            </div>
          </div>
        </Show>

        <Show when={!parsed() && !tableError()}>
          <div class="mt-4">
            <EmptyState title="No URL parsed yet">
              Paste a URL with a query string and press Parse URL. A fragment after the
              query is kept when the URL is rebuilt.
            </EmptyState>
          </div>
        </Show>
      </ToolPanel>
    </>
  );
}
