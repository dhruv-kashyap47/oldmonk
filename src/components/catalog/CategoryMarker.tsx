import { getCategory } from "../../content/categories";
import type { ToolCategory } from "../../tools/types";

const markerStyles: Record<ToolCategory, { dot: string; chip: string }> = {
  developer: { dot: "bg-cat-dev", chip: "bg-[var(--cat-dev-tint)]" },
  text: { dot: "bg-cat-text", chip: "bg-[var(--cat-text-tint)]" },
  random: { dot: "bg-cat-random", chip: "bg-[var(--cat-random-tint)]" },
  timer: { dot: "bg-cat-timer", chip: "bg-[var(--cat-timer-tint)]" },
  test: { dot: "bg-cat-test", chip: "bg-[var(--cat-test-tint)]" },
};

export function CategoryMarker(props: { category: ToolCategory }) {
  const styles = () => markerStyles[props.category];
  const label = () => getCategory(props.category)?.name.replace(" tools", "") ?? props.category;

  return (
    <span class={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ${styles().chip}`}>
      <span class={`size-1.5 rounded-full ${styles().dot}`} aria-hidden="true" />
      <span class="text-xs text-muted">{label()}</span>
    </span>
  );
}
