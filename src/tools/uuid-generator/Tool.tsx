import { Show, createSignal } from "solid-js";
import { track } from "../../analytics";
import { downloadText } from "../../lib/download";
import { formatCount } from "../../lib/format";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { CopyButton } from "../../components/ui/CopyButton";
import { Button } from "../../components/ui/Button";
import { ErrorState, EmptyState } from "../../components/tool/states";
import { monoMeta } from "../../components/ui/styles";
import { formatUuid, generateUuids, UUID_MAX_COUNT, UUID_MIN_COUNT, type UuidVersion } from "./logic";

export default function UuidGeneratorTool() {
  const [countText, setCountText] = createSignal("10");
  const [version, setVersion] = createSignal<UuidVersion>(4);
  const [uppercase, setUppercase] = createSignal(false);
  const [hyphens, setHyphens] = createSignal(true);
  const [raw, setRaw] = createSignal<readonly string[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  const [announcement, setAnnouncement] = createSignal("");
  let sentFirstInput = false;

  function onCountInput(value: string) {
    setCountText(value);
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "uuid-generator" });
    }
  }

  function generate() {
    const result = generateUuids(version(), Number(countText()));
    if (!result.ok) {
      setRaw([]);
      setError(result.error);
      setAnnouncement("");
      return;
    }
    setRaw(result.uuids);
    setError(null);
    setAnnouncement(`${formatCount(result.uuids.length, "UUID")} generated.`);
    track("tool_complete", { slug: "uuid-generator" });
  }

  const output = () =>
    raw()
      .map((uuid) => formatUuid(uuid, { uppercase: uppercase(), hyphens: hyphens() }))
      .join("\n");

  function download() {
    downloadText(`uuids-v${version()}.txt`, output(), "text/plain");
  }

  function clear() {
    setRaw([]);
    setError(null);
    setAnnouncement("");
  }

  return (
    <>
      <ToolPanel label="UUID generator">
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label for="uuid-count" class="block text-xs text-muted">
              How many
            </label>
            <input
              id="uuid-count"
              type="number"
              min={UUID_MIN_COUNT}
              max={UUID_MAX_COUNT}
              step={1}
              value={countText()}
              onInput={(event) => onCountInput(event.currentTarget.value)}
              class="focus-ring mt-1 h-11 w-28 rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
            />
          </div>
          <div>
            <label for="uuid-version" class="block text-xs text-muted">
              Version
            </label>
            <select
              id="uuid-version"
              value={String(version())}
              onChange={(event) => {
                const next = Number(event.currentTarget.value);
                if (next === 4 || next === 7) setVersion(next);
              }}
              class="focus-ring mt-1 h-11 rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
            >
              <option value="4">Version 4, random</option>
              <option value="7">Version 7, time ordered</option>
            </select>
          </div>
          <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={uppercase()}
              onChange={(event) => setUppercase(event.currentTarget.checked)}
              class="size-4 accent-[var(--color-accent)]"
            />
            Uppercase
          </label>
          <label class="flex min-h-11 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={hyphens()}
              onChange={(event) => setHyphens(event.currentTarget.checked)}
              class="size-4 accent-[var(--color-accent)]"
            />
            Hyphens
          </label>
        </div>
        <p class={`mt-3 ${monoMeta}`}>
          {formatCount(UUID_MIN_COUNT, "UUID")} to {UUID_MAX_COUNT.toLocaleString("en")} per run
        </p>

        <ToolActions>
          <Button variant="primary" onClick={generate}>
            Generate UUIDs
          </Button>
          <CopyButton text={output()} label="Copy all" />
          <Button variant="quiet" onClick={download} disabled={raw().length === 0}>
            Download
          </Button>
          <Button variant="quiet" onClick={clear} disabled={raw().length === 0 && !error()}>
            Clear
          </Button>
          <p role="status" aria-live="polite" class={monoMeta}>
            {announcement()}
          </p>
        </ToolActions>

        <Show when={error()}>
          {(message) => (
            <div class="mt-5">
              <ErrorState title="Check the count">{message()}</ErrorState>
            </div>
          )}
        </Show>

        <div class="mt-5">
          <ToolTextarea
            name="uuid-output"
            label="Generated UUIDs"
            value={output()}
            onInput={() => undefined}
            readonly
            rows={16}
            placeholder="Press Generate UUIDs to fill this list."
            hint="One value per line. Changing case or hyphens reformats the current list."
          />
        </div>

        <Show when={raw().length === 0 && !error()}>
          <div class="mt-5">
            <EmptyState title="No UUIDs yet">
              Choose a version and a count, then press Generate UUIDs. The values use the browser
              cryptographic random source.
            </EmptyState>
          </div>
        </Show>
      </ToolPanel>
    </>
  );
}
