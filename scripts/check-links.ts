import { join } from "node:path";
import { canonicalRoutes } from "../src/seo/routes";
import { checkLinks } from "./lib/checks";
import { routeFile } from "./lib/html";

async function main(): Promise<void> {
  const client = join(process.cwd(), "dist", "client");
  const files = [...canonicalRoutes.map((route) => routeFile(route.path)), "404.html"];
  const issues = await checkLinks(files, client);

  if (issues.length > 0) {
    for (const issue of issues) console.error(`${issue.path}: ${issue.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`No broken internal links across ${files.length} HTML files.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
