# oldmonk: Implementation Plan

**Status:** Implemented 2026-11-23. The platform and the 24-tool catalog are in place; 36 routes prerender, `npm run verify` is green, and the launch blockers are tracked in [Task.md](./Task.md).
**Owner:** oldmonk
**Last updated:** 2026-11-20
**Release shape:** 10-tool MVP, 24-tool v1. Cron deferred to v2.
**Companion docs:** [Audit.md](./Audit.md), [PORTING.md](./PORTING.md), [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md), [Task.md](./Task.md).

---

## 1. Product

### 1.1 What oldmonk is

oldmonk is a browser-first utility platform. One clean surface for four jobs:

- **Code**: developer tools that respect private data
- **Create**: text, fonts, and symbols for social and design work
- **Decide**: randomizers, timers, and lightweight decision aids
- **Test**: small interactive tests with honest, shareable results

Every tool works instantly, without signup. Every tool runs in the browser unless there is a hard reason not to. The tools are the product; the surrounding content exists to help people use them and to make each page independently useful.

### 1.2 Positioning

**oldmonk: useful tools, instantly.**
**Code · Create · Decide · Test**

Not a "1000 tools" directory. A curated, fast, trustworthy utility product that grows deliberately.

### 1.3 Audience and intent

| Audience | Entry point | What they need |
| --- | --- | --- |
| Developers | Google: "json formatter", "jwt decoder", "regex tester" | Correct output, error detail, no data leaves the browser |
| Social creators | Google/TikTok: "fancy text", "instagram fonts", "symbols copy paste" | One-click copy, styles that actually render |
| Students / teams | "random name picker", "spin wheel", "pomodoro" | Fast, fair, repeatable, mobile-friendly |
| Curious visitors | "typing test", "reaction time test" | Honest measurement, replay, shareable result |

### 1.4 Product principles

1. **Instant before clever.** User input → local computation → immediate result.
2. **Privacy is visible.** A short, honest "runs in your browser" statement on every tool.
3. **One job per page.** A tool page answers: what does it do, can I use it now, why trust it, what next.
4. **No fake numbers.** No invented "used by 2M people", no fake trending, no fake precision.
5. **Ads never break the task.** No ads inside tool controls, no sticky mobile interstitials, no deceptive placement.
6. **Accessible by construction.** Keyboard, focus, labels, contrast, reduced motion, touch targets.
7. **Small dependencies.** Native APIs first. Every dependency must earn its bytes.

### 1.5 Success metrics

- Indexed tool pages with unique titles/descriptions and real content.
- Organic impressions and clicks per tool (Search Console).
- Tool completion rate (first input → result) and copy/share rate.
- Repeat usage on timers/randomizers/tests.
- Core Web Vitals: LCP ≤ 1.8s, CLS ≤ 0.02, INP ≤ 150ms on mobile lab runs.
- AdSense: viewability and RPM without harming task completion.

---

## 2. Release 1 scope

### 2.1 Tools (24)

**Release column:** `MVP` ships first (10 tools, two per category); `v1` completes the catalog (14 more). Cron Generator moves to v2.

| # | Tool | Slug | Category | Primary intent | Release |
| --- | --- | --- | --- | --- | --- |
| 1 | JSON Formatter | `/json-formatter` | Developer | Pretty-print and inspect JSON | MVP |
| 2 | JSON Validator | `/json-validator` | Developer | Find the exact syntax error | v1 |
| 3 | JSON Minifier | `/json-minifier` | Developer | Shrink JSON and see size saved | v1 |
| 4 | Regex Tester | `/regex-tester` | Developer | Test patterns, flags, groups, replace | v1 |
| 5 | JWT Decoder | `/jwt-decoder` | Developer | Inspect header/payload and expiry | MVP |
| 6 | Base64 Encoder / Decoder | `/base64` | Developer | Text and file Base64, URL-safe | v1 |
| 7 | URL Encoder / Decoder | `/url-encoder` | Developer | Component vs full-URL encoding | v1 |
| 8 | UUID Generator | `/uuid-generator` | Developer | Bulk v4/v7 UUIDs, copy/download | v1 |
| 9 | Timestamp Converter | `/timestamp-converter` | Developer | Unix ↔ ISO ↔ local/UTC | v1 |
| 10 | Diff Checker | `/diff-checker` | Developer | Line and inline diff, unified view | v1 |
| 11 | Fancy Text Generator | `/fancy-text-generator` | Text | Unicode style variants, copy | MVP |
| 12 | Cursive Text Generator | `/cursive-text-generator` | Text | Script/cursive styles with fallbacks | v1 |
| 13 | Symbol Copy Tool | `/symbols` | Text | Searchable hearts/stars/arrows/symbols | MVP |
| 14 | Instagram Fonts | `/instagram-fonts` | Text | Bio-length fonts + character counter | v1 |
| 15 | Random Number Generator | `/random-number-generator` | Random | Unbiased range, bulk, crypto | v1 |
| 16 | Random Name Picker | `/random-name-picker` | Random | Fair picker, no repeats, history | MVP |
| 17 | Spin Wheel | `/spin-wheel` | Random | Weighted entries, animated fair pick | MVP |
| 18 | Dice Roller | `/dice-roller` | Random | Multiple dice, modifiers, history | v1 |
| 19 | Pomodoro Timer | `/pomodoro-timer` | Timer | Work/break cycles, notifications | MVP |
| 20 | Countdown Timer | `/countdown-timer` | Timer | Presets, precise finish, alarm | MVP |
| 21 | Typing Speed Test | `/typing-speed-test` | Test | WPM/accuracy, replay, best score | MVP |
| 22 | Reaction Time Test | `/reaction-time-test` | Test | 5 rounds, median, early-click handling | MVP |
| 23 | Memory Test | `/memory-test` | Test | Sequence memory, levels, best score | v1 |
| 24 | Click Speed Test | `/click-speed-test` | Test | CPS over 10s, consistency, replay | v1 |

**MVP set (10):** JSON Formatter, JWT Decoder, Fancy Text, Symbols, Random Name Picker, Spin Wheel, Pomodoro, Countdown, Typing, Reaction.
**v1 additions (14):** JSON Validator, JSON Minifier, Regex, Base64, URL, UUID, Timestamp, Diff, Cursive, Instagram Fonts, Random Number, Dice, Memory, Click Speed.

### 2.2 Hub pages

- `/`: homepage
- `/developer-tools`: category
- `/json-tools`: topic cluster (formatter, validator, minifier + related)
- `/text-tools`: category
- `/random-tools`: category
- `/timer-tools`: category
- `/test-tools`: category
- `/about`, `/privacy`, `/terms`, `/contact`
- `/404` (static `404.html`, `noindex`)

