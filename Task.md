# oldmonk: Task Plan

**Status:** Implemented 2026-11-23. The platform and the 24-tool catalog are in place. `npm run verify` passes: typecheck, lint, copy check, 606 unit tests, client and server build, prerender of 36 routes, SEO assertions, link crawl, content audit, and bundle budgets. Launch blockers are listed in the implementation status below.
**Shape:** 10-tool MVP, 24-tool v1, Cloudflare Pages only.
**Companion docs:** [Plan.md](./Plan.md), [Audit.md](./Audit.md), [PORTING.md](./PORTING.md), [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
**Legend:** `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Implementation status (2026-11-23)

| Area | State | Evidence |
| --- | --- | --- |
| Design tokens, Bitter, themes | Done | `src/styles/app.css`, light and dark token sets, zero-flash theme script |
| Shell | Done | header, footer, mobile drawer, search palette, theme toggle, skip link |
| Registry and routes | Done | 24 tools, 5 categories, `/json-tools`, 6 static pages, 404 |
| Tool pages | Done | 880px standard, 1200px wide for JSON, regex, and diff; spec grid on every page |
| Tool logic | Done | framework-free `logic.ts` per tool, 606 unit tests |
| Content | Done | 885 to 1731 rendered words per tool, 5 FAQs, 3 to 6 related links |
| SEO | Done | one title, description, canonical, H1, and valid JSON-LD per route |
| Prerender | Done | 36 routes, sitemap, robots, `_headers`, `_redirects`, build report |
| Bundle | Done | 72.1 KB initial gzip against a 75 KB budget; 18.7 KB CSS |
| Lighthouse (home, JSON, diff) | Done | accessibility 100, best practices 100, SEO 100 |
| Playwright and axe CI | Open | not installed; the browser smoke test was manual |
| Mobile and device review | Open | needs 360/390 real-device or emulated pass |
| OG image | Done | `public/brand/og-default.png` (1200x630) is derived by `npm run brand:assets`; `MetaTags` sets `og:image` and `twitter:image` |
| Legal entity and contact | Open | placeholder `hello@oldmonk.dev`; no entity name or address |
| Final name and domain | Open | `oldmonk` and `https://oldmonk.dev` are placeholders |
| Plausible domain | Open | analytics stays a no-op until `VITE_PLAUSIBLE_DOMAIN` is set |
| Ads | Deferred | env-driven no-op; no live ads before publisher ID and CMP |

The checkboxes below keep the original build order. Items marked done above are complete even where a fine-grained sub-box was not individually ticked.

---

## 0. Decisions and guardrails

- [~] **D-00** Confirm final brand, domain, and canonical `SITE_URL`. Working name `oldmonk`; placeholder `https://oldmonk.dev`.
- [x] **D-01** Design direction: **"The Catalog"**: warm stone paper, deep petrol, apricot highlights, plum/moss/rose category markers, Bitter slab serif, directory-style homepage, light + dark.
- [x] **D-01b** Design system: lean Tailwind tokens + CSS variables; no variant library.
- [x] **D-01c** Shell: top navigation + ⌘K command palette; theme toggle.
- [x] **D-01d** Skills: `ui-sdk`, `frontend-design`, `free-tools`, `copywriting`.
- [x] **D-01e** Content: I draft, user reviews.
- [x] **D-01f** Cadence: vertical slice first (shell + homepage + JSON Formatter), then MVP, then v1.
- [x] **D-02** AdSense: build env-driven placeholders; no live ads until publisher ID, CMP, privacy, and approval.
- [x] **D-03** Analytics: **Plausible** (pageviews + custom events).
- [x] **D-04** Deployment: static output; **Cloudflare Pages only** for v1. No Workers, no Render, no backend.
- [!] **D-05** Provide contact email and legal entity details for privacy/terms.
- [x] **D-06** Scope: **24 tools**; **10-tool MVP**; Cron Generator deferred to v2.
- [x] **D-07** Voice: neutral brand voice, English only, Playwright + GitHub Actions.
- [x] **D-08** Docs: `Audit.md`, `PORTING.md`, `THIRD_PARTY_NOTICES.md` created and linked.
- [x] **D-09** No fake numbers: no invented user counts, percentiles, benchmarks, ratings, or "studies show" claims.
- [x] **D-10** Reuse policy: port framework-free logic and data only; record every port; reject the audited unsafe code.

**Guardrails**
- Do not introduce React, Next, Astro, SolidStart, Kobalte, Radix, or a runtime backend.
- Do not send tool input over the network.
- Do not use `Math.random()` for UUIDs, passwords, picks, shuffles, dice, or wheel winners.
- Do not copy devtoolkit HashGenerator, PasswordGenerator, UUID v4, QR generator, regex highlighter, Markdown viewer, `SEOHead`, HashRouter, AdBanner, or GA service.
- Do not copy HumanEval `benchmarks.ts`, bell curve, CGI tiers, or neubrutalist UI.
- Do not copy fancy-fonts UI, `innerHTML` output, `execCommand`, `alert`, or Twemoji CDN.
- Do not copy random-picker's 2,205-line UI or Dopa-Gaki celebration.
- Do not copy pomo's `setInterval` timer, Jotai, server, auth, DB, or SSE.
- Do not hand-roll ARIA patterns ui-sdk already ships; read its docs per `AGENTS.md`.
- Do not add a dependency without a written reason in the PR/commit.
- Do not create a tool page without a real working tool and unique content.
- Do not place ads inside tool controls or above the tool on mobile.
- Do not ship placeholder copy, fake stats, or unfinished states.
- Update `PORTING.md` and `THIRD_PARTY_NOTICES.md` in the same change as any port.

---

## 1. Phase 1: Platform + JSON vertical slice (weeks 1–3)

### 1.0 Docs and porting foundation

- [x] **U-01** Install `@ui-sdk/solid@0.1.0-beta.13` and `@ui-sdk/core@0.1.0-beta.13` against Solid 2.0.3 / `@solidjs/web` 2.0.3.
- [x] **U-02** Exclude `@ui-sdk/core` from Vite dependency pre-bundling.
- [x] **U-03** Import `@ui-sdk/core/web.css` after Tailwind inside `layer(components)`; declare `@layer ui-sdk` first.
- [x] **U-04** Add the ui-sdk reading order to `AGENTS.md`.
- [x] **U-05** Install the `ui-sdk` skill with `npx skills@latest add vercel-labs/ui --skill ui-sdk`.
- [x] **U-06** Verify: typecheck, lint, build, SSR a ui-sdk `Button` as an anchor, 404 status correct.
- [x] **U-07** Install `anthropics/skills@frontend-design`, `coreyhaines31/marketingskills@free-tools`, and `coreyhaines31/marketingskills@copywriting`.
- [x] **U-08** Record the installed skills in `AGENTS.md` and use them for design, tool SEO, and page copy.
- [x] **U-09** Create `Audit.md`, `PORTING.md`, and `THIRD_PARTY_NOTICES.md`; link them from `Plan.md` and `Task.md`.
- [x] **U-10** Add the porting guardrails and rejected-code list to `AGENTS.md`.
- [ ] **U-11** Add a `PORTING.md` check to the PR template: source, destination, status, license notice, test.
- [ ] **U-12** Add the first ui-sdk-based shared primitive (CopyButton) and a component test.
- [ ] **U-13** Add the ui-sdk agent smoke test (`createAgent().snapshot()`).

### 1.1 Project setup

- [~] **P-01** Initialize `package.json`, ESM, Node `>=22.12`, npm scripts:
  - done: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `verify`
  - pending: `test:e2e`, `check:seo`, `check:links`, `check:bundle`
- [~] **P-02** Install pinned deps: `solid-js@2.0.3`, `@solidjs/web@2.0.3`, `@solidjs/router@2.0.1`, `@solidjs/meta@2.0.0`, `@solidjs/vite-plugin@3.0.1`, `vite@8.3.8`, `tailwindcss@4.3.5`, `@tailwindcss/vite@4.3.5`, `typescript@7.0.2`, `vitest@5.1.1`, `oxlint@1.94.0`.
  - pending: `animejs@4.5.0` when the first animation lands (wheel/timer only, lazy).
- [ ] **P-03** Dev-only: `@solidjs/diagnostics@2.0.3`, `@solidjs/testing-library@1.0.0-rc.2`, `jsdom`, `tsx`, `@playwright/test`, `@axe-core/playwright`.
- [x] **P-04** `vite.config.ts`: `solid({ start: true, ssr: true })` + Tailwind plugin + `optimizeDeps.exclude: ["@ui-sdk/core"]` + build target `esnext`.
- [x] **P-05** `tsconfig.json`: strict, `jsx: preserve`, `jsxImportSource: @solidjs/web`, `moduleResolution: bundler`, no `any` leaks.
- [~] **P-06** `oxlint` config; default lint passes; add explicit rules when the component layer lands.
- [~] **P-07** `.gitignore`, `.env.example`, `README.md` done; add `.editorconfig`.
- [x] **P-08** Verify `npm run build` produces `dist/client` + `dist/server/server.js` on the scaffold.
- [ ] **P-09** Add `npm run check:correctness` (golden vectors) and wire it into `verify`.

### 1.2 Design tokens and global shell

- [x] **P-10** Tokens in `src/styles/app.css` (`@theme`): The Catalog palette, light/dark values, radii, type scale, focus ring.
- [x] **P-11** `src/styles/app.css`: Tailwind import, ui-sdk layer, base layer, selection, scrollbar, reduced-motion rules.
- [x] **P-12** Self-host Bitter: Latin variable woff2 (33.3 KB) + OFL license, `font-display: swap`, preload in `document.tsx`.
- [x] **P-13** `src/document.tsx`: `lang="en"`, charset, viewport, theme-color, favicon, font preload, `HydrationScript`.
- [x] **P-13a** Copy rule: no em dashes. `npm run check:copy` scans `src/` and `public/`, and runs inside `npm run verify`.
- [x] **P-13b** Brand assets: `assets/logo/` is the only source. `npm run brand:assets` derives the header mark, favicons, app icons, and social card into `public/brand/`; `document.tsx` and `MetaTags` reference them.
- [ ] **P-14** `SiteHeader`: `oldmonk` wordmark, catalog nav, search trigger, theme toggle, mobile menu button.
- [ ] **P-15** `SiteFooter`: categories, about/legal/contact, privacy line, copyright, `THIRD_PARTY_NOTICES` link.
- [ ] **P-16** `MobileNavigation`: compose `@ui-sdk/solid/drawer` (or dialog); focus trap, escape, scroll lock, focus return.
- [ ] **P-17** `SkipLink`, `Container`, `PageHeader`.
- [~] **P-18** Theme: `prefers-color-scheme` default works; add explicit toggle persisted with `@ui-sdk/core` preferences and the pre-hydration `Preferences` script.
- [x] **P-19** 404 page: helpful links, `noindex`, `httpStatus(404)`, ui-sdk Button.

### 1.3 Router, registry, and page templates

- [x] **P-20** `src/tools/types.ts` with `ToolMeta`, `ToolComponentModule`, `ToolContentModule`, `ToolCategory`, `FAQItem`.
- [x] **P-21** `src/tools/registry.ts`: curated array (shipped tools only, no dead routes) + slug map + validation (unique slugs, slug format, category, copy lengths, ISO dates). Related resolution is split into `findMissingRelated` for the build link check, so the registry can grow one tool at a time.
- [x] **P-22** `src/content/categories.ts`: slug, name, title, description, intro, order. No `icon` field: the category marker is the 6px dot plus tint chip from `design/REFERENCES.md` §6, and no icon library is installed.
- [ ] **P-23** `src/seo/routes.ts`: single source of truth for canonical routes, sitemap, prerender, search.
- [ ] **P-24** `src/router.ts`: explicit routes, `intentPreload()`, static routes before `/:slug`.
- [ ] **P-25** `HomePage`: "The Catalog": compact hero, inline catalog search, five category sections with every tool as a row (name + one-line + category marker).
- [ ] **P-25a** Catalog row anatomy per `design/REFERENCES.md` §4: one solid rule above, no card or shadow, mono metadata (12px, `0.03em`) on the shared baseline, 96/64/32/16 spacing.
- [ ] **P-26** `CategoryPage` and `TopicPage`: same catalog rows, category intro, sibling links.
- [ ] **P-27** `ToolPage`: single column, tool first, breadcrumbs, metadata, 404 handling.
- [ ] **P-27a** Wide mode: 1200px workspace for diff, regex, and JSON tree; standard 880px elsewhere.
- [ ] **P-27b** Spec grid per `design/REFERENCES.md` §5: two columns, 48px/40px gaps, label 13px muted, value 15px ink; ships with the first tool page.
- [ ] **P-28** Static pages: About, Privacy, Terms, Contact (real copy, no placeholders).
- [ ] **P-29** Verify client navigation + deep-link hydration for `/`, a category, and one tool.

### 1.4 ToolShell and shared tool UI

- [ ] **P-30** `ToolShell`: breadcrumbs, header, badges, tool slot, content slot, related tools, ad slots.
- [ ] **P-31** `ToolHeader`: H1, summary, category link, "runs in your browser" badge, last updated.
- [ ] **P-32** `ToolPanel`: bordered surface, optional toolbar, responsive padding.
- [ ] **P-33** `ToolInput` / `ToolOutput`: label, hint, error, character/size count, monospace option.
- [ ] **P-34** `CopyButton`: ui-sdk `Button` + clipboard API fallback, success state, announcement, keyboard.
- [ ] **P-35** `ResetButton` (ui-sdk `Button`), `ResultCard`, `EmptyState`, `ErrorState`, `LoadingState`.
- [ ] **P-36** `Breadcrumbs` with `BreadcrumbList` schema.
- [ ] **P-37** `RelatedTools`: 3–6 cards, analytics event, no broken slugs.
- [ ] **P-38** Styled wrappers around ui-sdk `Button`, `Field`, `Input`, `Textarea`, `Select`; plus `Badge`, `Kbd`, `IconButton` styling.
- [ ] **P-39** Read the relevant ui-sdk component page before using each part; no hand-rolled ARIA roles.

### 1.5 UI primitives (ui-sdk)

- [ ] **P-40** `Dialog`: compose `@ui-sdk/solid/dialog` parts; style from `data-slot`/state.
- [ ] **P-41** `Tabs`: compose `@ui-sdk/solid/tabs`; keep arrow/Home/End and `aria-controls`.
- [ ] **P-42** `SegmentedControl`: compose `@ui-sdk/solid/segmented-control`.
- [ ] **P-43** `Switch` and `Slider`: compose `@ui-sdk/solid/switch` and `@ui-sdk/solid/slider`.
- [ ] **P-44** `Tooltip`: compose `@ui-sdk/solid/tooltip`; style enter/exit with `data-starting-style` / `data-ending-style`.
- [ ] **P-45** `Toast`: compose `@ui-sdk/solid/toast` parts and mount `OverlayHost` near the app root.
- [ ] **P-46** Keyboard + screen-reader smoke test for every composed primitive.
- [ ] **P-47** Confirm no `role="dialog|tablist|listbox|menu|switch|slider|radiogroup|toolbar"` is written by hand.

### 1.6 SEO and prerender pipeline

- [ ] **P-50** `src/seo/site.ts`: name, URL, title template, description, social image, locale.
- [ ] **P-51** `MetaTags`: title, description, canonical, OG, Twitter, robots.
- [ ] **P-52** `JsonLd`: `WebApplication`, `BreadcrumbList`, `FAQPage`, `WebSite`, `Organization`.
- [ ] **P-53** `scripts/prerender.ts`:
  - request every route via `handleRequest`
  - assert status/title/description/canonical/H1/JSON-LD
  - write flat `<route>.html` + `index.html` + `404.html`
  - generate `sitemap.xml`, `robots.txt`
  - generate `_headers`, `_redirects`, `ads.txt`
  - crawl internal links; fail on broken
  - write `dist/build-report.json`
- [ ] **P-54** `scripts/check-seo.ts`: title/description/canonical/H1/JSON-LD assertions, runnable on its own.
- [ ] **P-55** `scripts/check-links.ts`: internal link crawler, runnable on its own.
- [ ] **P-56** `scripts/check-bundle.ts`: gzip budgets per entry/chunk.
- [ ] **P-57** `scripts/serve-static.ts`: production-like preview with pretty URLs and 404.
- [ ] **P-58** Validate static HTML in a browser: hydration, navigation, no console errors.
- [ ] **P-59** Verify canonical/trailing-slash behavior on Cloudflare Pages preview.

### 1.7 Search

- [ ] **P-60** `SearchDialog`: compose `@ui-sdk/solid/command` inside a dialog; Cmd/Ctrl+K, `/` shortcut, input label.
- [ ] **P-61** Custom scorer over registry: name, keywords, category; no Fuse.js. Port the `matchesTool` concept from devtoolkit.
- [ ] **P-62** Rely on ui-sdk Command for keyboard/ARIA; verify arrow keys, Enter, Escape, empty state, recent tools.
- [ ] **P-63** Analytics: `search_open`, `search_select` (length only, no query text).
- [ ] **P-64** Inline catalog filter on home/category: same scorer, live result count, hide empty categories, no-results message.
- [ ] **P-65** Lazy-load the ⌘K palette so it stays out of the initial homepage bundle.

### 1.8 Analytics and ads scaffolding

- [ ] **P-70** `src/analytics/index.ts`: `track`, `pageview`, provider adapter, dev no-op.
- [ ] **P-71** Event names/props typed; no free-form payloads.
- [ ] **P-72** Plausible adapter: deferred script with `data-domain`, custom events via `plausible(name, { props })`, disabled when `VITE_PLAUSIBLE_DOMAIN` is unset.
- [ ] **P-73** `src/monetization/config.ts`: env parsing, placements, enabled flag.
- [ ] **P-74** `AdSlot`: no-config no-op, reserved height, lazy init, label, debug outlines.
- [ ] **P-75** Consent hook (provider-agnostic), documented AdSense CMP integration.
- [ ] **P-76** Privacy policy covers ads, analytics, storage, and local-only processing.

### 1.9 JSON Formatter vertical slice

- [ ] **T-100** `logic.ts`: parse, pretty-print (2/4/tab), sort keys, JSON error with line/column, size cap.
- [ ] **T-101** UI: input/output, indent control, sort toggle, copy, download, clear, sample.
- [ ] **T-102** Error state: exact location, human message, no stack traces.
- [ ] **T-103** Content: what formatting does, indentation choice, large-file limits, FAQ.
- [ ] **T-104** Unit tests: valid/invalid, unicode, nested, duplicate keys, 5 MB cap, error line/column.
- [ ] **T-105** E2E: paste → format → copy; invalid JSON shows error.
- [ ] **T-106** Add `meta.ts` with title/description/keywords/related and `loadTool`/`loadContent`.

### 1.10 Design and framework gate

- [ ] **G-01** Desktop 1280/1440 review: palette, Bitter, row anatomy against `design/REFERENCES.md` §4, hero, no AI-default tells, light and dark.
- [ ] **G-02** Mobile 360/390/768 review: layout, touch targets, no overflow.
- [ ] **G-03** Keyboard-only pass on home, category, JSON page.
- [ ] **G-04** Reduced motion, 200% zoom, high contrast.
- [ ] **G-05** Lighthouse/PSI on the JSON page; CWV budgets.
- [ ] **G-06** **Go/no-go:** if Solid 2 blocked progress >2 working days, switch the shell to React + Vite + custom prerender and keep `logic.ts` unchanged.

---

## 2. Phase 2: MVP additions (weeks 4–6)

Ship 9 more tools, then deploy the 10-tool MVP.

### 2.1 JWT Decoder

- [ ] **T-200** Port `base64UrlToBytes`, `bytesToBase64Url`, `decodeJsonSegment`, HMAC verify from devtoolkit; add tests.
- [ ] **T-201** UI: token input, header/payload panels, claims table, expiry status, copy, sample.
- [ ] **T-202** Explicit "signature not verified" default; optional HMAC verify with secret; no network.
- [ ] **T-203** Content: JWT structure, claims, expiry, security warnings, FAQ.
- [ ] **T-204** Unit tests: valid, malformed, unicode, missing parts, invalid base64url, expired, nbf.
- [ ] **T-205** E2E: sample token → claims + expiry badge.

### 2.2 Fancy Text Generator

- [ ] **T-210** Port `fonts.json` to `unicode-fonts.data.ts`; normalize the 3 malformed digit maps or mark experimental.
- [ ] **T-211** `logic.ts`: style maps (bold, italic, script, fraktur, double-struck, circled, fullwidth, small caps, upside down, strikethrough), per-character fallback.
- [ ] **T-212** UI: input, style grid, live preview, copy per style, copy all, clear.
- [ ] **T-213** Coverage tests: every A–Z/a–z/0–9 for every style; no broken surrogates.
- [ ] **T-214** Content: Unicode styles, platform support, why some letters fall back, accessibility warning, FAQ.
- [ ] **T-215** E2E: type → style updates → copy.

### 2.3 Symbol Copy Tool

- [ ] **T-220** `data.ts`: categories (hearts, stars, arrows, currency, math, punctuation, aesthetic, games), names + keywords.
- [ ] **T-221** UI: search, category filter, grid, click-to-copy, recently used, copy all visible.
- [ ] **T-222** Accessibility: buttons with names, no hover-only copy, count.
- [ ] **T-223** Content: how Unicode symbols work, font support, FAQ.
- [ ] **T-224** Unit tests: unique symbols, search, category coverage; E2E: search "heart" → copy.

### 2.4 Random Name Picker

- [ ] **T-230** Port `secureRandomInt`, `secureShuffle`, `selectUnique`, `parseCandidates`, `modeError` from random-picker; add tests.
- [ ] **T-231** `logic.ts`: parse names (lines/commas), no-repeat, history, remove winner, teams (round-robin).
- [ ] **T-232** UI: name list, count, pick, winner card, history, reset, sample, teams.
- [ ] **T-233** Content: fair picking, classroom/giveaway use, no-repeat, crypto fairness, FAQ.
- [ ] **T-234** Unit tests: parsing, no-repeat, empty/single, whitespace, duplicates distinct, team sizes.
- [ ] **T-235** E2E: add names → pick → winner visible.
- [ ] **T-236** Optional: spreadsheet paste column detection.

### 2.5 Spin Wheel

- [ ] **T-240** Port `wheelStopAngle` and the DPR-aware canvas drawing from random-picker; simplify to one style.
- [ ] **T-241** `logic.ts`: entries, optional weights (v1: equal probability), crypto selection, angle mapping.
- [ ] **T-242** UI: SVG/canvas wheel, entries editor, spin, result, history, sound toggle.
- [ ] **T-243** Anime.js dynamic import; 2–3s spin; reduced-motion instant result.
- [ ] **T-244** Accessibility: list alternative, keyboard spin, `aria-live` result.
- [ ] **T-245** Content: weighted wheels (v1 equal), fairness, classroom/giveaway ideas, FAQ.
- [ ] **T-246** Unit tests: selection distribution, angle mapping, empty/one entry.
- [ ] **T-247** E2E: spin → result announced.

### 2.6 Pomodoro Timer

- [ ] **T-250** `logic.ts`: state machine (work/short break/long break), cycle count, duration settings.
- [ ] **T-251** UI: ring, time, start/pause/reset, skip, mode tabs, settings, session count.
- [ ] **T-252** `performance.now()` timing; drift correction on visibility change; title update.
- [ ] **T-253** Web Audio chime (user gesture unlock), optional notifications, wake lock where supported.
- [ ] **T-254** Persist settings + today's count in `localStorage`; reset control.
- [ ] **T-255** Accessibility: `aria-live` at mode changes only, keyboard controls, reduced motion.
- [ ] **T-256** Content: Pomodoro method, settings advice, FAQ.
- [ ] **T-257** Unit tests: transitions, long-break cadence, duration changes, pause/resume; E2E: start → pause → reset.
- [ ] **T-258** Optional: Document PiP via `src/lib/pip.ts`.

### 2.7 Countdown Timer

- [ ] **T-260** `logic.ts`: parse HH:MM:SS, target timestamp, remaining, finish event.
- [ ] **T-261** UI: presets (1/5/10/25 min), custom input, start/pause/reset, ring, finish state.
- [ ] **T-262** Background-tab accuracy; audio alarm; title update; notification optional.
- [ ] **T-263** Accessibility: no per-second announcements; finish announced; keyboard.
- [ ] **T-264** Content: countdown use cases, background-tab behavior, FAQ.
- [ ] **T-265** Unit tests: parsing, remaining, finish, zero/negative, pause.
- [ ] **T-266** E2E: 5s countdown → finish state.

### 2.8 Typing Speed Test

- [ ] **T-270** `logic.ts`: WPM (5 chars/word), raw WPM, accuracy, consistency, per-char states.
- [ ] **T-271** Original practice passages (public-domain or written for oldmonk); 15/30/60s modes.
- [ ] **T-272** UI: passage, caret, live stats, restart, results card, best score.
- [ ] **T-273** Input capture: hidden input + `beforeinput`, mobile keyboard, paste blocked with notice.
- [ ] **T-274** High-resolution timing (`performance.now()`), no timer drift.
- [ ] **T-275** Result share card (canvas → PNG) + Web Share/copy/download.
- [ ] **T-276** Content: how WPM is calculated, accuracy, limitations, FAQ.
- [ ] **T-277** Unit tests: WPM/accuracy math, edge cases, per-char state; E2E: 15s test via simulated typing → result card.

### 2.9 Reaction Time Test

- [ ] **T-280** `logic.ts`: rounds, random delay, early click, mean/median/best, outlier note.
- [ ] **T-281** UI: start, waiting, click now, result, 5-round summary, replay, best.
- [ ] **T-282** Mobile touch + keyboard (space); prevent scroll/zoom during wait.
- [ ] **T-283** Result share card; no fake percentile claims.
- [ ] **T-284** Content: what reaction time measures, factors, limitations, FAQ.
- [ ] **T-285** Unit tests: stats, early click, round flow.
- [ ] **T-286** E2E: 5 rounds → summary.

### 2.10 MVP launch

- [ ] **L-01** Build the MVP: 10 tools + hubs + legal pages.
- [ ] **L-02** Run `npm run verify`; `npm run test` must not be zero tests.
- [ ] **L-03** Deploy to Cloudflare Pages; configure `SITE_URL`.
- [ ] **L-04** Verify 10 routes, canonicals, sitemap, robots, 404.
- [ ] **L-05** GSC property + sitemap submission.
- [ ] **L-06** Plausible pageviews + events (if domain exists).
- [ ] **L-07** Lighthouse/PSI on home + 3 tools; fix regressions.
- [ ] **L-08** MVP retro: what reuse worked, what to change before v1.

---

## 3. Phase 3: v1 completion (weeks 7–10)

### 3.1 JSON Validator and Minifier

- [ ] **T-300** Share `json/parse.ts` with the formatter; add error codes and line/column.
- [ ] **T-301** JSON Validator UI: verdict, error location, jump-to-line, sample invalid JSON.
- [ ] **T-302** JSON Minifier UI: byte before/after, percent saved, copy/download.
- [ ] **T-303** Content: syntax rules, common errors, when to minify, gzip note, FAQ.
- [ ] **T-304** Unit tests: trailing commas, comments, single quotes, unquoted keys, BOM, unicode bytes.
- [ ] **T-305** E2E: invalid → error line; valid → success; minify → parses.
- [ ] **T-306** Keep titles/descriptions distinct from the formatter; cross-link the trio.
- [ ] **T-307** Add both tools to the registry, sitemap, and related graph.

### 3.2 Base64

- [ ] **T-310** `logic.ts`: text encode/decode with `TextEncoder`/`TextDecoder`, URL-safe, file bytes, size cap.
- [ ] **T-311** UI: text/file tabs, encode/decode, URL-safe toggle, copy/download, size.
- [ ] **T-312** Error handling: invalid Base64, non-UTF-8 bytes, size cap.
- [ ] **T-313** Content: what Base64 is, URL-safe variant, 33% overhead, privacy, FAQ.
- [ ] **T-314** Unit tests: ASCII, emoji, CJK, binary, URL-safe, invalid input.
- [ ] **T-315** E2E: text round-trip; file round-trip; invalid input error.

### 3.3 URL Encoder / Decoder

- [ ] **T-320** `logic.ts`: `encodeURIComponent`, `encodeURI`, query builder, decode errors.
- [ ] **T-321** UI: mode switch, encode/decode, query param table, copy.
- [ ] **T-322** Content: component vs full URL, reserved chars, `+` vs `%20`, FAQ.
- [ ] **T-323** Unit tests: spaces, `&`, `=`, unicode, malformed percent sequences.
- [ ] **T-324** E2E: encode → decode round-trip.
- [ ] **T-325** Port the query-table editing pattern from devtoolkit `UrlParser`.

### 3.4 UUID Generator

- [ ] **T-330** `logic.ts`: v4 via `crypto.randomUUID`/`getRandomValues`; v7 with timestamp; bulk; format options.
- [ ] **T-331** UI: count (1–1000), version, uppercase, hyphens, copy all, download.
- [ ] **T-332** Content: v4 vs v7, collision odds, when to use, FAQ.
- [ ] **T-333** Unit tests: format regex, version/variant bits, v7 monotonic timestamp, uniqueness.
- [ ] **T-334** E2E: generate 100 → copy → count.
- [ ] **T-335** Explicitly reject the devtoolkit `Math.random()` implementation.

### 3.5 Timestamp Converter

- [ ] **T-340** `logic.ts`: detect seconds/ms, parse ISO, local/UTC, relative time, timezone formatting.
- [ ] **T-341** UI: live "now", input, unit switch, timezone select, result table, copy.
- [ ] **T-342** Content: Unix time, seconds vs ms, timezones, leap seconds, FAQ.
- [ ] **T-343** Unit tests: s/ms boundaries, ISO, invalid, DST-sensitive zones.
- [ ] **T-344** E2E: convert now → ISO → back.
- [ ] **T-345** Reject the devtoolkit seconds-only assumption.

### 3.6 Diff Checker

- [ ] **T-350** `logic.ts`: Myers line diff, inline word/char diff, unified output, ignore whitespace/case.
- [ ] **T-351** UI: two panes, side-by-side/unified, stats (+/−), copy patch, swap, sample.
- [ ] **T-352** Limits: 2,000 lines / 200 KB per side; clear message.
- [ ] **T-353** Content: diff algorithm, line vs word, whitespace options, FAQ.
- [ ] **T-354** Unit tests: insert/delete/replace, identical, whitespace, unicode, large input guard.
- [ ] **T-355** E2E: paste two texts → diff → swap.
- [ ] **T-356** Do not port the devtoolkit line-index comparison.

### 3.7 Regex Tester

- [ ] **T-360** `logic.ts`: compile flags, matches, capture groups, named groups, indices, replace.
- [ ] **T-361** Web Worker execution with 750ms timeout; terminate on hang; clear message.
- [ ] **T-362** UI: pattern, flags toggles, test text, highlighted matches, group table, replace preview.
- [ ] **T-363** Pattern library: email, URL, date, whitespace, digits (insert, don't auto-run).
- [ ] **T-364** Content: flags, groups, greedy/lazy, backtracking warning, FAQ.
- [ ] **T-365** Unit tests: flags, groups, unicode, zero-length matches, timeout path.
- [ ] **T-366** E2E: pattern → matches; invalid pattern → error; replace preview.
- [ ] **T-367** No `innerHTML`; highlight with text nodes or safe spans.

### 3.8 Cursive Text and Instagram Fonts

- [ ] **T-370** Cursive: curated script families from `fonts.json`; uppercase gaps and fallback rules.
- [ ] **T-371** Cursive UI: focused style list, preview, copy, character count.
- [ ] **T-372** Cursive content: cursive Unicode vs real fonts, where it renders, FAQ.
- [ ] **T-373** Cursive tests: known gaps, fallback, mixed input; E2E: type → copy.
- [ ] **T-374** Instagram: curated bio styles, 150-char counter, line breaks, copy.
- [ ] **T-375** Instagram content: bio limits, which styles render, caption vs bio, disclaimer, FAQ.
- [ ] **T-376** Instagram tests: counter, line breaks, style coverage; E2E: type bio → counter → copy.
- [ ] **T-377** Ensure Instagram page is materially different from Fancy Text and Cursive.
- [ ] **T-378** No Instagram logo or brand assets; "Not affiliated with Instagram."

### 3.9 Random Number and Dice

- [ ] **T-380** Random Number `logic.ts`: crypto rejection sampling, min/max, integer/decimal, unique, bulk.
- [ ] **T-381** Random Number UI: range, count, unique toggle, generate, history, copy.
- [ ] **T-382** Random Number content: fairness, crypto vs `Math.random`, uniqueness, FAQ.
- [ ] **T-383** Random Number tests: bounds, distribution sanity, unique mode, invalid ranges; E2E: generate 10 in range.
- [ ] **T-384** Dice `logic.ts`: d4/d6/d8/d10/d12/d20/d100, count, modifier, crypto rolls, notation parser.
- [ ] **T-385** Dice UI: dice picker, count, modifier, roll, total, individual dice, history.
- [ ] **T-386** Dice content: notation (2d6+1), fairness, tabletop use, FAQ.
- [ ] **T-387** Dice tests: bounds per die, modifier, count, notation; E2E: roll 2d6+1 → total + dice.

### 3.10 Sequence Memory and Click Speed

- [ ] **T-390** Sequence `logic.ts`: sequence generation, level progression, input validation, scoring.
- [ ] **T-391** Sequence UI: 3×3 grid, playback, input phase, level, mistakes, best.
- [ ] **T-392** Sequence accessibility: keyboard 1–4, audio tones, reduced-motion playback, `aria-live` status.
- [ ] **T-393** Sequence content: what it measures, strategy, limitations, FAQ.
- [ ] **T-394** Sequence tests: sequence, level advance, wrong input, scoring; E2E: play a short sequence via keyboard.
- [ ] **T-395** Click `logic.ts`: 10s window, click count, CPS, intervals, consistency.
- [ ] **T-396** Click UI: big target, timer, CPS, clicks, result, replay, best.
- [ ] **T-397** Click accessibility: spacebar support, mobile tap, no double-count, reduced motion.
- [ ] **T-398** Click content: CPS calculation, device/browser factors, FAQ.
- [ ] **T-399** Click tests: CPS, duration, interval stats, zero clicks; E2E: click 10 times → result.

---

## 4. Phase 4: Content, SEO, and internal linking (weeks 11–12)

> Task phases 4–7 are workstreams inside **Plan Phase 4**. They are separate checklists so content, monetization, QA, and deploy can run in parallel.

- [ ] **C-00** Use the `free-tools` skill to validate tool intent and page angle before writing; use `copywriting` for drafts.
- [ ] **C-01** Draft unique content for all 24 tools (intro, how-to, explanation, privacy, 3–5 FAQ); user reviews and approves.
- [ ] **C-01a** Lock the content pattern on JSON Formatter first, then replicate.
- [ ] **C-02** Write category intros (5) and `/json-tools` topic intro.
- [ ] **C-03** Write About, Privacy, Terms, Contact (real, specific, no template filler).
- [ ] **C-04** Define related-tool graph; verify every link resolves.
- [ ] **C-05** Add breadcrumbs and contextual links on every page.
- [ ] **C-06** Review title/description lengths and uniqueness.
- [ ] **C-07** Validate JSON-LD for every page type.
- [ ] **C-08** Review content for duplicate boilerplate and thin sections.
- [ ] **C-09** Add real `updated` dates; no fake freshness.
- [ ] **C-10** **No fake numbers check:** grep rendered HTML for "percentile," "top %," "studies show," "users," "million," "rated," "reviewed." Remove or substantiate.
- [ ] **C-11** Generate and inspect sitemap/robots; submit to GSC.
- [ ] **C-12** Verify no indexable 404/legal/test-thank-you pages.

---

## 5. Phase 5: Monetization and analytics (after MVP content)

- [ ] **M-01** Add AdSense client/slot env values (or keep disabled).
- [ ] **M-02** Place `AdSlot`s per plan; verify reserved heights and no CLS.
- [ ] **M-03** Verify no ad inside tool panels; max 2 per page.
- [ ] **M-04** Add `ads.txt` when publisher ID exists.
- [ ] **M-05** Integrate Google CMP / consent; verify no ad requests before consent where required.
- [ ] **M-06** Privacy policy and cookie disclosure reviewed.
- [ ] **M-07** Plausible configured (`VITE_PLAUSIBLE_DOMAIN`); pageviews + custom events verified in debug.
- [ ] **M-08** Verify no PII/input in event payloads.
- [ ] **M-09** Test with ad blocker: layout intact, no errors.
- [ ] **M-10** Measure CWV with ads on and off; document the CSP exception list.

---

## 6. Phase 6: QA and hardening

### 6.1 Automated gates

- [ ] **Q-01** `npm run typecheck`: 0 errors.
- [ ] **Q-02** `npm run lint`: 0 errors/warnings.
- [ ] **Q-02a** No em dashes: `npm run check:copy` passes (runs inside `verify`).
- [ ] **Q-03** `npm run test`: all unit/component tests pass; not zero tests.
- [ ] **Q-04** `npm run test:e2e`: all routes/flows pass.
- [ ] **Q-05** `npm run build`: succeeds; prerender checks pass.
- [ ] **Q-06** Link checker: 0 broken internal links.
- [ ] **Q-07** Bundle budgets: pass; tool chunks ≤20 KB gzip.
- [ ] **Q-08** Axe scans: no serious/critical violations.
- [ ] **Q-09** SEO assertions: titles/descriptions/canonicals/JSON-LD valid.
- [ ] **Q-10** No-network test: tool modules make no requests.
- [ ] **Q-11** Golden vectors: crypto/JSON/encoding/JWT/timers/scores.
- [ ] **Q-12** GitHub Actions runs typecheck, lint, unit, build + prerender, e2e; artifacts uploaded.
- [ ] **Q-13** ui-sdk agent smoke: `createAgent().snapshot()` finds named search/form controls; no input or secrets leak.
- [ ] **Q-14** `THIRD_PARTY_NOTICES.md` matches every ported file; headers present.

### 6.2 Manual gates

- [ ] **Q-19** Design review of the MVP against The Catalog brief: palette, Bitter, catalog rows, hero, mobile, no AI-default tells.
- [ ] **Q-20** Mobile 360/390/768: layout, touch targets, keyboard, no overflow.
- [ ] **Q-21** Desktop 1280/1440: layout, code blocks, long output.
- [ ] **Q-22** Keyboard-only full pass on home, category, 4 representative tools.
- [ ] **Q-23** Screen reader pass: labels, errors, results, timer state, test results.
- [ ] **Q-24** Reduced motion + 200% zoom + high contrast.
- [ ] **Q-25** Slow 4G: LCP/CLS/INP within budget.
- [ ] **Q-26** Production preview: no console errors, no 404 assets, correct headers.
- [ ] **Q-27** Ad slots: no CLS, no broken containers, no ads in dev.
- [ ] **Q-28** Cross-browser: Chrome, Firefox, Safari (desktop + iOS Safari), Edge.

### 6.3 Security/privacy review

- [ ] **Q-30** No `innerHTML`/`eval` with user input.
- [ ] **Q-31** Regex worker timeout verified with a catastrophic pattern.
- [ ] **Q-32** Size caps verified.
- [ ] **Q-33** No secrets in client bundle (`grep` for keys/tokens).
- [ ] **Q-34** Security headers present; CSP documented.
- [ ] **Q-35** localStorage clear-all works; no sensitive content stored.
- [ ] **Q-36** No third-party request from any tool route.

---

## 7. Phase 7: Deploy and launch

- [ ] **L-10** Create Cloudflare Pages project; connect repo or deploy via CLI.
- [ ] **L-11** Configure `SITE_URL`, `VITE_PLAUSIBLE_DOMAIN`, and ad env vars for production.
- [ ] **L-12** Verify `_headers`, `_redirects`, pretty URLs, 404.
- [ ] **L-13** Run post-deploy smoke: 24 routes, sitemap, robots, canonical, OG.
- [ ] **L-14** Add GSC property; verify; submit sitemap.
- [ ] **L-15** Apply for AdSense (if not already); add `ads.txt`; verify site.
- [ ] **L-16** Verify Plausible pageviews and custom events.
- [ ] **L-17** Run Lighthouse/PSI on production home + 3 tool pages.
- [ ] **L-18** Set up uptime/error monitoring (Cloudflare or simple external check).
- [ ] **L-19** Tag release; write launch notes.
- [ ] **L-20** Replace `oldmonk`/`oldmonk.dev` if the final name/domain changed; re-run canonical checks.

---

## 8. Per-tool definition of done

A tool is done only when all are true:

- [ ] Route exists, resolves from registry, and deep-links.
- [ ] Tool works with real input; no mocked result.
- [ ] Empty, error, and success states are designed.
- [ ] Input limits and edge cases are handled with clear messages.
- [ ] `logic.ts` is framework-free, has no DOM/fetch/storage, and is unit-tested.
- [ ] Golden vectors cover the parser/generator/crypto path.
- [ ] Tool chunk is lazy-loaded and ≤20 KB gzip.
- [ ] No network request from tool logic or UI (test enforced).
- [ ] No `Math.random()` for security-sensitive output.
- [ ] Mobile layout works at 360px; no horizontal page scroll.
- [ ] Keyboard-only path works; focus visible; labels present.
- [ ] Screen-reader result/error announcements work.
- [ ] Reduced motion respected.
- [ ] Copy/share/reset actions work where relevant.
- [ ] Unique title, description, canonical, H1, JSON-LD.
- [ ] Unique content: how-to, explanation, privacy, FAQ.
- [ ] No fake numbers or unsupported claims.
- [ ] 3–6 related tools, all valid.
- [ ] Analytics events fire (`tool_view`, `tool_first_input`, `tool_complete` where applicable).
- [ ] E2E smoke test passes; no console errors.
- [ ] Added to category page, search, sitemap, and link graph.
- [ ] Any port recorded in `PORTING.md`; notice present in `THIRD_PARTY_NOTICES.md`.

---

## 9. Post-launch backlog

Prioritize by Search Console demand, not by count.

### v1.1

- [ ] Case Converter
- [ ] Word / Character Counter
- [ ] Hash Generator (real WebCrypto SHA-1/256/384/512; MD5 only with a vetted implementation)
- [ ] Color Converter
- [ ] Lorem Ipsum Generator
- [ ] Saved lists for Random Name Picker
- [ ] PWA/offline mode (evaluate)
- [ ] Share cards for tests

### v2

- [ ] Cron Generator / Parser
- [ ] QR Code Generator (local library, no network)
- [ ] Markdown Viewer (sanitized)
- [ ] Password Generator (WebCrypto)
- [ ] Stopwatch
- [ ] Coin Flip
- [ ] Team / Group Generator
- [ ] Decision Maker
- [ ] SQL / HTML / XML Formatter
- [ ] Optional i18n (ES/HI/ID)
- [ ] Accounts only if a measured need appears

Backlog rules:
- Add only when there is a clear query intent and a differentiated tool.
- Reuse the tool contract and shell; no new architecture.
- One tool per PR-sized change, with content + tests.
- Update `PORTING.md` and `THIRD_PARTY_NOTICES.md` in the same change as any port.

---

## 10. Immediate next actions

1. Resolve the launch decisions in `Plan.md` §13: final name and domain, contact email and legal entity, logo, and Plausible domain.
2. Add an OG image asset and the `og:image` / `twitter:image` tags.
3. Install Playwright and `@axe-core/playwright`; add the 24-route smoke, keyboard, and axe suite to CI.
4. Run the mobile 360/390 and desktop 1280/1440 review in a real browser, in both themes.
5. Deploy `dist/client` to Cloudflare Pages; verify `_headers`, `_redirects`, canonicals, sitemap, robots, and the 404.
6. Submit the sitemap to Search Console after the domain is final.
7. Decide whether ads ship in this release. If they do, complete the publisher ID, consent flow, `ads.txt`, and CSP exceptions before enabling the slots.
