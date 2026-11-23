export const focusRing = "focus-ring";

export const buttonBase =
  "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

export const primaryButton = `${buttonBase} bg-accent text-paper hover:bg-accent-hover`;

export const secondaryButton = `${buttonBase} border border-line bg-surface text-ink hover:border-accent`;

export const quietButton = `${buttonBase} text-muted hover:bg-surface-2 hover:text-ink`;

export const inputBase =
  "focus-ring w-full rounded-control border border-line bg-surface-2 px-3 py-2.5 text-[15px] text-ink placeholder:text-muted/70";

export const monoMeta = "font-mono text-xs tracking-[0.03em] text-muted";
