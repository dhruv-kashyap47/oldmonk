export const site = {
  name: "oldmonk",
  url: "https://oldmonk.dev",
  titleSuffix: " | oldmonk",
  defaultTitle: "oldmonk: useful tools, instantly",
  description:
    "Fast, private browser tools for code, text, random picks, timers, and quick tests. Every tool runs locally, opens without signup, and keeps your input.",
  locale: "en",
  twitterCard: "summary_large_image",
  contactEmail: "hello@oldmonk.dev",
} as const;

export function absoluteUrl(path: string): string {
  if (path === "/") return site.url;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function titleWithSuffix(title: string): string {
  return title.endsWith(site.titleSuffix) ? title : `${title}${site.titleSuffix}`;
}
