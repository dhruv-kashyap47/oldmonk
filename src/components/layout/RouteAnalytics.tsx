import { createTrackedEffect } from "solid-js";
import { useLocation } from "@solidjs/router";
import { pageview } from "../../analytics";

/** Sends a page_view on client navigation. The first render is skipped. */
export function RouteAnalytics() {
  const location = useLocation();
  let first = true;

  createTrackedEffect(() => {
    const path = location.pathname;
    if (first) {
      first = false;
      return;
    }
    pageview(path);
  });

  return null;
}
