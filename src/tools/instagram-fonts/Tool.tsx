import { For, Show, createMemo, createSignal } from "solid-js";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { CopyButton } from "../../components/ui/CopyButton";
import { Button } from "../../components/ui/Button";
import { EmptyState, ErrorState } from "../../components/tool/states";
import { monoMeta } from "../../components/ui/styles";
import {
  BIO_LIMIT,
  INSTAGRAM_STYLES,
  countBio,
  fieldAdvice,
  generateBioStyles,
  lineCount,
  trimToBioLimit,
} from "./logic";

const SAMPLE = "Ana Vieira\nCeramist\nLisbon";

export default function InstagramFontsTool() {
  const [input, setInput] = createSignal("");

  const count = createMemo(() => countBio(input()));
  const previews = createMemo(() => generateBioStyles(input().length > 0 ? input() : SAMPLE));
  const lines = createMemo(() => lineCount(input()));

  return (
    <ToolPanel label="Instagram fonts">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p class="text-sm text-muted">
          Type a bio, watch the counter, then copy a style into the bio field.
        </p>
        <span class={monoMeta}>{INSTAGRAM_STYLES.length} styles</span>
      </div>

      <div class="mt-4">
        <ToolTextarea
          name="instagram-bio-input"
          label="Your bio"
          value={input()}
          onInput={setInput}
          placeholder={"Ana Vieira\nCeramist\nLisbon"}
          rows={5}
          hint="Line breaks are kept in every style. The counter below measures the plain text."
        />
      </div>

      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p class={`text-sm ${count().over ? "font-medium text-danger" : "text-muted"}`}>
          <span class="font-mono text-xs tracking-[0.03em]">
            {count().used} / {BIO_LIMIT} characters
          </span>
          <span class="ml-3">{fieldAdvice(count())}</span>
        </p>
        <span class={monoMeta}>
          {lines() === 0 ? "No lines yet" : `${lines()} lines, breaks kept`}
        </span>
      </div>

      <ToolActions>
        <Show when={count().over}>
          <Button variant="secondary" onClick={() => setInput(trimToBioLimit(input()))}>
            Trim to {BIO_LIMIT}
          </Button>
        </Show>
        <Button variant="quiet" onClick={() => setInput("")} disabled={input().length === 0}>
          Clear
        </Button>
      </ToolActions>

      <Show when={count().over}>
        <div class="mt-4">
          <ErrorState title={`${count().used - BIO_LIMIT} characters over the bio limit`}>
            Instagram cuts a bio at 150 characters. Shorten the input, trim it with the
            button, or use the line as a caption instead.
          </ErrorState>
        </div>
      </Show>

      <Show when={input().trim().length === 0}>
        <div class="mt-4">
          <EmptyState title="Showing a sample bio">
            Type above to replace the three sample lines. Copy buttons stay off until the
            field has text.
          </EmptyState>
        </div>
      </Show>

      <ul aria-label="Bio style previews" class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <For each={previews()}>
          {(preview) => (
            <li class="flex min-w-0 flex-col rounded-control border border-line bg-surface-2/60 p-3">
              <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 class="text-sm font-medium text-ink">{preview.name}</h3>
                <span class={monoMeta}>{preview.characters} characters</span>
              </div>
              <p class="mt-2 min-w-0 whitespace-pre-wrap break-words font-serif text-lg leading-relaxed text-ink">
                {preview.text}
              </p>
              <div class="mt-2">
                <CopyButton
                  text={input().trim().length > 0 ? preview.text : ""}
                  label={`Copy ${preview.name.toLowerCase()}`}
                />
              </div>
            </li>
          )}
        </For>
      </ul>

      <p class="mt-5 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        Not affiliated with Instagram. The counter measures this input, and the app may
        count styled characters differently.
      </p>
    </ToolPanel>
  );
}