### 2.3 Explicit non-goals for release 1

- No accounts, database, saved history sync, or Pro plan.
- No runtime API/backend. The build produces static HTML + client assets.
- No i18n.
- No blog/guides section (tool content carries SEO for now).
- No PWA/offline mode (evaluate after launch).
- No 200-tool catalog. No thin pages. No auto-generated "tool #173" filler.
- No additional UI kit beyond ui-sdk; no icon library.
- **No Cron Generator in v1.** It is v2, after the 24-tool catalog is live.
- **No React, Next, Astro, SolidStart, Kobalte, or Radix in the app.** The UI runtime is Solid 2.
- **No Render deployment in the MVP.** Cloudflare Pages only; revisit a second target after launch.
- **No live ads before AdSense approval, CMP, and content review.** Placeholders are env-driven and render nothing when unconfigured.
- **No fake numbers.** No invented user counts, percentiles, benchmarks, ratings, or "studies show" claims.

### 2.4 Release stages

| Stage | Tools | Goal | Gate |
| --- | --- | --- | --- |
| **MVP** | 10 | Prove the platform, design, SEO, and reuse engines with two tools per category | 10 routes indexable, 0 broken links, Lighthouse ≥95, mobile/a11y pass |
| **v1** | 24 | Complete the catalog, content, internal links, ads, and launch | Plan §15 definition of done |
| **v1.1** | 24 + 5 | Add Case Converter, Word Counter, Hash Generator (real WebCrypto), Color Converter, Lorem Ipsum; saved lists; PWA | GSC demand justifies each addition |
| **v2** | 30+ | Cron, QR (local), Markdown (sanitized), optional i18n, share cards, accounts only if measured | Retention/RPM evidence |

---

## 3. Technical foundation

### 3.1 Stack decision (verified 2026-11-20)

| Layer | Choice | Version |
| --- | --- | --- |
| UI runtime | `solid-js` | 2.0.3 |
| Web runtime | `@solidjs/web` | 2.0.3 |
| Router | `@solidjs/router` | 2.0.1 |
| Head/meta | `@solidjs/meta` | 2.0.0 |
| Build/start mode | `@solidjs/vite-plugin` | 3.0.1 |
| Bundler | `vite` | 8.3.8 |
| Styling | `tailwindcss` + `@tailwindcss/vite` | 4.3.5 |
| UI primitives | `@ui-sdk/solid` + `@ui-sdk/core` | 0.1.0-beta.13 |
| Language | `typescript` | 7.0.2 |
| Unit tests | `vitest` | 5.1.1 |
| Lint | `oxlint` | 1.94.0 |
| Animation | `animejs` | 4.5.0 (lazy, only where purposeful) |
| Deploy | Cloudflare Pages (static) | none |

**Important finding:** SolidStart 2.2.3 is still built for Solid 1.9 and Router 1.x (`peerDependencies` exclude Solid 2 and Router 2). Solid 2 ships its own **start mode** inside `@solidjs/vite-plugin` 3, which replaces SolidStart for new apps. We will use that, not SolidStart.

**Verified in a throwaway probe:**
- `vite build` emits `dist/client` + `dist/server/server.js`.
- Calling the server handler with a `Request` returns fully rendered HTML.
- `Title`, `Meta`, `Link`, and `Script` render into `<head>` during SSR.
- Canonical and JSON-LD survive into static HTML.
- Tool routes are code-split into separate chunks.
- A static prerender script can write `dist/client/<route>.html`.

**UI primitives: ui-sdk.** `@ui-sdk/solid@0.1.0-beta.13` and `@ui-sdk/core@0.1.0-beta.13` are installed. They peer on Solid 2 and render unstyled, accessible parts. Use them for dialogs, tabs, switches, sliders, tooltips, toasts, fields, inputs, selects, comboboxes, menus, and other ARIA-heavy patterns instead of hand-rolling behavior. Import per entry (`@ui-sdk/solid/button`), keep `@ui-sdk/core` out of Vite pre-bundling, and declare `@layer ui-sdk` above Tailwind. The `ui-sdk` skill and the package docs are the source of truth; `AGENTS.md` records the reading order.

**Verified:** the app installs ui-sdk against Solid 2.0.3, typechecks, lints, builds, and SSRs a ui-sdk `Button` as a real anchor with `data-slot="button"` and bundled CSS.

**Baseline measured 2026-11-20:** `npm run verify` passes (typecheck, lint, test with zero tests, build). `handleRequest(new Request("http://localhost/"))` returns 200 and the HTML contains `<title>`, meta description, and the Bitter preload. Client build: ~51 KB gzip JS + 14.8 KB gzip CSS before tools. `npm run test` currently passes with **zero tests**; real tests start in Phase 1.

**Kobalte:** not used. Its Solid 2 build is alpha and pins `solid-js@2.0.0-rc.16`, so it is not a fit.

### 3.1a Framework decision (2026-11-20)

Keep Solid 2. Do not fork React or Next.

The five audited repos were evaluated as bases. None is viable: devtoolkit is a HashRouter SPA with client-only metadata and 44 tools that include incorrect crypto; HumanEval is a Next app with fabricated benchmark data and ignored TypeScript errors; fancy-fonts and random-picker are single-purpose vanilla apps; pomo requires a server and database. The reusable assets are framework-free: random-picker's RNG, fancy-fonts' data, HumanEval's audio class, devtoolkit's JWT/URL helpers, and pomo's PiP pattern. Switching frameworks would not avoid tool UI work; it would only add a new shell and a new SEO pipeline.

| Option | Time to 10 quality tools | SEO | Maintenance | Decision |
| --- | --- | --- | --- | --- |
| **Solid 2 + this scaffold** | 4–6 weeks | Static prerender, verified head tags | Small, pinned | **Keep** |
| React fork of devtoolkit | 5–7 weeks | Needs router rewrite + custom SSG | 51 deps, quality debt | No |
| Next fork of HumanEval | 6–8 weeks | Built-in, but metadata missing | 53 deps, TS errors ignored | No |
| Astro + islands | 5–7 weeks | Excellent | Two paradigms, new shell | No |
| Vanilla single-file | 8+ weeks | Manual per page | Becomes a monolith | No |

**Contingency:** if Solid 2's router, meta, or SSR blocks progress for more than two working days during the JSON vertical slice, switch the shell to React + Vite + a custom prerender and keep every `logic.ts` unchanged. Do not switch preemptively.

### 3.2 Rendering and deployment model

**Static site generation via an SSR build.** No runtime server.

