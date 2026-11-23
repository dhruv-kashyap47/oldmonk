export interface TopicInfo {
  readonly slug: string;
  readonly path: `/${string}`;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly intro: string;
  readonly category: "developer" | "text" | "random" | "timer" | "test";
  readonly order: number;
}

export const topics: readonly TopicInfo[] = [
  {
    slug: "json",
    path: "/json-tools",
    name: "JSON tools",
    title: "JSON tools: format, validate, and minify",
    description:
      "Format, validate, and minify JSON in your browser. Each tool reports the exact problem and keeps your data on your own machine.",
    intro:
      "Three focused tools for the same format: pretty-print it, check it before a deploy, or shrink it for transport.",
    category: "developer",
    order: 1,
  },
];

export function getTopic(pathOrSlug: string): TopicInfo | undefined {
  return topics.find((topic) => topic.path === pathOrSlug || topic.slug === pathOrSlug);
}
