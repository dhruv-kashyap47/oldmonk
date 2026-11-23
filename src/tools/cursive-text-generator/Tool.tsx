import { For, Show, createMemo, createSignal } from "solid-js";
import { ToolActions, ToolPanel } from "../../components/tool/ToolPanel";
import { ToolTextarea } from "../../components/tool/ToolTextarea";
import { CopyButton } from "../../components/ui/CopyButton";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/tool/states";
import { inputBase, monoMeta } from "../../components/ui/styles";
import {
  CURSIVE_STYLES,
  CURSIVE_SUPPORT,
  generateAllCursive,
  signatureBlock,
} from "./logic";

const SAMPLE = "Ana Vieira";

export default function CursiveTextGeneratorTool() {
  const [input, setInput] = createSignal("");
  const [role, setRole] = createSignal("");
  const [signatureStyle, setSignatureStyle] = createSignal("script");

  const previews = createMemo(() => generateAllCursive(input().length > 0 ? input() : SAMPLE));
  const firstLine = createMemo(() => input().split("\n")[0] ?? "");
  const signature = createMemo(() =>
    signatureBlock(firstLine().trim().length > 0 ? firstLine() : SAMPLE, role(), signatureStyle()),
  );

  return (
    <>
      <ToolPanel label="Cursive text generator">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-sm text-muted">
            Set a name in a handwriting style, then copy it into a profile or a card.
          </p>
          <span class={monoMeta}>{CURSIVE_STYLES.length} cursive styles</span>
        </div>

        <div class="mt-4">
          <ToolTextarea
            name="cursive-text-input"
            label="Name or text"
            value={input()}
            onInput={setInput}
            placeholder="Type a name or a short line"
            rows={4}
            hint="Digits, emoji, and characters without a cursive form stay exactly as typed."
          />
        </div>

        <ToolActions>
          <Button variant="quiet" onClick={() => setInput("")} disabled={input().length === 0}>
            Clear
          </Button>
        </ToolActions>

        <Show when={input().trim().length === 0}>
          <div class="mt-4">
            <EmptyState title={`Showing the sample "${SAMPLE}"`}>
              Type a name above to replace the sample. The support table below explains
              which characters have a cursive glyph.
            </EmptyState>
          </div>
        </Show>

        <ul aria-label="Cursive previews" class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <For each={previews()}>
            {(preview) => (
              <li class="flex min-w-0 flex-col rounded-control border border-line bg-surface-2/60 p-3">
                <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 class="text-sm font-medium text-ink">{preview.name}</h3>
                  <span class="text-xs text-muted">{preview.blurb}</span>
                </div>
                <p class="mt-2 min-w-0 break-words font-serif text-xl leading-relaxed text-ink">
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

        <div class="mt-6">
          <h3 class="font-serif text-xl font-semibold text-ink">Signature block</h3>
          <p class="mt-1 text-sm leading-relaxed text-muted">
            The name uses the chosen script. The role stays in plain letters so it keeps
            working when a font has no cursive glyphs.
          </p>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label for="cursive-role" class="block text-xs text-muted">
                Role or tagline (optional)
              </label>
              <input
                id="cursive-role"
                type="text"
                value={role()}
                onInput={(event) => setRole(event.currentTarget.value)}
                placeholder="Ceramist, Lisbon"
                class={`${inputBase} mt-1`}
              />
            </div>
            <div>
              <label for="cursive-signature-style" class="block text-xs text-muted">
                Signature style
              </label>
              <select
                id="cursive-signature-style"
                value={signatureStyle()}
                onChange={(event) => setSignatureStyle(event.currentTarget.value)}
                class="focus-ring mt-1 h-11 w-full rounded-control border border-line bg-surface-2 px-3 text-sm text-ink"
              >
                <For each={CURSIVE_STYLES}>
                  {(entry) => <option value={entry.id}>{entry.name}</option>}
                </For>
              </select>
            </div>
          </div>
          <div class="mt-3 rounded-control border border-line bg-surface-2/60 p-3">
            <p class="whitespace-pre-wrap break-words font-serif text-xl leading-relaxed text-ink">
              {signature()}
            </p>
            <div class="mt-2">
              <CopyButton
                text={input().trim().length > 0 ? signature() : ""}
                label="Copy signature block"
              />
            </div>
          </div>
        </div>
      </ToolPanel>

      <div class="mt-6">
        <h2 class="font-serif text-2xl font-semibold text-ink">What each style covers</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          These styles have no digit forms, so numbers stay plain. The uppercase column
          names the letters that live outside the main mathematical block.
        </p>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full min-w-[42rem] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-line">
                <th scope="col" class="py-2 pr-4 font-medium text-ink">Style</th>
                <th scope="col" class="py-2 pr-4 font-medium text-ink">Uppercase</th>
                <th scope="col" class="py-2 pr-4 font-medium text-ink">Lowercase</th>
                <th scope="col" class="py-2 pr-4 font-medium text-ink">Digits</th>
                <th scope="col" class="py-2 font-medium text-ink">Missing glyph</th>
              </tr>
            </thead>
            <tbody>
              <For each={CURSIVE_SUPPORT}>
                {(row) => (
                  <tr class="border-b border-line align-top text-muted">
                    <th scope="row" class="py-2 pr-4 font-medium text-ink">{row.name}</th>
                    <td class="py-2 pr-4">{row.uppercase}</td>
                    <td class="py-2 pr-4">{row.lowercase}</td>
                    <td class="py-2 pr-4">{row.digits}</td>
                    <td class="py-2">{row.missingGlyph}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