```
vite dev
  └─ SSR on demand (fast feedback, real head tags)

vite build
  ├─ client assets  → dist/client/assets/*
  └─ server handler → dist/server/server.js
        │
        ▼
  scripts/prerender.ts
  ├─ request every canonical route through handleRequest()
  ├─ assert 200 + title + description + canonical + one H1 + valid JSON-LD
  ├─ write dist/client/<route>.html  (pretty URLs on Cloudflare Pages)
  ├─ write dist/client/404.html
  ├─ write sitemap.xml, robots.txt, _headers, _redirects, ads.txt
  ├─ crawl internal links and fail on broken targets
  └─ write dist/build-report.json (bundle sizes, route count, warnings)

deploy dist/client
  └─ Cloudflare Pages (v1)
        ├─ _headers, _redirects generated
        ├─ 404.html
        └─ ads.txt when configured
```

Why this shape:
- Static HTML is the best answer for SEO, Core Web Vitals, and cost.
- No backend, no cold starts, no per-request compute.
- The SSR build is still used at build time, so metadata and content are real HTML, not a client-rendered shell.
- Adding a tool does not require a new deploy target or server route.
- One target keeps preview, header, and redirect verification simple. A second target (Render) is a post-launch option, not an MVP requirement.

### 3.3 Project structure

Single deployable app with strict boundaries. A monorepo is unnecessary for one Cloudflare site; if a second app appears, `src/tools` can move to a package without changing tool modules.

```
oldmonk/
├─ public/
│  ├─ brand/                     # generated from assets/logo: mark, favicons, og card
│  ├─ manifest.webmanifest
│  ├─ fonts/
│  │  ├─ bitter-latin-var.woff2
│  │  └─ OFL.txt
│  └─ _headers, _redirects       # source templates; generated at build
├─ scripts/
│  ├─ prerender.ts              # routes → static HTML; sitemap; headers
│  ├─ check-seo.ts              # title/desc/canonical/H1/JSON-LD assertions
│  ├─ check-links.ts            # internal link crawler
│  ├─ check-bundle.ts           # gzip budgets per entry/chunk
│  └─ serve-static.ts           # production-like preview
├─ src/
│  ├─ app.tsx
│  ├─ document.tsx
│  ├─ router.ts
│  ├─ styles/
│  │  ├─ tokens.css
│  │  └─ app.css
│  ├─ components/
│  │  ├─ layout/                # SiteHeader, SiteFooter, MobileNavigation, SkipLink, Container
│  │  ├─ tool/                  # ToolShell, ToolHeader, ToolPanel, ToolInput, ToolOutput,
│  │  │                         # CopyButton, ResetButton, RelatedTools, states
│  │  ├─ ui/                    # thin wrappers over ui-sdk
│  │  ├─ seo/                   # MetaTags, JsonLd, Breadcrumbs
│  │  ├─ search/                # SearchDialog, SearchTrigger, SearchResults
│  │  └─ ads/                   # AdSlot, AdLabel
│  ├─ tools/
│  │  ├─ types.ts
│  │  ├─ registry.ts            # metadata + loaders only; no JSX
│  │  ├─ _shared/               # random.ts, unicode.ts, clock.ts, scoring.ts, audio.ts
│  │  ├─ json-formatter/
│  │  │  ├─ meta.ts             # SEO + registry metadata
│  │  │  ├─ logic.ts            # pure; no DOM, no fetch
│  │  │  ├─ logic.test.ts       # golden vectors
│  │  │  ├─ Tool.tsx
│  │  │  └─ Content.tsx         # prose + FAQ
│  │  └─ …23 more
│  ├─ pages/                    # HomePage, CategoryPage, ToolPage, static pages
│  ├─ content/                  # categories, site copy, FAQ data, legal copy
│  ├─ lib/                      # clipboard, storage, download, share, crypto, errors, bytes
│  ├─ seo/                      # site.ts, routes.ts, schema.ts
│  ├─ analytics/                # provider adapter + typed events
│  ├─ monetization/             # ads config, consent, placements
│  └─ config/                   # env parsing, feature flags
├─ tests/
│  ├─ unit/
│  ├─ component/
│  └─ e2e/
├─ Audit.md
├─ PORTING.md
├─ THIRD_PARTY_NOTICES.md
├─ README.md
├─ Plan.md
├─ Task.md
├─ vite.config.ts
├─ tsconfig.json
├─ package.json
└─ wrangler.toml
```

**Boundary rules:**

- `registry.ts` imports `meta.ts` only. It must not pull in `Tool.tsx`, `Content.tsx`, or `logic.ts`.
- `Tool.tsx` imports `logic.ts`; `logic.ts` imports nothing from `solid-js`, `@solidjs/*`, or the DOM.
- `Content.tsx` is static prose; it does not import tool state.
- `_shared/` holds engines used by two or more tools. A single-tool helper stays in that tool's folder.
- Ported code records its source in [PORTING.md](./PORTING.md) and its notice in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

### 3.4 Route model

Explicit route table, generated from registries. No 250 route files.

```ts
// src/router.ts (shape)
const routes = [
  { path: "/", component: HomePage },
  { path: "/developer-tools", component: CategoryPage, info: { category: "developer" } },
  { path: "/json-tools", component: TopicPage, info: { topic: "json" } },
  // …other categories
  { path: "/:slug", component: ToolPage },     // registry lookup; 404 if unknown
  { path: "/about", component: AboutPage },
  // …legal pages
  { path: "*404", component: NotFoundPage },
];
```

- Static routes outrank `/:slug`.
- `ToolPage` resolves the slug from `registry.ts`; unknown slugs call `httpStatus(404)` and render `NotFoundPage`.
- Tool UI is lazy: `lazy(meta.load)`. Hover/focus preloading via `intentPreload()`.
- Canonical URLs are root-level and keyword-led, e.g. `/json-formatter`.

### 3.5 Tool module contract

Adding tool #100 should be: one registry entry + one folder.

```ts
// src/tools/types.ts
export type ToolCategory = "developer" | "text" | "random" | "timer" | "test";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolComponentModule {
  default: Component;
}

export interface ToolContentModule {
  default: Component;
  faq: FAQItem[];
}

export interface ToolMeta {
  slug: string;
  name: string;
  title: string;            // SEO title without brand suffix
  description: string;      // 140–160 chars
  summary: string;          // card copy, one sentence
  category: ToolCategory;
  topics: string[];         // e.g. ["json"]
  keywords: string[];
  related: string[];        // 3–6 slugs
  added: string;            // ISO date
  updated: string;          // ISO date
  loadTool: () => Promise<ToolComponentModule>;
  loadContent: () => Promise<ToolContentModule>;
}
```

Registry metadata stays small (no JSX, no long copy). `meta.ts` carries the metadata and the two lazy loaders. The Tool chunk and the Content chunk are separate, so the home page never downloads either, and the tool page can budget them independently. SSR awaits both at build time, so the explanatory content and FAQ are in the static HTML.

