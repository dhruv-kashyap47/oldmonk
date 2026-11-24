import type { JSX } from "@solidjs/web";

export function ToolPanel(props: { children: JSX.Element; class?: string; label?: string }) {
  return (
    <section
      aria-label={props.label}
      class={`tool-panel panel-in rounded-panel border border-line bg-surface p-4 sm:p-6 ${props.class ?? ""}`}
    >
      {props.children}
    </section>
  );
}

export function ToolActions(props: { children: JSX.Element }) {
  return <div class="mt-4 flex flex-wrap items-center gap-2">{props.children}</div>;
}
