import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { tools } from "../src/tools/registry";
import { absoluteUrl, titleWithSuffix } from "../src/seo/site";
import { decodeEntities, inspectHtml, routeFile } from "./lib/html";

const CLIENT = join(process.cwd(), "dist", "client");

const CLAIM_PATTERNS = [
  "studies show",
  "trusted by",
  "used by millions",
  "million users",
  "5-star",
  "stars out of",
  "rated 4",
  "rated 5",
  "top 1%",
  "top 5%",
  "top 10%",
  "percentile rank",
  "our users",
];

function textOf(html: string): string {
  return decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function countBetween(html: string, attribute: string, tag: string): number {
  const container = new RegExp(`<dl[^>]*${attribute}[^>]*>([\\s\\S]*?)</dl>`, "i").exec(html);
  if (!container) return 0;
  return (container[1]?.match(new RegExp(`<${tag}\\b`, "gi")) ?? []).length;
}

function countFaq(html: string): number {
  return (html.match(/data-faq-item/g) ?? []).length;
}

async function main(): Promise<void> {
  const issues: string[] = [];
  const rows: string[] = [];

  for (const tool of tools) {
    const file = join(CLIENT, routeFile(`/${tool.slug}`));
    const html = await readFile(file, "utf8").catch(() => null);
    if (html === null) {
      issues.push(`${tool.slug}: missing prerendered file.`);
      continue;
    }

    const facts = inspectHtml(html);
    const text = textOf(html);
    const words = text.split(" ").filter((word) => word.length > 0).length;
    const specs = countBetween(html, "data-spec-grid", "dt");
    const faqs = countFaq(html);
    const related = new Set(
      (html.match(/href="\/([a-z0-9-]+)"/g) ?? [])
        .map((value) => value.slice(7, -1))
        .filter((slug) => slug !== tool.slug && tools.some((entry) => entry.slug === slug)),
    ).size;

    const minimum = tool.category === "developer" ? 500 : 350;
    if (words < minimum) issues.push(`${tool.slug}: ${words} words, needs ${minimum}.`);
    if (specs < 4 || specs > 6) issues.push(`${tool.slug}: ${specs} specs, needs 4 to 6.`);
    if (faqs < 8 || faqs > 12) issues.push(`${tool.slug}: ${faqs} FAQs, needs 8 to 12.`);
    if (related < 3 || related > 6) issues.push(`${tool.slug}: ${related} related links, needs 3 to 6.`);
    if (facts.title !== titleWithSuffix(tool.title)) issues.push(`${tool.slug}: title mismatch.`);
    if (facts.canonical !== absoluteUrl(`/${tool.slug}`)) issues.push(`${tool.slug}: canonical mismatch.`);
    if (facts.h1Count !== 1) issues.push(`${tool.slug}: ${facts.h1Count} h1 elements.`);
    if (facts.jsonLd.length < 2) issues.push(`${tool.slug}: only ${facts.jsonLd.length} JSON-LD blocks.`);
    if (!facts.text.includes(tool.name)) issues.push(`${tool.slug}: tool name is missing from the page.`);

    for (const token of ["TODO", "FIXME", "[object Object]", "Loading ", "undefined", "NaN"]) {
      if (text.includes(token)) issues.push(`${tool.slug}: rendered text contains "${token}".`);
    }
    const lower = text.toLowerCase();
    for (const pattern of CLAIM_PATTERNS) {
      if (lower.includes(pattern)) issues.push(`${tool.slug}: claim pattern "${pattern}".`);
    }

    rows.push(`${tool.slug.padEnd(24)} ${String(words).padStart(4)} words  ${specs} specs  ${faqs} FAQs  ${related} related`);
  }

  for (const row of rows) console.log(row);

  if (issues.length > 0) {
    console.error(`\nContent checks failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(`  ${issue}`);
    process.exitCode = 1;
    return;
  }
  console.log(`\nContent checks passed for ${tools.length} tool pages.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
