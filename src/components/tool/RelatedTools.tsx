import { For } from "solid-js";
import { categoryColor } from "../../lib/category-style";
import { resolveRelated } from "../../tools/registry";
import type { ToolMeta } from "../../tools/types";
import { CategoryMarker } from "../catalog/CategoryMarker";
import { focusRing } from "../ui/styles";

export function RelatedTools(props: { tool: ToolMeta }) {
  const related = () => resolveRelated(props.tool);
  if (related().length === 0) return null;

  return (
    <section aria-labelledby="related-tools" class="mt-16">
      <h2 id="related-tools" class="font-serif text-2xl font-semibold text-ink">
        Related tools
      </h2>
      <ul class="mt-4">
        <For each={related()}>
          {(tool) => (
            <li
              class="border-t border-line"
              style={`--cat-color:${categoryColor(tool.category)}`}
            >
              <a
                href={`/${tool.slug}`}
                class={`${focusRing} catalog-row group -mx-3 grid gap-1 rounded-control px-3 py-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6`}
              >
                <span class="catalog-name font-serif text-lg font-semibold text-ink">
                  {tool.name}
                </span>
                <span class="text-sm leading-relaxed text-muted">{tool.summary}</span>
                <CategoryMarker category={tool.category} />
              </a>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}
