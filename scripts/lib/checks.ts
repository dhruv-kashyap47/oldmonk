import { readdir, readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { inspectHtml, stripScriptsAndStyles, type HtmlFacts } from "./html";

export interface PageCheck {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
}

export interface Issue {
  readonly path: string;
  readonly message: string;
}

const FORBIDDEN = ["[object Object]", "TODO", "FIXME", "NaN", "undefined"];

export function checkHtml(path: string, html: string, expected: PageCheck): Issue[] {
  const facts: HtmlFacts = inspectHtml(html);
  const issues: Issue[] = [];
  const push = (message: string) => issues.push({ path, message });

  if (facts.titleCount !== 1) push(`Expected one title, found ${facts.titleCount}.`);
  if (facts.title !== expected.title) {
    push(`Title "${facts.title ?? ""}" does not match "${expected.title}".`);
  }
  if (!facts.description) push("Missing meta description.");
  else {
    if (facts.description.length < 120 || facts.description.length > 165) {
      push(`Description is ${facts.description.length} characters, outside 120 to 165.`);
    }
    if (facts.description !== expected.description) push("Description does not match the route manifest.");
  }
  if (facts.canonical !== expected.canonical) {
    push(`Canonical "${facts.canonical ?? ""}" does not match "${expected.canonical}".`);
  }
  if (facts.h1Count !== 1) push(`Expected one h1, found ${facts.h1Count}.`);
  if (facts.jsonLdErrors.length > 0) push(`Invalid JSON-LD: ${facts.jsonLdErrors.join("; ")}`);
  if (facts.jsonLd.length === 0) push("No JSON-LD found.");

  for (const token of FORBIDDEN) {
    if (facts.text.includes(token)) push(`Rendered text contains "${token}".`);
  }

  return issues;
}

export async function existingFiles(root: string): Promise<Set<string>> {
  const found = new Set<string>();
  async function walk(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name);
      if (entry.isDirectory()) await walk(full);
      else found.add(full.slice(root.length).replaceAll("\\", "/"));
    }
  }
  await walk(root);
  return found;
}

export async function checkLinks(htmlFiles: readonly string[], clientRoot: string): Promise<Issue[]> {
  const files = await existingFiles(clientRoot);
  const issues: Issue[] = [];

  for (const file of htmlFiles) {
    const html = await readFile(join(clientRoot, file), "utf8");
    for (const href of inspectHtml(html).links) {
      if (
        href.length === 0 ||
        href.startsWith("#") ||
        href.startsWith("http:") ||
        href.startsWith("https:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("data:")
      ) {
        continue;
      }
      const path = href.split("#")[0]?.split("?")[0] ?? "";
      if (path.length === 0) continue;
      const candidates =
        path === "/"
          ? ["/index.html"]
          : [path, `${path}.html`, `${path}/index.html`];
      if (!candidates.some((candidate) => files.has(candidate))) {
        issues.push({ path: file, message: `Broken internal link: ${href}` });
      }
    }
  }

  return issues;
}

export interface ChunkSize {
  readonly file: string;
  readonly bytes: number;
  readonly gzip: number;
}

export async function chunkSizes(clientRoot: string): Promise<ChunkSize[]> {
  const assets = join(clientRoot, "assets");
  const entries = await readdir(assets);
  const sizes: ChunkSize[] = [];
  for (const file of entries) {
    if (!file.endsWith(".js") && !file.endsWith(".css")) continue;
    const buffer = await readFile(join(assets, file));
    sizes.push({ file, bytes: buffer.byteLength, gzip: gzipSync(buffer).byteLength });
  }
  return sizes.sort((a, b) => b.gzip - a.gzip);
}

/**
 * Static imports reachable from the client entry, summed by gzip size. Lazy
 * route chunks are excluded, which is what the initial-JS budget measures.
 */
export async function initialGzip(clientRoot: string): Promise<number> {
  const assets = join(clientRoot, "assets");
  const entries = await readdir(assets);
  const entry = entries.find(
    (file) => file.includes("virtual_solid-ssr-entry-client") && file.endsWith(".js"),
  );
  if (!entry) throw new Error("Client entry not found in dist/client/assets.");

  const seen = new Set<string>();
  let total = 0;

  async function visit(file: string): Promise<void> {
    if (seen.has(file)) return;
    seen.add(file);
    const full = join(assets, file);
    try {
      await stat(full);
    } catch {
      return;
    }
    const source = await readFile(full, "utf8");
    total += gzipSync(source).byteLength;
    const imports = [
      ...source.matchAll(/from"\.\/([^"]+\.js)"/g),
      ...source.matchAll(/import"\.\/([^"]+\.js)"/g),
      ...source.matchAll(/from\s*"\.\/([^"]+\.js)"/g),
    ];
    for (const match of imports) {
      const target = match[1];
      if (target) await visit(target);
    }
  }

  await visit(entry);
  return total;
}

export function forbiddenTextTokens(html: string): string[] {
  const text = stripScriptsAndStyles(html);
  return FORBIDDEN.filter((token) => text.includes(token));
}
