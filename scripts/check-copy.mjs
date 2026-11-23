// Fails the build on em dashes and on spaced en dashes used as dashes.
// Scope: text we author. Verbatim third-party references in design/references/ are exempt.
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".agents", "references"]);
const EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".css",
  ".html",
  ".json",
  ".md",
  ".txt",
  ".webmanifest",
]);

const EM_DASH = "\u2014";
const SPACED_EN_DASH = / \u2013 |\u2013 /;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(join(dir, entry.name));
    } else {
      const dot = entry.name.lastIndexOf(".");
      if (dot > 0 && EXTENSIONS.has(entry.name.slice(dot))) yield join(dir, entry.name);
    }
  }
}

const problems = [];

for (const dir of ["src", "public"]) {
  for await (const file of walk(join(ROOT, dir))) {
    const text = await readFile(file, "utf8");
    if (!text.includes(EM_DASH) && !SPACED_EN_DASH.test(text)) continue;

    text.split("\n").forEach((line, index) => {
      if (line.includes(EM_DASH) || SPACED_EN_DASH.test(line)) {
        problems.push(`${relative(ROOT, file)}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

if (problems.length > 0) {
  console.error("Em dash found. Use a comma, a colon, a period, or parentheses instead.\n");
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(`\n${problems.length} line(s) failed check:copy.`);
  process.exit(1);
}

console.log("check:copy passed: no em dashes in src/ or public/.");
