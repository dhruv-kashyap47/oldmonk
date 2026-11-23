import { For, Show, createMemo, createSignal } from "solid-js";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { CopyButton } from "../../components/ui/CopyButton";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/tool/states";
import { monoMeta } from "../../components/ui/styles";
import {
  FANCY_STYLES,
  PREVIEW_SAMPLE,
  formatAllStyles,
  generateAll,
  passthroughCharacters,
} from "./logic";

export default function FancyTextGeneratorTool() {
  const [input, setInput] = createSignal("");

  const previews = createMemo(() => generateAll(input().length > 0 ? input() : PREVIEW_SAMPLE));
  const copyAllText = createMemo(() =>
    input().length > 0 ? formatAllStyles(previews()) : "",
  );
  const plainCharacters = createMemo(() => passthroughCharacters(previews()));

  return (
    <ToolPanel label="Fancy text generator">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p class="text-sm text-muted">
          The previews update as you type. Copy one style, or copy the labelled set.
        </p>
        <span class={monoMeta}>{FANCY_STYLES.length} styles</span>
      </div>

      <div class="mt-4">
        <ToolTextarea
          name="fancy-text-input"
          label="Your text"
          value={input()}
          onInput={setInput}
          placeholder="Type a name, a caption, or a short line"
          rows={4}
          hint="Spaces, punctuation, emoji, and characters without a styled form are kept as typed."
        />
      </div>

      <ToolActions>
        <CopyButton text={copyAllText()} label="Copy all styles" />
        <Button
          variant="quiet"
          onClick={() => setInput("")}
          disabled={input().length === 0}
        >
          Clear
        </Button>
      </ToolActions>

      <Show when={input().trim().length === 0}>
        <div class="mt-4">
          <EmptyState title={`Showing the sample "${PREVIEW_SAMPLE}"`}>
            Type in the field above to replace the sample. Copy buttons stay off until
            there is real text.
          </EmptyState>
        </div>
      </Show>

      <ul aria-label="Style previews" class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <For each={previews()}>
          {(preview) => (
            <li class="flex min-w-0 flex-col rounded-control border border-line bg-surface-2/60 p-3">
              <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 class="text-sm font-medium text-ink">{preview.name}</h3>
                <span class="text-xs text-muted">{preview.blurb}</span>
              </div>
              <p class="mt-2 min-w-0 break-words font-serif text-lg leading-relaxed text-ink">
                {preview.text}
              </p>
              <div class="mt-2 flex flex-wrap items-center justify-end gap-2">
                <CopyButton
                  text={input().trim().length > 0 ? preview.text : ""}
                  label={`Copy ${preview.name.toLowerCase()}`}
                />
              </div>
            </li>
          )}
        </For>
      </ul>

      <Show when={input().trim().length > 0 && plainCharacters().length > 0}>
        <p class="mt-4 text-xs leading-relaxed text-muted">
          These characters have no styled form and stay plain:{" "}
          <span class="font-mono">{plainCharacters().join(" ")}</span>
        </p>
      </Show>
    </ToolPanel>
  );
}
