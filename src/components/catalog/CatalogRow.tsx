import { formatIsoDate } from "../../lib/format";
import type { ToolMeta } from "../../tools/types";
import { monoMeta, focusRing } from "../ui/styles";
import { CategoryMarker } from "./CategoryMarker";

export function CatalogRow(props: { tool: ToolMeta }) {
  return (
    <li class="border-t border-line">
      <a
        href={`/${props.tool.slug}`}
        class={`${focusRing} group grid gap-1 rounded-control py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-6`}
      >
        <span class="grid gap-0.5">
          <span class="font-serif text-xl font-semibold text-ink group-hover:text-accent">
            {props.tool.name}
          </span>
          <span class="text-[15px] leading-relaxed text-muted">{props.tool.summary}</span>
        </span>
        <span class="flex flex-wrap items-center gap-3">
          <CategoryMarker category={props.tool.category} />
          <span class={monoMeta}>Updated {formatIsoDate(props.tool.updated)}</span>
        </span>
      </a>
    </li>
  );
}
