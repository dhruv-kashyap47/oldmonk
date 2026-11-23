import { Show, createSignal } from "solid-js";
import { track } from "../../analytics";
import { downloadText } from "../../lib/download";
import { formatBytes } from "../../lib/format";
import {
  BASE64_SIZE_LIMIT,
  decodeBase64Text,
  encodeBase64Bytes,
  encodeBase64Text,
} from "./logic";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { Button } from "../../components/ui/Button";
import { CopyButton } from "../../components/ui/CopyButton";
import { EmptyState, ErrorState } from "../../components/tool/states";
import { inputBase, monoMeta } from "../../components/ui/styles";

type Base64Mode = "text" | "file";
type Base64Direction = "encode" | "decode";

const SAMPLE = "oldmonk ☕";

export default function Base64Tool() {
  const [mode, setMode] = createSignal<Base64Mode>("text");
  const [direction, setDirection] = createSignal<Base64Direction>("encode");
  const [urlSafe, setUrlSafe] = createSignal(false);
  const [input, setInput] = createSignal("");
  const [output, setOutput] = createSignal("");
  const [bytes, setBytes] = createSignal<number | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [file, setFile] = createSignal<File | null>(null);
  let fileInput: HTMLInputElement | undefined;
  let sentFirstInput = false;

  function onInput(value: string) {
    setInput(value);
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "base64" });
    }
  }

  function applySuccess(text: string, count: number) {
    setOutput(text);
    setBytes(count);
    setError(null);
    track("tool_complete", { slug: "base64", mode: mode() });
  }

  function runText() {
    const result =
      direction() === "encode"
        ? encodeBase64Text(input(), urlSafe())
        : decodeBase64Text(input(), BASE64_SIZE_LIMIT);

    if (result.ok) {
      applySuccess(result.output, result.bytes);
    } else {
      setOutput("");
      setBytes(null);
      setError(result.message);
    }
  }

  async function runFile() {
    const selected = file();
    if (!selected) return;

    if (selected.size > BASE64_SIZE_LIMIT) {
      setOutput("");
      setBytes(null);
      setError("This file is larger than the 10 MB limit.");
      return;
    }

    try {
      const buffer = await selected.arrayBuffer();
      const result = encodeBase64Bytes(new Uint8Array(buffer), urlSafe());
      if (result.ok) {
        applySuccess(result.output, result.bytes);
      } else {
        setOutput("");
        setBytes(null);
        setError(result.message);
      }
    } catch {
      setOutput("");
      setBytes(null);
      setError("The file could not be read. Choose it again and retry.");
    }
  }

  function chooseFile(selected: File | null) {
    setFile(selected);
    setOutput("");
    setBytes(null);
    setError(
      selected && selected.size > BASE64_SIZE_LIMIT
        ? "This file is larger than the 10 MB limit."
        : null,
    );
  }

  function loadSample() {
    setMode("text");
    setDirection("encode");
    setInput(SAMPLE);
    setOutput("");
    setBytes(null);
    setError(null);
  }

  function clear() {
    setInput("");
    setOutput("");
    setBytes(null);
    setError(null);
    setFile(null);
    if (fileInput) fileInput.value = "";
  }

  function download() {
    if (bytes() === null) return;
    const name = mode() === "file" || direction() === "encode" ? "base64.txt" : "decoded.txt";
    downloadText(name, output(), "text/plain");
  }

  const outputLabel = () => {
    if (mode() === "file") return "Base64 output";
    return direction() === "encode" ? "Base64 output" : "Decoded text";
  };

  const inputLabel = () => (direction() === "encode" ? "Text to encode" : "Base64 to decode");

  return (
    <>
      <ToolPanel label="Base64 encoder and decoder">
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label for="base64-mode" class="block text-xs text-muted">
              Mode
            </label>
            <select
              id="base64-mode"
              value={mode()}
              onChange={(event) => {
                setMode(event.currentTarget.value === "file" ? "file" : "text");
                setOutput("");
                setBytes(null);
                setError(null);
              }}
              class="focus-ring mt-1 h-11 rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
            >
              <option value="text">Text</option>
              <option value="file">File</option>
            </select>
          </div>

          <Show when={mode() === "text"}>
            <div>
              <label for="base64-direction" class="block text-xs text-muted">
                Direction
              </label>
              <select
                id="base64-direction"
                value={direction()}
                onChange={(event) => {
                  setDirection(event.currentTarget.value === "decode" ? "decode" : "encode");
                  setOutput("");
                  setBytes(null);
                  setError(null);
                }}
                class="focus-ring mt-1 h-11 rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
              >
                <option value="encode">Encode</option>
                <option value="decode">Decode</option>
              </select>
            </div>
          </Show>

          <Show when={mode() === "file" || direction() === "encode"}>
            <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={urlSafe()}
                onChange={(event) => {
                  setUrlSafe(event.currentTarget.checked);
                  setOutput("");
                  setBytes(null);
                  setError(null);
                }}
                class="size-4 accent-[var(--color-accent)]"
              />
              URL-safe output
            </label>
          </Show>

          <p class={`${monoMeta} ml-auto`}>Up to 10 MB</p>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-2">
          <Show
            when={mode() === "text"}
            fallback={
              <div class="rounded-panel border border-line bg-surface-2/70 p-4">
                <label for="base64-file" class="block text-sm font-medium text-ink">
                  Local file
                </label>
                <input
                  id="base64-file"
                  ref={(element) => {
                    fileInput = element;
                  }}
                  type="file"
                  onChange={(event) => chooseFile(event.currentTarget.files?.[0] ?? null)}
                  class={`${inputBase} mt-2 file:mr-3 file:rounded-control file:border file:border-line file:bg-surface file:px-3 file:py-2 file:text-sm file:text-ink`}
                />
                <p class="mt-2 text-xs leading-relaxed text-muted">
                  {file()
                    ? `${file()!.name} (${formatBytes(file()!.size)})`
                    : "The file is read in this tab with the File API. It is never uploaded."}
                </p>
              </div>
            }
          >
            <ToolTextarea
              name="base64-input"
              label={inputLabel()}
              value={input()}
              onInput={onInput}
              placeholder={
                direction() === "encode"
                  ? "Type or paste text to encode"
                  : "Paste Base64 to decode, for example aGVsbG8="
              }
              rows={14}
              hint="Text is converted with UTF-8 before encoding."
            />
          </Show>

          <ToolTextarea
            name="base64-output"
            label={outputLabel()}
            value={output()}
            onInput={() => undefined}
            readonly
            rows={14}
            placeholder="The result appears here."
            hint="Read only. Copy or download the result."
          />
        </div>

        <ToolActions>
          <Show
            when={mode() === "text"}
            fallback={
              <Button
                variant="primary"
                onClick={() => void runFile()}
                disabled={!file()}
              >
                Encode file
              </Button>
            }
          >
            <Button
              variant="primary"
              onClick={runText}
              disabled={input().trim().length === 0}
            >
              {direction() === "encode" ? "Encode text" : "Decode Base64"}
            </Button>
          </Show>
          <CopyButton text={output()} label="Copy output" />
          <Button variant="quiet" onClick={download} disabled={bytes() === null}>
            Download
          </Button>
          <Show when={mode() === "text"}>
            <Button variant="quiet" onClick={loadSample}>
              Load sample
            </Button>
          </Show>
          <Button
            variant="quiet"
            onClick={clear}
            disabled={input().length === 0 && output().length === 0 && !file()}
          >
            Clear
          </Button>
        </ToolActions>
      </ToolPanel>

      <div class="mt-5 flex flex-col gap-4">
        <Show when={error()}>
          {(message) => <ErrorState title="Base64 error">{message()}</ErrorState>}
        </Show>

        <Show when={bytes() !== null}>
          <p role="status" class={monoMeta}>
            {formatBytes(bytes() ?? 0)}{" "}
            {mode() === "file" || direction() === "encode"
              ? "of bytes encoded"
              : "of bytes decoded"}
          </p>
        </Show>

        <Show when={bytes() === null && !error()}>
          <EmptyState title="Nothing encoded yet">
            {mode() === "file"
              ? "Choose a local file, then press Encode file. The bytes never leave this tab."
              : "Paste text or Base64 and press the button. The URL-safe option changes the alphabet used for output."}
          </EmptyState>
        </Show>
      </div>
    </>
  );
}
