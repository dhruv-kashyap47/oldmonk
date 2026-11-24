import { getCategory } from "../../content/categories";
import type { ToolCategory } from "../../tools/types";

export function CategoryMarker(props: { category: ToolCategory }) {
  const label = () => getCategory(props.category)?.name.replace(" tools", "") ?? props.category;

  return (
    <span
      data-category={props.category}
      class="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs leading-5 tracking-[0.03em]"
    >
      {label()}
    </span>
  );
}
