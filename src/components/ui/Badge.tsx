import type { JSX } from "@solidjs/web";

export function Badge(props: { children: JSX.Element; tone?: "neutral" | "accent" }) {
  return (
    <span
      class={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${
        props.tone === "accent"
          ? "bg-accent/10 text-accent"
          : "border border-line bg-surface text-muted"
      }`}
    >
      {props.children}
    </span>
  );
}
