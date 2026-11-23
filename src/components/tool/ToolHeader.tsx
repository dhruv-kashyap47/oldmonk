import { Show } from "solid-js";
import { getCategory } from "../../content/categories";
import { formatIsoDate } from "../../lib/format";
import type { ToolMeta } from "../../tools/types";
import { Badge } from "../ui/Badge";
import { focusRing, monoMeta } from "../ui/styles";

export function ToolHeader(props: { tool: ToolMeta }) {
  const category = () => getCategory(props.tool.category);

  return (
    <header class="mt-6">
      <div class="flex flex-wrap items-center gap-2">
        <Badge tone="accent">Runs in your browser</Badge>
        <Show when={category()}>
          {(info) => (
            <a href={info().path} class={`${focusRing} rounded-full`}>
              <Badge>{info().name}</Badge>
            </a>
          )}
        </Show>
        <span class={monoMeta}>Updated {formatIsoDate(props.tool.updated)}</span>
      </div>
      <h1 class="mt-5 font-serif text-[clamp(2.25rem,4.5vw,3.4rem)] leading-[1.04] font-semibold tracking-tight text-ink">
        {props.tool.name}
      </h1>
      <p class="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{props.tool.summary}</p>
    </header>
  );
}
