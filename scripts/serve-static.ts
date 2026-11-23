import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = join(process.cwd(), "dist", "client");
const PORT = Number(process.env.PORT ?? 4173);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

async function exists(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(url.pathname);
    const safe = normalize(pathname).replaceAll("\\", "/");
    if (safe.includes("..")) {
      response.writeHead(400).end("Bad request");
      return;
    }

    const candidates =
      safe === "/"
        ? ["index.html"]
        : [safe.slice(1), `${safe.slice(1)}.html`, `${safe.slice(1)}/index.html`];

    for (const candidate of candidates) {
      const file = join(ROOT, candidate);
      if (await exists(file)) {
        const type = TYPES[extname(file)] ?? "application/octet-stream";
        response.writeHead(200, { "content-type": type }).end(await readFile(file));
        return;
      }
    }

    const notFound = join(ROOT, "404.html");
    if (await exists(notFound)) {
      response.writeHead(404, { "content-type": TYPES[".html"] }).end(await readFile(notFound));
      return;
    }
    response.writeHead(404).end("Not found");
  });

  server.listen(PORT, () => {
    console.log(`Serving dist/client at http://localhost:${PORT}`);
  });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
