export interface HtmlFacts {
  readonly title: string | null;
  readonly titleCount: number;
  readonly description: string | null;
  readonly canonical: string | null;
  readonly h1Count: number;
  readonly jsonLd: readonly unknown[];
  readonly jsonLdErrors: readonly string[];
  readonly links: readonly string[];
  readonly text: string;
}

function attribute(tag: string, name: string): string | null {
  const match = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag);
  return match ? match[1] : null;
}

export function stripScriptsAndStyles(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
}

/** Visible text only: scripts, styles, and tags removed, entities decoded. */
export function textContent(html: string): string {
  return decodeEntities(
    stripScriptsAndStyles(html)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function inspectHtml(html: string): HtmlFacts {
  const titleMatches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const descriptionTag = metaTags.find(
    (tag) => attribute(tag, "name")?.toLowerCase() === "description",
  );
  const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  const canonicalTag = linkTags.find(
    (tag) => attribute(tag, "rel")?.toLowerCase() === "canonical",
  );

  const jsonLd: unknown[] = [];
  const jsonLdErrors: string[] = [];
  for (const match of html.matchAll(
    /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      jsonLd.push(JSON.parse(match[1] ?? ""));
    } catch (error) {
      jsonLdErrors.push(error instanceof Error ? error.message : "Invalid JSON");
    }
  }

  const links = [...html.matchAll(/<a\b[^>]*href="([^"]*)"/gi)].map((match) => match[1] ?? "");

  return {
    title: titleMatches[0]?.[1]?.trim() ?? null,
    titleCount: titleMatches.length,
    description: descriptionTag ? attribute(descriptionTag, "content") : null,
    canonical: canonicalTag ? attribute(canonicalTag, "href") : null,
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    jsonLd,
    jsonLdErrors,
    links,
    text: textContent(html),
  };
}

export function decodeEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

/** Pretty-URL file for a canonical path. */
export function routeFile(path: string): string {
  if (path === "/") return "index.html";
  return `${path.replace(/^\//, "")}.html`;
}