**Chunk budgets:** `Tool.tsx` ≤ 20 KB gzip; `Content.tsx` ≤ 8 KB gzip. If a tool needs a worker or a large dataset, lazy-load it on interaction and document the budget exception in the build report.

### 3.6 Data flow and state

- All tool computation is synchronous or local-async (WebCrypto, FileReader, Web Worker).
- No tool sends user input over the network. Enforced by a test that fails on `fetch`/`XHR` inside tool modules.
- `logic.ts` is framework-free: no Solid import, no DOM, no storage, no network. It is testable in plain Node.
- Every parser or generator has a known-answer test. Crypto output is checked against Node `crypto`; JSON against `JSON.parse`; encoding against `Buffer`.
- No fake numbers. No invented percentiles, benchmarks, user counts, ratings, or "studies show" claims. Test tools show raw metrics and methodology.
- Preferences and high scores: `localStorage` under `oldmonk:v1:*`, wrapped in try/catch, never containing user-pasted content.
- URL state: only non-sensitive navigation (e.g. selected tab) may use the query string. Never JWT/JSON/text contents.
- Timers use `performance.now()` + `requestAnimationFrame`; background-tab drift corrected on visibility change.
- Randomness uses `crypto.getRandomValues` with rejection sampling for unbiased ranges. No `Math.random()` for UUIDs, passwords, picks, shuffles, dice, or wheel winners.
- Ported code is recorded in [PORTING.md](./PORTING.md); rejected code is not reintroduced.

### 3.7 Shared component inventory

**Layout:** `SiteHeader`, `SiteFooter`, `MobileNavigation`, `SkipLink`, `Container`, `PageHeader`.

**Tool:** `ToolShell`, `ToolHeader`, `ToolPanel`, `ToolInput`, `ToolOutput`, `CopyButton`, `ResetButton`, `RelatedTools`, `Breadcrumbs`, `ResultCard`, `EmptyState`, `ErrorState`, `LoadingState`.

**UI:** thin wrappers and styling around ui-sdk parts: `Button`, `IconButton`, `Field`, `Textarea`, `Select`, `Tabs`, `SegmentedControl`, `Switch`, `Slider`, `Dialog`, `Tooltip`, `Toast`, `Badge`, `Kbd`.

**Composition rule:** use ui-sdk before writing any `role="dialog"`, `role="tablist"`, `role="listbox"`, `role="menu"`, `role="switch"`, `role="slider"`, `role="radiogroup"`, or `role="toolbar"` by hand. Custom primitives are only for behavior ui-sdk does not ship.

**SEO:** `MetaTags`, `JsonLd`, `CanonicalLink`.

**Search:** `SearchDialog`, `SearchTrigger`, `SearchResults`.

**Monetization:** `AdSlot`, `AdLabel`.

Primitives use native elements where possible:
- Dialog: `<dialog>` + `showModal()` + focus return.
- Tabs: roving tabindex, `aria-selected`, arrow keys.
- Switch: `<button role="switch" aria-checked>`.
- Tooltip: CSS + `aria-describedby`, no JS positioning library.
- Toast: single polite live region.

---

## 4. Design system

### 4.1 Direction: "The Catalog"

Warm, human, precise. oldmonk should feel like a well-kept index of useful things: a page you can scan, search, and trust. The homepage is the catalog; each tool is a workbench.

The warmth comes from color, type, and language, not decoration: warm stone paper, near-black ink, a deep petrol accent, apricot highlights, and plum/moss/rose category markers. A sturdy slab serif carries the headings; tool screens stay quiet and precise so the work is the focus.

Deliberately avoid the current AI default: cream + high-contrast serif + terracotta, identical rounded cards on every section, gradient washes, all-caps eyebrows, "✨ AI-powered" language, decorative arrows on every link, and a giant empty hero.

### 4.2 Tokens

| Token | Light | Dark |
| --- | --- | --- |
| `--bg` | `#F3F0E6` | `#141512` |
| `--surface` | `#FFFCF4` | `#1C1D19` |
| `--surface-2` | `#EAE5D6` | `#25261F` |
| `--ink` | `#1B1A16` | `#F1EEE4` |
| `--muted` | `#676357` | `#A9A496` |
| `--line` | `#DCD6C5` | `#34362D` |
| `--accent` | `#1E5A62` | `#6FB7B0` |
| `--accent-hover` | `#16464D` | `#8ACCC5` |
| `--accent-warm` | `#B86B16` | `#F0B45E` |
| `--cat-dev` | `#2E5E8A` | `#8DB6DE` |
| `--cat-text` | `#6E4B6E` | `#C39AC3` |
| `--cat-random` | `#4F6B3A` | `#A3C48A` |
| `--cat-timer` | `#9A5610` | `#F0B45E` |
| `--cat-test` | `#A84D5E` | `#E39AA7` |
| `--success` | `#2F6B4F` | `#7CC4A0` |
| `--danger` | `#A32A2A` | `#F08A8A` |
| `--focus` | `#2563EB` | `#8AB4FF` |

`--accent-warm` is for highlights, icons, and large text; use `--cat-timer` for small body text that must pass AA on paper. Contrast targets: WCAG AA for body text, muted text, buttons, focus rings, and code output in both themes. Verify in a real browser and adjust before shipping.

### 4.3 Type and layout

- Display: **Bitter** (self-hosted Latin variable woff2, 33.3 KB, weights 500–700, preloaded, `font-display: swap`, OFL license in `public/fonts/OFL.txt`). A warm slab serif, deliberately not the high-contrast editorial default.
- UI: system sans stack.
- Code: system mono stack.
- Metadata: system mono stack at 12px, `0.03em` tracking, used only for counts, kind, and dates in catalog rows; never for labels or buttons.
- Logo: supplied brand artwork only. `assets/logo/` is the source; `npm run brand:assets` derives `public/brand/` (header mark, favicons, app icons, social card). The header and footer pair the mark with the site name set in Bitter. The full lockup is reserved for dark surfaces, because its `old` letters are white on a transparent field. Never redraw the mark and never generate a second logo.
- Scale: H1 `clamp(2.75rem, 5vw, 4.5rem)`, H2 `clamp(1.6rem, 2.5vw, 2.25rem)`, body 17px/1.65, prose 66ch. Sentence case. No all-caps eyebrows. No single-word color accents in headings.
- Layout: container 1180px; standard tool 880px; wide tool 1200px; prose 66ch.
- Radii: 14px for panels/search, 8px for buttons, pills only for tags. Shadows only on popovers/dialogs, never on catalog rows.

### 4.4 Motion

