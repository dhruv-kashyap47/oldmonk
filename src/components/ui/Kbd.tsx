import type { JSX } from "@solidjs/web";

export function Kbd(props: { children: JSX.Element }) {
  return (
    <kbd class="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted">
      {props.children}
    </kbd>
  );
}
