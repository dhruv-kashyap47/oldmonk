# oldmonk.

A browser-first tools platform: fast, private utilities for code, text, random picks, timers, and small tests. Every tool runs locally. There is no signup, no upload, and no tool backend.

**Status:** Platform and the 24-tool catalog. The build prerenders every route to static HTML and fails on a broken link, a missing canonical, a thin description, an invalid JSON-LD block, or an over-budget bundle.

## Documents

- [Plan.md](./Plan.md): product, architecture, SEO, design system, risks, effort.
- [Task.md](./Task.md): sprint board, forward queue, and per-tool definition of done.
- [Audit.md](./Audit.md): what was inspected in the five open-source repos.
- [PORTING.md](./PORTING.md): reuse map and rejected code.
- [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md): licenses and attribution.
- [design/REFERENCES.md](./design/REFERENCES.md): the three design guides behind the catalog anatomy.

## Commands

```bash
npm run dev              # Vite dev server with SSR
npm run typecheck        # TypeScript
npm run lint             # oxlint over src and scripts
npm run check:copy       # fails on em dashes in src/ and public/
npm run test             # Vitest unit and logic tests
npm run build            # client + server build, then prerender and checks
npm run preview          # serve dist/client with pretty URLs and 404 handling
npm run check:seo        # title, description, canonical, H1, JSON-LD
npm run check:links      # internal link crawler
npm run check:bundle     # gzip budgets
npm run verify           # all of the above, in order
```

Node `>=22.12.0`.

## Build shape

```
vite build
  ├─ dist/client/assets/*        client bundles and CSS
  └─ dist/server/server.js       SSR handler
        │
        ▼
scripts/prerender.ts
  ├─ request every canonical route through handleRequest()
  ├─ assert status, title, description, canonical, one H1, valid JSON-LD
  ├─ write dist/client/<route>.html, index.html, 404.html
  ├─ write sitemap.xml, robots.txt, _headers, _redirects, ads.txt
  ├─ crawl internal links
  └─ write dist/build-report.json with per-chunk gzip sizes
```

Deploy `dist/client` to Cloudflare Pages with `wrangler.toml`.

## Adding a tool

1. Create `src/tools/<slug>/` with `meta.ts`, `logic.ts`, `logic.test.ts`, `Tool.tsx`, and `Content.tsx`. The JSON Formatter folder is the reference.
2. Keep `logic.ts` free of Solid, DOM, storage, and network access.
3. Add the meta to `src/tools/registry.ts`. Routes, search, the catalog, the sitemap, and the related-tool graph pick it up from there.
4. Run `npm run verify`.

## Constraints

- Solid 2, TypeScript, Vite start mode, Tailwind 4, and ui-sdk primitives. No React, Next, Astro, or SolidStart.
- Static output for Cloudflare Pages. No runtime server, database, or accounts in v1.
- Tool input never leaves the browser.
- No fake numbers, invented percentiles, or unsupported claims.
- Ported code is recorded in `PORTING.md` and attributed in `THIRD_PARTY_NOTICES.md`.

The product name and domain are placeholders (`oldmonk`, `https://oldmonk.dev`) until the launch check in `Plan.md` §13 is resolved.