- UI transitions 120–180ms ease-out.
- One orchestrated moment on the homepage: filtered catalog rows settle with a 120ms fade; no per-card reveal or scroll-triggered animation.
- Anime.js only for: spin wheel, timer progress ring, result reveal. Loaded dynamically on interaction, never in the initial bundle.
- `prefers-reduced-motion: reduce` disables transforms/loops; results still appear instantly.
- No looping decorative animation.

### 4.5 Page templates

**Home:** header → compact hero (H1, one-line value proposition, inline catalog search, three quick links) → five category sections. Each section has a short left-hand intro (name, one sentence, count) and a right-hand list of every tool in that category (name + one-line description + category marker). Search filters rows live, hides empty categories, and announces the result count. No separate popular-tools grid, no card kit. Footer closes the page.

**Category/topic:** breadcrumb → H1 + short intro → the same catalog rows → sibling category links → footer.

**Tool:** breadcrumb → H1 + summary + category/local badges → tool panel (880px standard, 1200px wide mode for diff, regex, and JSON tree) → actions → how-to → ad slot → explanation → FAQ → related-tool list → footer.

**Test result:** result card with primary metric, secondary stats, replay, copy/share, best score. Share image drawn on canvas, no library.

### 4.6 Responsive and accessibility

- Breakpoints: 360, 480, 640, 768, 1024, 1280.
- Touch targets ≥ 44×44px; no hover-only controls.
- Tool panels stack vertically under 768px; outputs never force horizontal page scroll (code blocks scroll internally).
- Visible `:focus-visible` ring on every interactive element.
- One H1 per page; landmarks (`header`, `nav`, `main`, `footer`); skip link.
- All inputs have labels; errors use `aria-describedby` + `aria-invalid`; live results announced politely.
- Timers/tests expose non-visual state (remaining time, score) without announcing every tick.
- Color is never the only signal.
- `prefers-reduced-motion` and `prefers-contrast` respected.

---

## 5. SEO

### 5.1 URL map

```
/                         home
/developer-tools          category
/json-tools               topic cluster
/text-tools               category
/random-tools             category
/timer-tools              category
/test-tools               category
/json-formatter           tool
…                         23 more tool slugs
/about /privacy /terms /contact
/sitemap.xml /robots.txt
```

Rules:
- Lowercase, hyphenated, no dates, no IDs, no trailing slash in canonicals.
- One canonical URL per page. `/json-formatter/` redirects to `/json-formatter`.
- No query-parameter pages in the index.

### 5.2 Metadata

Every indexable route has:
- Unique `<title>` ≤ 60 chars, format `Primary intent | oldmonk`.
- Unique meta description 140–160 chars.
- Canonical absolute URL.
- `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`.
- `twitter:card=summary_large_image`.
- `robots` only when needed (`noindex` on 404).
- One `<h1>` matching the page intent.

### 5.3 Structured data

- `WebApplication` on tool pages: name, URL, description, `applicationCategory`, `operatingSystem: "Any"`, `offers` price 0, `isAccessibleForFree: true`.
- `BreadcrumbList` on all non-home pages.
- `FAQPage` only where the FAQ is visible and genuinely useful.
- `WebSite` + `Organization` on home/about.
- No `HowTo` (deprecated rich result), no fake reviews/ratings, no `SearchAction` unless a real search URL exists.

### 5.4 Content standard per tool

Each tool page must contain, in this order:
1. A one-sentence answer to "what does this do?"
2. The working tool, immediately usable.
3. "How to use": 3–5 concrete steps.
4. "What it does": the technical behavior, limits, and edge cases.
5. Privacy note: what stays local.
6. FAQ: 3–5 real questions with direct answers.
7. Related tools: 3–6 contextual links.
8. Last updated date (real).

Minimum 350 words of unique explanatory content per tool; 500–800 for developer tools. No keyword stuffing, no repeated boilerplate beyond the privacy badge and related-tools module.

### 5.5 Internal linking

- Every tool links to its parent category, 3–6 related tools, and 1–2 contextual tools.
- Every category links to all its tools and sibling categories.
- Home links to every category and every tool through the catalog; no hidden tools.
- No orphan pages. Link checker fails the build on broken internal links.
- Breadcrumbs on every non-home page.

### 5.6 Sitemap and robots

- `sitemap.xml` generated from the same route manifest used for prerendering.
- Includes only canonical, indexable URLs; `lastmod` from tool `updated`.
- `robots.txt` allows all, points to the sitemap, disallows nothing important.
- 404 page is `noindex`.

### 5.7 Prerender checks (build fails on violation)

- Non-200 response for a canonical route.
- Missing/duplicate title, missing description, description outside 120–165 chars.
- Missing/wrong canonical.
- Zero or multiple `<h1>`.
- Invalid JSON-LD.
- `TODO`, `undefined`, `NaN`, `[object Object]` in rendered HTML.
- Broken internal link.
- Missing OG image.
- Bundle over budget.

### 5.8 Search Console

- Verify via DNS or meta tag (`VITE_GSC_VERIFICATION`).
- Submit `sitemap.xml`.
- Monitor queries per tool; expand only where demand is real.

### 5.9 Content truth and differentiation

- **No invented statistics.** No "used by X million," no percentile tables without a published dataset, no fictional benchmarks, no fake ratings or reviews.
- **Differentiate near-duplicates.** JSON Formatter, JSON Validator, and JSON Minifier each need a distinct H1, opening answer, examples, and FAQ. The same applies to Fancy Text, Cursive Text, and Instagram Fonts.
- **Instagram Fonts** uses the trademark descriptively, includes "Not affiliated with Instagram" in the page, and uses no Instagram logo or brand assets.
- **Test tools** show the measurement method, the number of trials, and the limits of browser timing. They do not claim clinical or cognitive diagnosis.
- **Text tools** state which platforms render which Unicode styles and what happens when a glyph is missing.
- **Random tools** explain the crypto source, rejection sampling, and the cap.
- **Timers** explain background-tab behavior and notification limits.

---

## 6. Monetization

### 6.1 AdSense architecture

- `src/monetization/config.ts` reads `VITE_ADSENSE_CLIENT` and placement slot IDs from env.
- If no client ID: `AdSlot` renders nothing (no empty boxes, no layout shift).
- `AdSlot` reserves space with `min-height` + `contain: layout`; lazy-initializes via `IntersectionObserver`.
- AdSense script is loaded once, production only, after consent where required.
- `ads.txt` generated at build when a publisher ID exists.
- Debug mode (`VITE_ADS_DEBUG=true`) shows labeled outlines locally; never in production.

### 6.2 Placements (max 2 per page)

| Placement | Where | Format |
| --- | --- | --- |
| `tool-below` | After the tool panel, before "How to use" | Responsive |
| `tool-content` | After "How to use", before explanation | Responsive |
| `category-below` | After the tool grid | Responsive |
| `home-below` | After popular tools | Responsive |

