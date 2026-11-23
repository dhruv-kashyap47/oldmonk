import { For } from "solid-js";
import type { BreadcrumbItemSchema } from "../../seo/schema";
import { focusRing } from "../ui/styles";

export function Breadcrumbs(props: { items: readonly BreadcrumbItemSchema[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs tracking-[0.03em] text-muted">
        <For each={props.items}>
          {(item, index) => {
            const isLast = () => index() === props.items.length - 1;
            return (
              <li class="flex items-center gap-2">
                {index() > 0 ? <span aria-hidden="true">/</span> : null}
                {isLast() ? (
                  <span aria-current="page">{item.name}</span>
                ) : (
                  <a href={item.path} class={`${focusRing} underline-offset-4 hover:text-ink hover:underline`}>
                    {item.name}
                  </a>
                )}
              </li>
            );
          }}
        </For>
      </ol>
    </nav>
  );
}
