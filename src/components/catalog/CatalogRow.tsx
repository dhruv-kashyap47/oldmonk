import type { ToolMeta } from "../../tools/types";
import { categoryColor, categoryInk } from "../../lib/category-style";
import { focusRing } from "../ui/styles";
import { CategoryMarker } from "./CategoryMarker";

export function CatalogRow(props: { tool: ToolMeta; index?: number }) {
  const delay = () => Math.min(props.index ?? 0, 8);

  return (
    <li
      class="reveal border-t border-line"
      style={`--i:${delay()};--cat-color:${categoryColor(props.tool.category)};--cat-ink:${categoryInk(props.tool.category)}`}
    >
      <a
        href={`/${props.tool.slug}`}
        class={`${focusRing} catalog-row group -mx-3 grid gap-1 rounded-control px-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-6`}
      >
        <span class="grid gap-0.5">
          <span class="catalog-name font-serif text-xl font-semibold text-ink">
            {props.tool.name}
          </span>
          <span class="text-[15px] leading-relaxed text-muted">{props.tool.summary}</span>
        </span>
        <span class="flex flex-wrap items-center gap-3">
          <CategoryMarker category={props.tool.category} />
        </span>
      </a>
    </li>
  );
}