Never:
- inside a tool's controls or results;
- above the tool on mobile;
- sticky/fixed mobile ads;
- disguised as buttons or navigation;
- on 404 or legal pages.

**Timing:** ads are disabled in the MVP. Apply to AdSense after the 10-tool MVP is live and the first content pass is complete. Do not add a live ad unit until the publisher ID, CMP, privacy policy, and `ads.txt` are all in place.

**CSP:** the Solid SSR output includes a small inline hydration script. The initial policy uses `script-src 'self' 'unsafe-inline'` for that script and the local bundle. When AdSense is enabled, add only the required Google domains and document each exception. If a stricter policy is desired later, compute build-time hashes for the inline scripts and replace `'unsafe-inline'`.

### 6.3 Consent and policy

- Privacy policy discloses AdSense, cookies, analytics, local storage, and the no-upload behavior.
- Use Google's consent management (Privacy & Messaging) for EEA/UK/CH; document the setup.
- No ad load before consent where required.
- Ad containers labeled "Advertisement" and `aria-hidden` for screen readers where appropriate.

### 6.4 Future (not built now)

- Ad-free mode / Pro plan.
- Saved history and accounts.
- Premium tools (bulk processing, larger limits).
- Architecture leaves room: preferences, feature flags, and tool limits are centralized; no account code is added until there is demand.

---

## 7. Analytics

### 7.1 Provider adapter

`src/analytics/index.ts` exposes `track(event, props)` and `pageview(path)`. Provider is chosen by env (`none` default in dev).

**Selected provider: Plausible.** Load `script.js` with `data-domain`, defer it, and send custom events with `plausible(name, { props })`. Plausible is cookieless and does not require a consent banner for analytics; keep it out of the ad-consent decision. Adapters for Cloudflare Web Analytics and GA4 remain possible without touching tools. No provider-specific calls inside tools.

### 7.2 Events

| Event | When | Properties |
| --- | --- | --- |
| `page_view` | route change | path, category |
| `tool_view` | tool page mount | slug, category |
| `tool_first_input` | first interaction with tool | slug |
| `tool_complete` | successful result | slug, duration bucket |
| `copy_result` | copy action | slug, target |
| `share_result` | share action | slug, method |
| `related_click` | related tool click | from, to |
| `search_open` | search opened | source |
| `search_select` | result chosen | query_length, slug |
| `test_start` | test begins | slug, mode |
| `test_complete` | test ends | slug, score bucket |

Never collect: raw input, clipboard contents, JWT/JSON/text contents, exact query strings, or personal data. Query length only.

---

## 8. Performance

**Measured baseline (2026-11-23):** with the full 24-tool registry and the shared shell, the prerender reports 72.1 KB gzip initial JS and 18.7 KB gzip CSS. The registry metadata for 24 tools accounts for most of the growth over the scaffold's 51 KB. Lazy dialogs, the search palette, and every tool chunk stay out of the initial graph. The budget was raised from 65 KB to 75 KB at that measurement; keep it there unless the shell changes.

### 8.1 Budgets

| Metric | Budget |
| --- | --- |
| Home initial JS | ≤ 75 KB gzip |
| Tool page initial JS | ≤ 75 KB gzip |
| Tool-specific chunk | ≤ 20 KB gzip (most < 10 KB) |
| CSS | ≤ 30 KB gzip |
| Display font | ≤ 35 KB woff2 (one subset) |
| LCP (mobile lab) | ≤ 1.8 s |
| CLS | ≤ 0.02 |
| INP | ≤ 150 ms |
| TBT | ≤ 200 ms |
| Third-party JS | AdSense + analytics only, deferred |

### 8.2 Techniques

- Route-level `lazy` for every tool; hover/focus preload.
- No icon library, date library, diff library, UUID library, clipboard library, toast library, state library.
- Native APIs: `JSON`, `TextEncoder`, `crypto`, `Intl`, `performance`, `requestAnimationFrame`, `IntersectionObserver`, `navigator.share`, `navigator.clipboard`.
- Anime.js dynamically imported only on pages that animate.
- Static HTML + CSS first; hydration only where needed.
- The homepage catalog is server-rendered HTML; filtering is a small client enhancement.
- `content-visibility: auto` for long below-fold content where safe.
- One preloaded display font subset; no other font downloads.
- Build report with per-chunk gzip sizes; CI fails over budget.

---

## 9. Security and privacy

