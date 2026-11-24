import type { JSX } from "@solidjs/web";

export function EmptyState(props: { title: string; children?: JSX.Element }) {
  return (
    <div class="rounded-panel border border-line bg-surface p-6">
      <p class="text-sm font-medium text-ink">{props.title}</p>
      <div class="mt-1 text-sm leading-relaxed text-muted">{props.children}</div>
    </div>
  );
}

export function ErrorState(props: { title: string; children?: JSX.Element }) {
  return (
    <div role="alert" class="rounded-panel border border-danger/40 bg-danger/5 p-4">
      <p class="text-sm font-medium text-danger">{props.title}</p>
      <div class="mt-1 text-sm leading-relaxed text-ink">{props.children}</div>
    </div>
  );
}

export function LoadingState(props: { label?: string }) {
  return (
    <div role="status" class="rounded-panel border border-line bg-surface p-6 text-sm text-muted">
      {props.label ?? "Loading the tool"}
    </div>
  );
}

export function ResultCard(props: { label: string; value: JSX.Element; children?: JSX.Element }) {
  return (
    <div class="rounded-panel border border-line bg-surface-2/70 p-4">
      <p class="font-mono text-xs tracking-[0.03em] text-muted">{props.label}</p>
      <div class="mt-1 font-serif text-2xl font-semibold text-ink">{props.value}</div>
      {props.children ? <div class="mt-2 text-sm text-muted">{props.children}</div> : null}
    </div>
  );
}
