export type AnalyticsEvent =
  | "page_view"
  | "tool_view"
  | "tool_first_input"
  | "tool_complete"
  | "copy_result"
  | "share_result"
  | "related_click"
  | "search_open"
  | "search_select"
  | "test_start"
  | "test_complete";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsProps; u?: string }) => void;
  }
}

/**
 * Plausible adapter. Nothing loads unless VITE_PLAUSIBLE_DOMAIN is set in the
 * build. Event props are typed and never include tool input, query text, or
 * clipboard contents.
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  window.plausible?.(event, props ? { props } : undefined);
}

export function pageview(path: string): void {
  if (typeof window === "undefined") return;
  window.plausible?.("page_view", { u: path });
}