- Tool inputs never leave the browser. Enforced by tests that scan tool modules for `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, and third-party URLs.
- No `Math.random()` for UUIDs, passwords, random picks, shuffles, dice, or wheel winners. Use WebCrypto.
- No `innerHTML` with user content. No `eval`. Regex runs in a Worker with a timeout.
- No third-party widget, CDN, font, or image request from inside a tool. Tool chunks are self-contained.
- Input size caps with clear messages (JSON 5 MB, diff 2,000 lines, Base64 10 MB).
- Clipboard writes only on explicit user action.
- No secrets in URLs, logs, analytics, or localStorage.
- `localStorage` wrapped, namespaced, versioned; clear-all control in the UI.
- Security headers via Cloudflare `_headers`: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
- CSP: start conservative. The Solid SSR output includes a small inline hydration script; allow it explicitly and document the policy. Relax only for AdSense domains when ads go live, and document each exception.
- External links use `rel="noopener noreferrer"`.
- File tools read locally via `FileReader`/`ArrayBuffer`; no uploads.

---

## 10. Testing and QA

### 10.1 Automated

- **Unit (Vitest):** every `logic.ts`: JSON, Base64, URL, JWT, regex, UUID, timestamp, diff, font mapping, random distributions, timer state, test scoring.
- **Golden vectors:** crypto output against Node `crypto`; JSON against `JSON.parse`; encoding against `Buffer`; RFC 3339 timestamps; known JWT HS256/384/512 vectors. A ported function without a known-answer test is not done.
- **Component (Vitest + @solidjs/testing-library):** CopyButton, Tabs, Dialog focus, Search keyboard, AdSlot no-config, ToolShell states.
- **Agent smoke (ui-sdk):** `createAgent().snapshot()` finds named controls on search/forms; no secret or pasted content is exposed.
- **E2E (Playwright):** all 24 tool routes + hubs/static pages; metadata; no console errors; no horizontal overflow at 360px; core flows; keyboard navigation; axe scans.
- **Build checks:** links, SEO assertions, JSON-LD parse, bundle budgets, no-network-in-tools, no `Math.random` in security-sensitive modules.
- **CI (GitHub Actions):** typecheck, lint, unit, build + prerender checks, e2e, upload artifacts.
- **`npm run verify`:** typecheck + lint + unit + build + checks. The scaffold currently passes with **zero tests**; Phase 1 must replace that with real tests before the gate.

### 10.2 Manual

- Mobile: 360×640, 390×844, 768×1024; touch targets; keyboard overlays.
- Keyboard only: tab order, focus visible, dialog escape, tabs arrows.
- Screen reader: NVDA (Windows) or VoiceOver; labels, errors, live results.
- Reduced motion; high contrast; 200% zoom.
- Slow 4G throttling; no layout shift when ads load.
- No console errors/warnings in production preview.

---

## 11. Deployment

**Target:** Cloudflare Pages only for v1. No Workers, no runtime server, no database.

- Build: `npm run build` (Vite SSR build + prerender + checks).
- Output: `dist/client`.
- Cloudflare: `wrangler.toml` with `pages_build_output_dir = "dist/client"`; `_headers` and `_redirects` generated from the route manifest.
- Env: `SITE_URL`, `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_SLOT_*`, `VITE_PLAUSIBLE_DOMAIN`, `VITE_GSC_VERIFICATION`.
- Preview deployments for branches; production on `main`.
- CI: GitHub Actions runs `npm run verify` + Playwright, uploads the build report and test artifacts.
- Post-deploy: verify 200s, canonical, sitemap, robots, GSC, AdSense, analytics.
- Rollback: Cloudflare deployment history.
- Secondary target (Render) is a post-launch option. It is not part of the MVP and must not add a second header/redirect configuration until there is a real need.

---

## 12. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Solid 2 ecosystem is young | Build/runtime surprises | Pin exact versions; no alpha packages; smoke tests; framework-free tool logic; go/no-go gate after the JSON slice |
| Ported code is wrong (fake hash, `Math.random`, naive diff) | Trust and security damage | Golden-vector tests; reject the audited implementations; review every port against [PORTING.md](./PORTING.md) |
| Fabricated benchmarks or percentiles | E-E-A-T and policy damage | Reject HumanEval `benchmarks.ts`; show raw metrics only; no "top X%" without a real dataset |
| Thin content / AdSense rejection | No revenue | 10-tool MVP; 500+ words per developer tool; real examples; apply after 8 weeks of content |
| Keyword cannibalization (JSON trio, font trio) | Diluted rankings | Distinct titles, H1s, examples, FAQs; canonical self; internal links with descriptive anchors; monitor GSC |
| XSS via `innerHTML` or Markdown | Security | No `innerHTML` with user content; text nodes; sanitize any Markdown; CSP |
| ReDoS / UI freeze | Bad UX | Regex Worker with 750 ms timeout; JSON/diff size caps; clear errors |
| Privacy claim violation | Trust and legal | No `fetch` in tools; test-enforced; CSP allowlist only for analytics/ads; review every third-party script |
| Unicode font gaps | Broken-looking output | Per-style coverage tests; fallback to the original character; platform notes |
| iOS Safari timers/audio/PiP | Broken timer/test UX | Feature detection; gesture-unlocked audio; timestamp clock; test on iOS; PiP optional |
| AdSense + CSP/CMP on static Pages | Blocked ads or policy issues | Path-specific headers from the manifest; Google CMP; test EEA; document CSP exceptions |
| MIT attribution missing | License violation | `THIRD_PARTY_NOTICES.md`; header comments; link from footer/About; update in the same PR as the port |
| Name/trademark confusion (`oldmonk`, `HumanEval`, `Instagram`) | Brand/legal risk | Rename before launch; run a trademark/domain check; no rum imagery; disclaimer on the Instagram page |

---

## 13. Decisions and remaining questions

**Resolved**
- Design: **"The Catalog"**: warm stone paper, deep petrol, apricot highlights, plum/moss/rose category markers, Bitter slab serif, directory-style homepage, single-column tools with a wide mode, light + dark.
- Design system: lean Tailwind tokens + CSS variables; no variant library.
- Shell: top navigation + ⌘K command palette; theme toggle.
- Deployment: static output, **Cloudflare Pages only** for v1.
- Analytics: Plausible (pageviews + custom events).
- Scope: **24 tools**; **10-tool MVP**; Cron Generator deferred to v2.
- Ads: env-driven placeholders; no live ads until publisher ID, CMP, privacy, and approval.
- Testing: Playwright + axe + GitHub Actions; golden-vector unit tests for every parser/generator.
- Skills: `ui-sdk`, `frontend-design`, `free-tools`, `copywriting`.
- Content: I draft, you review.
- Cadence: vertical slice first (shell + homepage + JSON Formatter), then the MVP set, then v1.
- Base: keep the Solid 2 scaffold; do not fork the audited repos.
- Reuse: port framework-free logic and data only; record every port in [PORTING.md](./PORTING.md) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
- Rejected: devtoolkit HashGenerator/PasswordGenerator/UUID v4/QR/regex/Markdown; HumanEval benchmarks; pomo server/timer; fancy-fonts UI; random-picker UI.

**Still needed before launch**
1. **Final product name and domain.** Working name `oldmonk`, canonical placeholder `https://oldmonk.dev`. Run a trademark/domain check before metadata is indexed.
2. **Contact/legal:** contact email and legal entity/address for Privacy, Terms, and Contact.
3. **Logo:** resolved. The supplied artwork in `assets/logo/` is the only brand asset. The header and footer pair its mark with the site name in Bitter, and the full lockup is reserved for dark surfaces.
4. **Plausible domain:** add the site to Plausible, or leave analytics disabled until it exists?

**Defaults in use:** lowercase `oldmonk`; supplied mark plus the Bitter name; warm consumer voice; `hello@oldmonk.dev` as a placeholder contact; analytics disabled until `VITE_PLAUSIBLE_DOMAIN` is set; canonical falls back to `https://oldmonk.dev`; ads disabled until configured.

---

## 14. Build order

