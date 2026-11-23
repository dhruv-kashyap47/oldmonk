import type { SpecItem } from "../../tools/types";

export function SpecGrid(props: { items: readonly SpecItem[] }) {
  return (
    <dl data-spec-grid class="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2">
      {props.items.map((item) => (
        <div>
          <dt class="text-[13px] leading-snug text-muted">{item.label}</dt>
          <dd class="mt-1 text-[15px] leading-relaxed text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
