import { For, Show, createSignal } from "solid-js";
import { track } from "../../analytics";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { CopyButton } from "../../components/ui/CopyButton";
import { Button } from "../../components/ui/Button";
import { ErrorState, EmptyState, ResultCard } from "../../components/tool/states";
import { inputBase, monoMeta } from "../../components/ui/styles";
import {
  describeTimestamp,
  formatZone,
  parseTimestamp,
  TIME_ZONE_OPTIONS,
  type TimestampParseResult,
  type TimestampUnitChoice,
} from "./logic";

type Parsed = Extract<TimestampParseResult, { ok: true }>;

function ResultRow(props: { label: string; value: string }) {
  return (
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
      <div class="min-w-0">
        <p class="text-xs text-muted">{props.label}</p>
        <p class="mt-0.5 break-all font-mono text-[13px] text-ink">{props.value}</p>
      </div>
      <CopyButton text={props.value} label="Copy" />
    </div>
  );
}

export default function TimestampConverterTool() {
  const [input, setInput] = createSignal("");
  const [choice, setChoice] = createSignal<TimestampUnitChoice>("auto");
  const [selectedZone, setSelectedZone] = createSignal("");
  const [parsed, setParsed] = createSignal<Parsed | null>(null);
  const [error, setError] = createSignal<{ title: string; message: string } | null>(null);
  const [announcement, setAnnouncement] = createSignal("");
  const [nowMs, setNowMs] = createSignal(Date.now());
  let sentFirstInput = false;

  function onInput(value: string) {
    setInput(value);
    setParsed(null);
    setError(null);
    setAnnouncement("");
    if (!sentFirstInput && value.length > 0) {
      sentFirstInput = true;
      track("tool_first_input", { slug: "timestamp-converter" });
    }
  }

  function convert(nextInput = input(), nextChoice = choice()) {
    const result = parseTimestamp(nextInput, nextChoice);
    setNowMs(Date.now());
    if (result.ok) {
      setParsed(result);
      setError(null);
      setAnnouncement(
        result.unit === "iso"
          ? "Converted the ISO date."
          : `Converted ${result.unit === "seconds" ? "Unix seconds" : "Unix milliseconds"}.`,
      );
      track("tool_complete", { slug: "timestamp-converter" });
    } else {
      setParsed(null);
      setError(result.error);
      setAnnouncement("");
    }
  }

  function useNow() {
    const seconds = Math.floor(Date.now() / 1000);
    const text = String(seconds);
    setInput(text);
    setChoice("auto");
    convert(text, "auto");
  }

  function clear() {
    setInput("");
    setParsed(null);
    setError(null);
    setAnnouncement("");
  }

  const description = () => {
    const current = parsed();
    return current ? describeTimestamp(current.ms, nowMs()) : null;
  };

  const zoneLabel = () =>
    selectedZone() === ""
      ? "Local time"
      : (TIME_ZONE_OPTIONS.find((zone) => zone.id === selectedZone())?.label ?? selectedZone());

  const zoneTime = () => {
    const current = parsed();
    if (!current) return "";
    return selectedZone() === ""
      ? formatZone(current.ms)
      : formatZone(current.ms, selectedZone());
  };

  return (
    <>
      <ToolPanel label="Timestamp converter">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="sm:col-span-2 lg:col-span-1">
            <label for="timestamp-input" class="block text-sm font-medium text-ink">
              Timestamp or date
            </label>
            <input
              id="timestamp-input"
              type="text"
              value={input()}
              onInput={(event) => onInput(event.currentTarget.value)}
              class={`${inputBase} mt-1 font-mono text-[13px]`}
              placeholder="1763000000"
              autocomplete="off"
              spellcheck={false}
            />
            <p class="mt-2 text-xs leading-relaxed text-muted">
              Unix seconds, Unix milliseconds, or an ISO 8601 value such as{" "}
              <code>2026-11-23T12:00:00Z</code>.
            </p>
          </div>
          <div>
            <label for="timestamp-unit" class="block text-sm font-medium text-ink">
              Input unit
            </label>
            <select
              id="timestamp-unit"
              value={choice()}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setChoice(value === "seconds" || value === "milliseconds" ? value : "auto");
                setParsed(null);
                setError(null);
                setAnnouncement("");
              }}
              class="focus-ring mt-1 h-11 w-full rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
            >
              <option value="auto">Detect automatically</option>
              <option value="seconds">Seconds</option>
              <option value="milliseconds">Milliseconds</option>
            </select>
          </div>
          <div>
            <label for="timestamp-zone" class="block text-sm font-medium text-ink">
              Display zone
            </label>
            <select
              id="timestamp-zone"
              value={selectedZone()}
              onChange={(event) => setSelectedZone(event.currentTarget.value)}
              class="focus-ring mt-1 h-11 w-full rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
            >
              <option value="">Local time (this device)</option>
              <For each={TIME_ZONE_OPTIONS}>
                {(zone) => <option value={zone.id}>{zone.label}</option>}
              </For>
            </select>
          </div>
        </div>

        <ToolActions>
          <Button variant="primary" onClick={() => convert()} disabled={input().trim().length === 0}>
            Convert
          </Button>
          <Button variant="secondary" onClick={useNow}>
            Use now
          </Button>
          <Button
            variant="quiet"
            onClick={clear}
            disabled={input().length === 0 && !parsed() && !error()}
          >
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

        <Show when={description()}>
          {(current) => (
            <div class="mt-6">
              <ResultCard label={`Selected zone: ${zoneLabel()}`} value={zoneTime()}>
                <CopyButton text={zoneTime()} label="Copy zone time" />
              </ResultCard>

              <div class="mt-4 border-t border-line">
                <ResultRow label="ISO 8601 (UTC)" value={current().iso} />
                <ResultRow label="Unix seconds" value={current().seconds} />
                <ResultRow label="Unix milliseconds" value={current().milliseconds} />
                <ResultRow label="UTC" value={current().utc} />
                <ResultRow label="Local time (this device)" value={current().local} />
                <ResultRow label="Relative to now" value={current().relative} />
              </div>
            </div>
          )}
        </Show>

        <Show when={!parsed() && !error()}>
          <div class="mt-5">
            <EmptyState title="Nothing converted yet">
              Enter a Unix timestamp or an ISO 8601 date, choose a zone, and press Convert. The
              result updates the selected zone without recalculating the timestamp.
            </EmptyState>
          </div>
        </Show>
      </ToolPanel>
    </>
  );
}
