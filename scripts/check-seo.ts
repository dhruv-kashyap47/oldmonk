import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { canonicalRoutes } from "../src/seo/routes";
import { absoluteUrl, titleWithSuffix } from "../src/seo/site";
import { checkHtml, type Issue } from "./lib/checks";
import { inspectHtml, routeFile } from "./lib/html";

const CLIENT = join(process.cwd(), "dist", "client");

async function main(): Promise<void> {
  const issues: Issue[] = [];

  for (const route of canonicalRoutes) {
    const file = join(CLIENT, routeFile(route.path));
    const html = await readFile(file, "utf8").catch(() => null);
    if (html === null) {
      issues.push({ path: route.path, message: `Missing prerendered file ${routeFile(route.path)}.` });
      continue;
    }
    issues.push(
      ...checkHtml(route.path, html, {
        path: route.path,
        title: titleWithSuffix(route.title),
        description: route.description,
        canonical: absoluteUrl(route.path),
      }),
    );
  }

  const missing = await readFile(join(CLIENT, "404.html"), "utf8").catch(() => null);
  if (missing === null) {
    issues.push({ path: "/404", message: "Missing 404.html." });
  } else {
    const facts = inspectHtml(missing);
    if (!missing.includes("noindex")) issues.push({ path: "/404", message: "404 is not noindex." });
    if (facts.h1Count !== 1) issues.push({ path: "/404", message: "404 needs exactly one h1." });
  }

  if (issues.length > 0) {
    for (const issue of issues) console.error(`${issue.path}: ${issue.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`SEO checks passed for ${canonicalRoutes.length} routes and the 404 page.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
