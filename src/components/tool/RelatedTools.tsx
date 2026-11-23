import { For } from "solid-js";
import { getCategory } from "../../content/categories";
import { resolveRelated } from "../../tools/registry";
import type { ToolMeta } from "../../tools/types";
import { focusRing, monoMeta } from "../ui/styles";

export function RelatedTools(props: { tool: ToolMeta }) {
  const related = () => resolveRelated(props.tool);
  if (related().length === 0) return null;

  return (
    <section aria-labelledby="related-tools" class="mt-16">
      <h2 id="related-tools" class="font-serif text-2xl font-semibold text-ink">
        Related tools
      </h2>
      <ul class="mt-6">
        <For each={related()}>
          {(tool) => (
            <li class="border-t border-line">
              <a
                href={`/${tool.slug}`}
                class={`${focusRing} group grid gap-1 rounded-control py-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6`}
              >
                <span class="font-serif text-lg font-semibold text-ink group-hover:text-accent">
                  {tool.name}
                </span>
                <span class="text-sm leading-relaxed text-muted">{tool.summary}</span>
                <span class={monoMeta}>{getCategoryLabel(tool)}</span>
              </a>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}

function getCategoryLabel(tool: ToolMeta): string {
  return getCategory(tool.category)?.name ?? tool.category;
}
