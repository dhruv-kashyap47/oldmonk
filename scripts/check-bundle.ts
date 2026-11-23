import { join } from "node:path";
import { chunkSizes, initialGzip } from "./lib/checks";

const INITIAL_BUDGET = 75 * 1024;
const CHUNK_BUDGET = 60 * 1024;

async function main(): Promise<void> {
  const client = join(process.cwd(), "dist", "client");
  const initial = await initialGzip(client);
  const chunks = await chunkSizes(client);
  const failures: string[] = [];

  if (initial > INITIAL_BUDGET) {
    failures.push(`Initial JS ${(initial / 1024).toFixed(1)} KB gzip, budget ${INITIAL_BUDGET / 1024} KB.`);
  }
  for (const chunk of chunks) {
    if (chunk.gzip > CHUNK_BUDGET) {
      failures.push(`${chunk.file} is ${(chunk.gzip / 1024).toFixed(1)} KB gzip, budget ${CHUNK_BUDGET / 1024} KB.`);
    }
  }

  console.log(`Initial JS: ${(initial / 1024).toFixed(1)} KB gzip. Largest chunks:`);
  for (const chunk of chunks.slice(0, 8)) {
    console.log(`  ${chunk.file}  ${(chunk.gzip / 1024).toFixed(1)} KB gzip`);
  }

  if (failures.length > 0) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
