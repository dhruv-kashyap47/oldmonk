import { categories } from "../content/categories";
import { topics } from "../content/topics";
import { tools } from "../tools/registry";
import { site } from "./site";

export type RouteKind = "home" | "category" | "topic" | "tool" | "static";

export interface PageRoute {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly kind: RouteKind;
  readonly updated?: string;
}

export const homeRoute: PageRoute = {
  path: "/",
  title: site.defaultTitle,
  description: site.description,
  kind: "home",
};

export const categoryRoutes: readonly PageRoute[] = categories.map((category) => ({
  path: category.path,
  title: category.title,
  description: category.description,
  kind: "category",
}));

export const topicRoutes: readonly PageRoute[] = topics.map((topic) => ({
  path: topic.path,
  title: topic.title,
  description: topic.description,
  kind: "topic",
}));

export const toolRoutes: readonly PageRoute[] = tools.map((tool) => ({
  path: `/${tool.slug}`,
  title: tool.title,
  description: tool.description,
  kind: "tool",
  updated: tool.updated,
}));

export const staticRoutes: readonly PageRoute[] = [
  {
    path: "/about",
    title: "About oldmonk",
    description:
      "What oldmonk is, how every tool runs in your browser, how correctness is checked, and why the catalog stays small, curated, and useful instead of sprawling.",
    kind: "static",
  },
  {
    path: "/privacy",
    title: "Privacy policy",
    description:
      "How oldmonk handles tool input, local storage, analytics, and ads. The tools process data in your browser, and nothing you paste is uploaded to a server.",
    kind: "static",
  },
  {
    path: "/terms",
    title: "Terms of use",
    description:
      "The terms for using oldmonk: the free browser-only service, ownership of your output, practical limits, acceptable use, and the lack of a warranty.",
    kind: "static",
  },
  {
    path: "/contact",
    title: "Contact",
    description:
      "Report a bug, suggest a tool, or ask a privacy question. This page explains what to include in a report and why there is no contact form at all.",
    kind: "static",
  },
  {
    path: "/notices",
    title: "Notices",
    description:
      "Licenses and credits for oldmonk, including the Solid runtime, ui-sdk components, the Bitter display font, and the design references used here.",
    kind: "static",
  },
];

/** Indexable routes, in nav order. Used by the sitemap and the prerender. */
export const canonicalRoutes: readonly PageRoute[] = [
  homeRoute,
  ...categoryRoutes,
  ...topicRoutes,
  ...toolRoutes,
  ...staticRoutes,
];

export const toolPaths: ReadonlySet<string> = new Set(toolRoutes.map((route) => route.path));

export function findPageRoute(path: string): PageRoute | undefined {
  return canonicalRoutes.find((route) => route.path === path);
}
