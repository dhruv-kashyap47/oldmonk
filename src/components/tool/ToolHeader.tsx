import { Show } from "solid-js";
import { getCategory } from "../../content/categories";
import { formatIsoDate } from "../../lib/format";
import { categoryColor } from "../../lib/category-style";
import type { ToolMeta } from "../../tools/types";
import { CategoryMarker } from "../catalog/CategoryMarker";
import { focusRing, monoMeta } from "../ui/styles";

export function ToolHeader(props: { tool: ToolMeta }) {
  const category = () => getCategory(props.tool.category);

  return (
    <header class="mt-6">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Show when={category()}>
          {(info) => (
            <a href={info().path} class={`${focusRing} rounded-full`}>
              <CategoryMarker category={props.tool.category} />
            </a>
          )}
        </Show>
        <span class="inline-flex items-center gap-1.5 text-[13px] text-muted">
          <svg
            viewBox="0 0 24 24"
            class="size-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          Runs in your browser
        </span>
        <span class={monoMeta}>Updated {formatIsoDate(props.tool.updated)}</span>
      </div>
      <h1 class="mt-5 font-serif text-[clamp(2.25rem,4.5vw,3.4rem)] leading-[1.04] font-semibold tracking-tight text-ink">
        {props.tool.name}
      </h1>
      <div
        class="mt-5 h-0.5 w-12"
        style={`background-color:${categoryColor(props.tool.category)}`}
        aria-hidden="true"
      />
      <p class="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{props.tool.summary}</p>
    </header>
  );
}