1. Freeze the stack. Commit the lockfile, pin exact versions, add `THIRD_PARTY_NOTICES.md` and `PORTING.md`. No dependency without a written reason. *(0.5 day)*
2. Add `src/tools/types.ts` (`ToolMeta`, `ToolComponentModule`, `ToolContentModule`, `ToolCategory`, `FAQItem`), `registry.ts`, and a registry validation test (unique slugs, related slugs exist). *(1 day)*
3. Add `src/seo/site.ts`, `src/seo/routes.ts`, `src/router.ts`, and the 404 route. Static routes before `/:slug`. *(1 day)*
4. Add `MetaTags`, `JsonLd`, `CanonicalLink`, `Breadcrumbs`; verify title/description/canonical/JSON-LD in SSR output. *(1 day)*
5. Build `SiteHeader`, `SiteFooter`, `Container`, `SkipLink`, mobile navigation, theme toggle. *(2 days)*
6. Build `ToolShell`, `ToolHeader`, `ToolPanel`, `ToolInput`, `ToolOutput`, `CopyButton`, `ResetButton`, `EmptyState`, `ErrorState`, `LoadingState`, `RelatedTools`. *(2 days)*
7. Build the JSON vertical slice: `logic.ts` with line/column errors, unit tests, `Tool.tsx`, `Content.tsx` with real copy and FAQ. *(2 days)*
8. Build the home catalog and category page: rows, inline filter, counts, empty state. *(2 days)*
9. Build `scripts/prerender.ts`: SEO assertions, link crawler, sitemap, robots, `_headers`, `_redirects`, `ads.txt`, build report. *(2 days)*
10. Design review and gate: desktop, mobile, keyboard, reduced motion, Lighthouse, axe. Decide Solid go/no-go. *(1 day)*
11. Build the text engine: port `fonts.json`, normalize the 3 malformed digit maps, pure conversion, coverage tests. Ship Fancy Text and Symbols. *(2–3 days)*
12. Build the random engine: port `secureRandomInt`, `secureShuffle`, `selectUnique`, candidate parsing, validation. Ship Name Picker and Spin Wheel. *(3 days)*
13. Build the clock engine: timestamp-based remaining time, `performance.now()`, visibility correction, audio unlock. Ship Pomodoro and Countdown. *(3 days)*
14. Build the test engine: shared scoring/audio/timing, keyboard and touch paths, `aria-live` at completion only. Ship Typing and Reaction. *(3 days)*
15. Add the search palette (ui-sdk Command), recent tools, inline filter, typed analytics events, Plausible adapter. *(2 days)*
16. Deploy the MVP to Cloudflare Pages; verify GSC, sitemap, post-deploy smoke. *(2 days)*
17. Build the remaining developer tools: JSON Validator/Minifier (shared core), Base64, URL, UUID, Timestamp, Diff, Regex. *(8 days)*
18. Content and internal links: 350–800 words per tool, how-to, limits, privacy, 3–5 FAQs, 3–6 related links, category intros, legal pages. *(5 days)*
19. Monetization and QA: AdSense slots, CMP, `ads.txt`, CSP test, bundle budgets, axe, Playwright, cross-browser, launch. *(4 days)*

Rationale: prove the hardest path (SSR → static HTML → hydration → metadata → catalog) with one tool before multiplying it. Then ship the reuse-heavy MVP, then finish the parser-heavy developer tools. The design gate catches system mistakes while they are cheap to fix.

---

## 15. Release 1 definition of done

- 24 tools work, with empty/error/loading states and honest limits.
- Every route is prerendered, indexable, and has unique metadata.
- Sitemap, robots, canonical, OG, JSON-LD, breadcrumbs all valid.
- No broken internal links; no console errors; no unnecessary network calls from tools.
- Mobile, keyboard, screen reader, reduced motion, and 200% zoom pass.
- Build, typecheck, lint, unit, component, and e2e checks pass; `npm run test` is no longer zero tests.
- Golden-vector tests cover every parser, encoder, crypto output, timer, and score calculation.
- Bundle and CWV budgets met in lab conditions.
- No fake numbers or unsupported claims anywhere in the rendered HTML.
- Ads render only when configured, without CLS; privacy policy, CMP, and `ads.txt` in place.
- Analytics events fire without collecting input or personal data.
- `THIRD_PARTY_NOTICES.md` lists every ported source; every ported file has a header comment.
- Cloudflare Pages deployment verified; GSC sitemap submitted.

---

## 16. Repo reuse and attribution

The full audit is in [Audit.md](./Audit.md); the exact port map and rejected code are in [PORTING.md](./PORTING.md); the MIT notices are in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

| Source | What we take | Destination | Status |
| --- | --- | --- | --- |
| devtoolkit | JWT base64url/HMAC helpers, URL query table, search scorer, recent-tools concept, cron presets (v2) | `src/tools/_shared/jwt.ts`, `_shared/url.ts`, `src/lib/search.ts`, `src/lib/recent-tools.ts` | Port / concept |
| HumanEval | Web Audio synth, reaction/sequence flow patterns, typing visualization, score shape | `src/tools/_shared/audio.ts`, test `logic.ts`, `src/lib/scores.ts` | Port / concept |
| fancy-fonts-generator | `fonts.json` (53 styles), conversion model, style transforms | `src/tools/_shared/unicode-fonts.data.ts`, `_shared/unicode.ts` | Copy data / rewrite engine |
| htmlapps-random-picker | RNG, shuffle, unique pick, candidate parsing, teams, wheel angle/canvas, storage wrappers | `src/tools/_shared/random.ts`, `_shared/candidates.ts`, `src/lib/storage.ts`, random/wheel tools | Port |
| pomo | Document PiP pattern, timer presets | `src/lib/pip.ts`, `src/tools/_shared/timer-presets.ts` | Port concept / copy data |

**Hard rejects:** devtoolkit HashGenerator, PasswordGenerator, UUID v4, QR generator, regex highlighter, Markdown viewer, `SEOHead`, HashRouter, AdBanner, GA service; HumanEval `benchmarks.ts`, bell curve, CGI tiers, neubrutalist UI; fancy-fonts UI, `innerHTML`, `execCommand`, Twemoji CDN; random-picker single-file UI and Dopa-Gaki; pomo `setInterval` timer, Jotai, server, auth, DB, SSE.

**Attribution rule:** a port is not done until `PORTING.md` and `THIRD_PARTY_NOTICES.md` are updated in the same change. Ported files carry a short header naming the source and license.

---

## 17. Estimated effort by phase

Assumes one senior engineer, full-time, with AI assistance, design tokens locked, and copy drafted by the same engineer. Add 20% buffer for review and content revisions.

| Phase | Scope | Engineer-days | Calendar |
| --- | --- | --- | --- |
| **Phase 1** | Platform + JSON slice + prerender + design gate | 12–15 | 2.5–3 weeks |
| **Phase 2** | MVP additions: JWT, Fancy, Symbols, Name Picker, Wheel, Pomodoro, Countdown, Typing, Reaction + search/analytics/deploy | 14–17 | 3 weeks |
| **Phase 3** | v1 additions: JSON Validator/Minifier, Base64, URL, UUID, Timestamp, Diff, Regex, Cursive, Instagram, Random Number, Dice, Memory, Click | 18–22 | 4 weeks |
| **Phase 4** | Content, internal links, ads/CMP, full QA, launch | 7–9 | 1.5–2 weeks |
| **Total** | 24 tools + platform | **51–63** | **10–12 weeks** |

With two people (platform/tools + content/QA), the same scope is 5–7 calendar weeks. A credible 10-tool MVP is 4–6 weeks solo. A 6-tool two-week launch is possible only as a demo, not a platform.
