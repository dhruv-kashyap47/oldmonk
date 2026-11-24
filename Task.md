# oldmonk: Sprint Plan

**Status:** Built 2026-11-20 to 2026-11-23. The platform and the 24-tool catalog are in place. `npm run verify` passes: typecheck, lint, copy check, 608 unit tests, client and server build, prerender of 36 routes, SEO assertions, link crawl, content audit, and bundle budgets. The remaining work is the launch gate in Sprints F1 to F3.
**Shape:** 10-tool MVP, 24-tool v1, Cloudflare Pages only.
**Model:** One week per sprint, two lanes, a shippable increment at the end of every sprint.
**Companion docs:** [Plan.md](./Plan.md), [Audit.md](./Audit.md), [PORTING.md](./PORTING.md), [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
**Legend:** `[ ]` open · `[~]` partly done · `[x]` done · `[!]` blocked · **Deferred** has no consumer yet and is not planned into a sprint

---

## 0. How the sprints run

### 0.1 Sprint contract

- **Length.** One working week, five engineer-days. S0 and F3 are three-day sprints because they are setup and release, not build.
- **Two lanes.** A **Build** lane and a **Content + QA** lane. Solo, both lanes still run, one after the other inside the same sprint, and the sprint takes the lower estimate on each item.
- **One goal.** Each sprint has one sentence of intent and one demo. A sprint does not take a second goal because the first finished early.
- **Ship every sprint.** Every sprint ends with `npm run verify` green, a preview deploy, and a 15 minute demo against the preview URL. A sprint that cannot be previewed has not shipped.
- **Exit gate.** The per-tool definition of done in section 5 is the gate. A tool without it stays in the sprint and something else leaves.
- **Carryover rule.** An unfinished item moves to the top of the next sprint. If the same item carries over twice, it is cut or re-scoped. It is not extended a third time.
- **Trade rule.** New scope enters a sprint only when equal scope leaves it. No sprint grows its own scope.
- **Board honesty.** A tick means the code exists in the repo and is covered by `npm run verify` or the browser pass recorded on 2026-11-23. Nothing is ticked on intent. Two loose ends stay in F1: the duplicate `check:correctness` script (P-09a) and the missing `test:e2e` script (P-01a).

### 0.2 Why sprints are faster than the phases

Phases batch the ship. This plan batches the feedback.

1. **Engines before tools.** Five shared engines (JSON, text, random, clock, scoring) cover 24 tools. After the engine lands, a tool costs one `meta.ts`, one `logic.ts`, one `Tool.tsx`, one `Content.tsx`, and tests. That is the difference between two days and three days per tool.
2. **Content in the same sprint.** The tool author drafts the copy while the logic is fresh. No content phase exists, so there is no week where the catalog sits finished but unreadable.
3. **QA per tool, not per phase.** The old QA phase was 7 to 9 days at the end. Per-tool checks plus the F1 browser harness make it 15 minutes per change and one focused device pass.
4. **Deploy in week one.** Sprint S1 already serves static HTML from the preview. Prerender, canonical, header, and 404 mistakes surface in week one instead of week ten.
5. **No dead phase gates.** The design gate became a checklist on every tool page plus one catalog review in F2. The Solid go/no-go decision was made at S2 and recorded.
6. **Explicit cut list.** Tabs, sliders, tooltips, toasts, PiP, anime.js, ads, i18n, PWA, and accounts are out until a tool or a metric asks for them. Section 6 holds the list, so nothing is silently half-built.
7. **Launch is a sprint, not a phase.** Deploy, Search Console, analytics, and the post-deploy smoke share one three-day sprint with a fixed checklist.

Sprints do not shrink engineer-days. They shrink waiting, rework, and the gap between a finished tool and a usable page. The repo shows the catalog itself landing in one working block; the 51 to 63 engineer-day estimate in `Plan.md` §17 is the no-AI baseline and no longer describes the remaining work. The forward queue is 13 engineer-days, or two to three calendar weeks solo.

### 0.3 Current state (2026-11-23)

| Area | State | Evidence |
| --- | --- | --- |
| Design tokens, Bitter, themes | Done | `src/styles/app.css`, light and dark token sets, zero-flash theme script |
| Shell | Done | header, footer, mobile drawer, search palette, theme toggle, skip link |
| Registry and routes | Done | 24 tools, 5 categories, `/json-tools`, 6 static pages, 404 |
| Tool pages | Done | 880px standard, 1200px wide for JSON, regex, and diff; spec grid on every page |
| Tool logic | Done | framework-free `logic.ts` per tool, 608 unit tests across 30 files |
| Content | Done | 1049 to 1944 rendered words per tool, 10 FAQs, 3 to 6 related links |
| Polish pass (2026-11-24) | Done | dotless category chips, per-tool section headings, staggered catalog motion, FAQ accordion, search autofocus, regex and clipboard fixes |
| SEO | Done | one title, description, canonical, H1, and valid JSON-LD per route |
| Prerender | Done | 36 routes, sitemap, robots, `_headers`, `_redirects`, build report |
| Bundle | Done | 72.2 KB initial gzip against a 75 KB budget; 18.8 KB CSS |
| Lighthouse (home, JSON, diff) | Done | accessibility 100, best practices 100, SEO 100 |
| Playwright and axe CI | Open | not installed; the browser smoke test was manual. Sprint F1 |
| Mobile and device review | Open | needs 360/390 real-device or emulated pass. Sprint F2 |
| OG image | Done | `public/brand/og-default.png` (1200x630) derived by `npm run brand:assets` |
| Legal entity and contact | Open | placeholder `hello@oldmonk.dev`; no entity name or address. Sprint F3 |
| Final name and domain | Open | `oldmonk` and `https://oldmonk.dev` are placeholders. Sprint F3 |
| Plausible domain | Open | analytics stays a no-op until `VITE_PLAUSIBLE_DOMAIN` is set. Sprint F3 |
| Ads | Deferred | env-driven no-op; no live ads before publisher ID and CMP. Sprint F4 |

### 0.4 Board

| Sprint | Goal | Ships | Exit gate | Days | State |
| --- | --- | --- | --- | --- | --- |
| **S0** | Foundation freeze | Pinned stack, ui-sdk, tokens, fonts, brand assets, porting docs | `npm run verify` green on the scaffold, docs linked | 3 | Delivered |
| **S1** | Shell and SEO spine | Header, footer, drawer, theme, routes, metadata, JSON-LD, preview server | Every route serves real head tags, 404 returns 404 | 5 | Delivered |
| **S2** | Catalog and JSON slice | Catalog rows, tool shell, JSON Formatter, prerender and checks | JSON Formatter passes the full per-tool DoD | 5 | Delivered |
| **S3** | Text engine and search | Fancy Text, Symbols, ⌘K palette, inline filter | 3 tools live, search keyboard pass | 5 | Delivered |
| **S4** | JWT, random engine, analytics | JWT Decoder, Name Picker, Spin Wheel, event adapter, ad slots | 6 tools live, no input in payloads | 5 | Delivered |
| **S5** | Clocks and tests | Pomodoro, Countdown, Typing, Reaction | 10-tool MVP complete | 5 | Delivered |
| **S6** | Developer batch one | JSON Validator, JSON Minifier, Base64, URL, UUID, Timestamp | 5 more tools pass the DoD | 5 | Delivered |
| **S7** | Developer batch two and text batch two | Diff, Regex, Cursive, Instagram Fonts | 4 more tools, worker timeout proven | 5 | Delivered |
| **S8** | Random and test batch two | Random Number, Dice, Memory, Click Speed | 24 tools registered, tested, linked | 5 | Delivered |
| **S9** | Catalog audit | Unique content, related graph, metadata, bundle and Lighthouse pass | No fake numbers, no broken links, budgets met | 5 | Delivered |
| **F1** | Trust gate | Playwright, axe, CI, component and agent tests, security checks | CI blocks a red build | 5 | Ready |
| **F2** | Device and accessibility pass | Desktop and mobile review, keyboard, screen reader, motion, cross-browser | 24 routes pass at 360, 390, 768, 1280, 1440 | 5 | Ready |
| **F3** | Launch | Final name and domain, legal, deploy, GSC, Plausible, post-deploy smoke | 24 routes live with correct canonicals | 3 | Blocked on D-00, D-05 |
| **F4** | Monetization | AdSense slots, consent, `ads.txt`, CSP exceptions | No CLS, no ad before consent | 5 | Deferred until approval |

48 retrospective days plus 13 forward days. Launch is two to three calendar weeks away.

**Reading the state column:** Delivered means the sprint goal shipped and the increment was previewable. Open boxes inside a delivered sprint are the recorded carryover, and each one appears again in F1 to F3. They are not silently finished.

---

## 1. Delivered sprints

> The work already shipped is regrouped into one-week sprints. The grouping is retrospective: it follows the build order the code landed in, not sprint ceremonies that happened. Item IDs match the original plan and `Plan.md` §14.

### S0 Foundation freeze (3 days, delivered)

**Goal:** a pinned stack, the design system, and the rules that every later sprint depends on.

- [x] **D-01** Design direction: "The Catalog": warm stone paper, deep petrol, apricot highlights, plum/moss/rose category markers, Bitter slab serif, directory-style homepage, light and dark.
- [x] **D-01b** Design system: lean Tailwind tokens plus CSS variables; no variant library.
- [x] **D-01c** Shell: top navigation plus ⌘K command palette; theme toggle.
- [x] **D-01d** Skills: `ui-sdk`, `frontend-design`, `free-tools`, `copywriting`.
- [x] **D-01e** Content: drafted in house, reviewed by the user.
- [x] **D-01f** Cadence: vertical slice first, then the MVP set, then v1. Superseded by the engine-first order in this plan.
- [x] **D-02** AdSense: env-driven placeholders; no live ads until publisher ID, CMP, privacy, and approval.
- [x] **D-03** Analytics: Plausible, pageviews plus custom events.
- [x] **D-04** Deployment: static output; Cloudflare Pages only. No Workers, no Render, no backend.
- [x] **D-06** Scope: 24 tools, 10-tool MVP, Cron Generator deferred to v2.
- [x] **D-07** Voice: neutral brand voice, English only, Playwright plus GitHub Actions.
- [x] **D-08** Docs: `Audit.md`, `PORTING.md`, `THIRD_PARTY_NOTICES.md` created and linked.
- [x] **D-09** No fake numbers: no invented user counts, percentiles, benchmarks, ratings, or "studies show" claims.
- [x] **D-10** Reuse policy: port framework-free logic and data only; record every port; reject the audited unsafe code.
- [~] **D-00** Final brand, domain, and canonical `SITE_URL`. Working name `oldmonk`, placeholder `https://oldmonk.dev`. Carries to F3.
- [!] **D-05** Contact email and legal entity for privacy and terms. Carries to F3.

- [x] **U-01** Installed `@ui-sdk/solid@0.1.0-beta.13` and `@ui-sdk/core@0.1.0-beta.13` against Solid 2.0.3 and `@solidjs/web` 2.0.3.
- [x] **U-02** `@ui-sdk/core` excluded from Vite dependency pre-bundling.
- [x] **U-03** `@ui-sdk/core/web.css` imported after Tailwind inside `layer(components)`; `@layer ui-sdk` declared first.
- [x] **U-04** ui-sdk reading order added to `AGENTS.md`.
- [x] **U-05** `ui-sdk` skill installed with `npx skills@latest add vercel-labs/ui --skill ui-sdk`.
- [x] **U-06** Verified: typecheck, lint, build, SSR of a ui-sdk `Button` as an anchor, correct 404 status.
- [x] **U-07** Installed `anthropics/skills@frontend-design`, `coreyhaines31/marketingskills@free-tools`, and `coreyhaines31/marketingskills@copywriting`.
- [x] **U-08** Installed skills recorded in `AGENTS.md` and used for design, tool SEO, and copy.
- [x] **U-09** `Audit.md`, `PORTING.md`, and `THIRD_PARTY_NOTICES.md` created and linked from `Plan.md` and `Task.md`.
- [x] **U-10** Porting guardrails and the rejected-code list added to `AGENTS.md`.
- [x] **U-11** Porting check added to `.github/pull_request_template.md`: source, destination, status, license notice, test.
- [~] **U-12** `CopyButton` shipped on ui-sdk `Button` with clipboard fallback, success state, announcement, and keyboard path. Component test moves to F1.
- [ ] **U-13** ui-sdk agent smoke test (`createAgent().snapshot()`). Moves to F1.

- [~] **P-01** `package.json` with ESM and Node `>=22.12`: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `verify`, `check:copy`, `check:content`, `check:correctness`, `check:seo`, `check:links`, `check:bundle`, `brand:assets` all present. `test:e2e` moves to F1.
- [x] **P-02** Pinned deps: `solid-js@2.0.3`, `@solidjs/web@2.0.3`, `@solidjs/router@2.0.1`, `@solidjs/meta@2.0.0`, `@solidjs/vite-plugin@3.0.1`, `vite@8.3.8`, `tailwindcss@4.3.5`, `@tailwindcss/vite@4.3.5`, `typescript@7.0.2`, `vitest@5.1.1`, `oxlint@1.94.0`. `animejs@4.5.0` is not installed and no shipped tool needs it; the wheel animates with the native frame loop.
- [ ] **P-03** Dev-only deps: `@solidjs/diagnostics`, `@solidjs/testing-library`, `jsdom`, `@playwright/test`, `@axe-core/playwright`. Moves to F1.
- [x] **P-04** `vite.config.ts`: Solid start mode plus Tailwind plugin, `optimizeDeps.exclude: ["@ui-sdk/core"]`, build target `esnext`.
- [x] **P-05** `tsconfig.json`: strict, `jsx: preserve`, `jsxImportSource: @solidjs/web`, `moduleResolution: bundler`.
- [~] **P-06** `oxlint` runs in `verify` with zero findings. Explicit component-layer rules land with the component tests in F1.
- [x] **P-07** `.gitignore`, `.env.example`, `README.md`, `.editorconfig`.
- [x] **P-08** `npm run build` produces `dist/client` and `dist/server/server.js`.
- [~] **P-09** `check:correctness` runs the vitest suite, and `verify` runs the same suite through `test`. Fold the duplicate script or add it to `verify` in F1.
- [x] **P-10** Tokens in `src/styles/app.css` with the Catalog palette, light and dark values, radii, type scale, focus ring.
- [x] **P-11** Tailwind import, ui-sdk layer, base layer, selection, scrollbar, reduced-motion rules.
- [x] **P-12** Bitter self-hosted (Latin variable woff2, 33.3 KB), OFL license, `font-display: swap`, preload in `document.tsx`.
- [x] **P-13** `src/document.tsx`: `lang="en"`, charset, viewport, theme-color, favicon, font preload, `HydrationScript`.
- [x] **P-13a** Copy rule: no em dashes, enforced by `npm run check:copy` over `src/` and `public/` inside `verify`.
- [x] **P-13b** Brand assets: `assets/logo/` is the only source, `npm run brand:assets` derives the mark, favicons, app icons, and social card into `public/brand/`.

**Exit gate:** `npm run verify` green on the scaffold, docs linked, guardrails written, no product routes yet.

### S1 Shell and SEO spine (5 days, delivered)

**Goal:** every route exists with real head tags, and the shell is navigable with a keyboard.

- [x] **P-14** `SiteHeader`: wordmark, catalog nav, search trigger, theme toggle, mobile menu button.
- [x] **P-15** `SiteFooter`: categories, about/legal/contact, privacy line, copyright, `THIRD_PARTY_NOTICES` link.
- [x] **P-16** `MobileNavigation`: ui-sdk dialog with focus trap, escape, scroll lock, focus return.
- [x] **P-17** `SkipLink` and `Container`. Static pages use `ProsePage` instead of a separate `PageHeader`.
- [x] **P-18** Theme: `prefers-color-scheme` default, explicit toggle persisted through `src/lib/theme.ts` and the pre-hydration script.
- [x] **P-19** 404 page: helpful links, `noindex`, `httpStatus(404)`, ui-sdk `Button`.
- [x] **P-20** `src/tools/types.ts` with `ToolMeta`, `ToolComponentModule`, `ToolContentModule`, `ToolCategory`, `FAQItem`.
- [x] **P-21** `src/tools/registry.ts`: curated array of shipped tools, slug map, validation of unique slugs, slug format, category, copy lengths, ISO dates. Related resolution split into `findMissingRelated` for the build link check.
- [x] **P-22** `src/content/categories.ts`: slug, name, title, description, intro, order. No icon field; the category marker is a tint chip with a category-color label, and no icon library is installed.
- [x] **P-23** `src/seo/routes.ts`: one source of truth for canonical routes, sitemap, prerender, and search.
- [x] **P-24** `src/router.ts`: explicit routes, intent preload, static routes before `/:slug`.
- [x] **P-50** `src/seo/site.ts`: name, URL, title template, description, social image, locale.
- [x] **P-51** `MetaTags`: title, description, canonical, OG, Twitter, robots.
- [x] **P-52** `JsonLd`: `WebApplication`, `BreadcrumbList`, `FAQPage`, `WebSite`, `Organization`.
- [x] **P-57** `scripts/serve-static.ts`: production-like preview with pretty URLs and 404.
- [x] **P-58** Static HTML browser pass: hydration, navigation, no console errors.
- [ ] **P-59** Canonical and trailing-slash behavior on the Cloudflare Pages preview. Moves to F3.

**Exit gate:** `/`, a category, a tool, a legal page, and the 404 all render real HTML with unique titles and canonicals.

### S2 Catalog, tool shell, JSON slice (5 days, delivered)

**Goal:** prove the hardest path once, end to end, with one real tool and one real catalog.

- [x] **P-25** `HomePage`: compact hero, inline catalog search, five category sections, every tool as a row.
- [x] **P-25a** Catalog row anatomy: one solid rule above, no card or shadow, mono metadata at 12px and `0.03em` on the shared baseline, 96/64/32/16 spacing.
- [x] **P-26** `CategoryPage` and `TopicPage`: same rows, category intro, sibling links.
- [x] **P-27** `ToolPage`: single column, tool first, breadcrumbs, metadata, 404 on unknown slug.
- [x] **P-27a** Wide mode: 1200px for diff, regex, and JSON tree; 880px elsewhere.
- [x] **P-27b** Spec grid: two columns, 48px and 40px gaps, label 13px muted, value 15px ink.
- [x] **P-28** Static pages: About, Privacy, Terms, Contact, Notices. Real copy, placeholder contact marked for F3.
- [x] **P-29** Client navigation and deep-link hydration verified for `/`, a category, and one tool.
- [x] **P-30** `ToolShell`: breadcrumbs, header, badges, tool slot, content slot, related tools, ad slots.
- [x] **P-31** `ToolHeader`: H1, summary, category link, local-processing badge, last updated.
- [x] **P-32** `ToolPanel`: bordered surface, optional toolbar, responsive padding.
- [x] **P-33** `ToolTextarea` on ui-sdk `Field` and `Textarea`: label, hint, error, count, monospace option.
- [x] **P-34** `CopyButton`: ui-sdk `Button`, clipboard fallback, success state, announcement, keyboard.
- [x] **P-35** Reset and result states: `EmptyState`, `ErrorState`, `LoadingState`, result cards.
- [x] **P-36** `Breadcrumbs` with `BreadcrumbList` schema.
- [x] **P-37** `RelatedTools`: 3 to 6 rows, analytics event, no broken slugs.
- [x] **P-38** Styled wrappers over ui-sdk plus `Badge` and `Kbd`.
- [x] **P-39** Read the ui-sdk page before using each part; no hand-rolled ARIA roles for the patterns that shipped.

- [x] **T-100** `logic.ts`: parse, pretty-print (2/4/tab), sort keys, JSON error with line and column, size cap.
- [x] **T-101** UI: input and output, indent control, sort toggle, copy, download, clear, sample.
- [x] **T-102** Error state: exact location, human message, no stack traces.
- [x] **T-103** Content: what formatting does, indentation choice, large-file limits, FAQ.
- [x] **T-104** Unit tests: valid and invalid, unicode, nested, duplicate keys, 5 MB cap, error line and column.
- [x] **T-105** Browser flow: paste, format, copy; invalid JSON shows the error.
- [x] **T-106** `meta.ts` with title, description, keywords, related, `loadTool`, `loadContent`.

- [x] **P-53** `scripts/prerender.ts`:
  - requests every route through `handleRequest`
  - asserts status, title, description, canonical, H1, and JSON-LD
  - writes flat `<route>.html`, `index.html`, `404.html`
  - generates `sitemap.xml` and `robots.txt`
  - generates `_headers`, `_redirects`, and `ads.txt` when a publisher ID exists
  - crawls internal links and fails on broken targets
  - writes `dist/build-report.json`
- [x] **P-54** `scripts/check-seo.ts`, runnable on its own.
- [x] **P-55** `scripts/check-links.ts`, runnable on its own.
- [x] **P-56** `scripts/check-bundle.ts` with gzip budgets per entry and chunk. Home is 72.2 KB gzip against the 75 KB budget.
- [x] **G-06** Go/no-go: Solid 2 kept, decision recorded in `Plan.md` §3.1a. No framework switch.

**Exit gate:** JSON Formatter passes every line of the section 5 checklist, and the build fails on a missing title, a broken link, or an over-budget chunk.

### S3 Text engine and search (5 days, delivered)

**Goal:** one engine that powers three text tools, and a palette that finds all of them.

- [x] **T-210** `fonts.json` ported to `unicode-fonts.data.ts`; malformed digit maps normalized or marked experimental.
- [x] **T-211** `logic.ts`: style maps for bold, italic, script, fraktur, double-struck, circled, fullwidth, small caps, upside down, strikethrough, with per-character fallback.
- [x] **T-212** UI: input, style grid, live preview, copy per style, copy all, clear.
- [x] **T-213** Coverage tests: A to Z, a to z, 0 to 9 for every style, no broken surrogates.
- [x] **T-214** Content: Unicode styles, platform support, fallback behavior, accessibility warning, FAQ.
- [x] **T-215** Browser flow: type, styles update, copy.
- [x] **T-220** `data.ts`: hearts, stars, arrows, currency, math, punctuation, aesthetic, games, with names and keywords.
- [x] **T-221** UI: search, category filter, grid, click to copy, recently used, copy all visible.
- [x] **T-222** Accessibility: named buttons, no hover-only copy, visible count.
- [x] **T-223** Content: how Unicode symbols work, font support, FAQ.
- [x] **T-224** Tests: unique symbols, search, category coverage; browser flow: search "heart", copy.
- [x] **P-60** `SearchDialog`: ui-sdk command inside a dialog; Cmd/Ctrl+K, `/` shortcut, input label.
- [x] **P-61** Custom scorer over the registry on name, keywords, and category; no Fuse.js.
- [x] **P-62** ui-sdk Command owns keyboard and ARIA; arrow keys, Enter, Escape, empty state, recent tools verified.
- [x] **P-63** Analytics: `search_open`, `search_select` with length only, never query text.
- [x] **P-64** Inline catalog filter on home and category: same scorer, live count, empty categories hidden, no-results message.
- [x] **P-65** Search palette lazy-loaded, out of the homepage initial bundle.
- [x] **P-40** Dialog composed from `@ui-sdk/solid/dialog` for the mobile drawer and the search palette.
- [~] **P-46** Keyboard smoke test done manually on the dialog and command primitives. The screen-reader pass runs in F2 (Q-23).
- [x] **P-47** No hand-written `role="dialog"` or `role="listbox"` in the shipped components.

**Exit gate:** three tools live, ⌘K opens on any page, the inline filter announces its count, and the home bundle stays under budget.

### S4 JWT, random engine, analytics (5 days, delivered)

**Goal:** the first security-sensitive tool and the first two crypto-random tools, on top of typed analytics and inert ad slots.

- [x] **T-200** `base64UrlToBytes`, `bytesToBase64Url`, `decodeJsonSegment`, and HMAC verification ported with tests.
- [x] **T-201** UI: token input, header and payload panels, claims table, expiry status, copy, sample.
- [x] **T-202** "Signature not verified" is the default; optional HMAC verify with secret; no network.
- [x] **T-203** Content: JWT structure, claims, expiry, security warnings, FAQ.
- [x] **T-204** Tests: valid, malformed, unicode, missing parts, invalid base64url, expired, `nbf`.
- [x] **T-205** Browser flow: sample token, claims, expiry badge.
- [x] **T-230** `secureRandomInt`, `secureShuffle`, `selectUnique`, `parseCandidates`, `modeError` ported with tests.
- [x] **T-231** `logic.ts`: parse names from lines or commas, no-repeat, history, remove winner, teams by round robin.
- [x] **T-232** UI: name list, count, pick, winner card, history, reset, sample, teams.
- [x] **T-233** Content: fair picking, classroom and giveaway use, no-repeat, crypto fairness, FAQ.
- [x] **T-234** Tests: parsing, no-repeat, empty and single, whitespace, duplicate names distinct, team sizes.
- [x] **T-235** Browser flow: add names, pick, winner visible.
- [x] **T-240** Wheel stop angle and DPR-aware drawing ported, simplified to one style.
- [x] **T-241** `logic.ts`: entries, equal probability in v1, crypto selection, angle mapping.
- [x] **T-242** UI: wheel, entries editor, spin, result, history.
- [x] **T-243** Spin runs on the frame loop with a 3.2 second settle; reduced motion returns the result instantly.
- [x] **T-244** Accessibility: list alternative, keyboard spin, `aria-live` result.
- [x] **T-245** Content: weighted wheels in v1, fairness, classroom and giveaway ideas, FAQ.
- [x] **T-246** Tests: selection distribution, angle mapping, empty and one entry.
- [x] **T-247** Browser flow: spin, result announced.
- [x] **P-70** `src/analytics/index.ts`: `track`, `pageview`, provider adapter, dev no-op.
- [x] **P-71** Event names and props typed; no free-form payloads.
- [x] **P-72** Plausible adapter: deferred script with `data-domain`, custom events, disabled when `VITE_PLAUSIBLE_DOMAIN` is unset.
- [x] **P-73** `src/monetization/config.ts`: env parsing, placements, enabled flag.
- [x] **P-74** `AdSlot`: no-config no-op, reserved height, lazy init, label, debug outlines.
- [x] **P-75** Consent hook, provider-agnostic, with the AdSense CMP integration documented.
- [x] **P-76** Privacy policy covers ads, analytics, storage, and local-only processing.

**Exit gate:** six tools live, no `Math.random()` in a picker, and an empty event payload contains no user input.

### S5 Clocks and tests (5 days, delivered)

**Goal:** close the MVP with two timers and two tests that survive background tabs and slow devices.

- [x] **T-250** `logic.ts`: work, short break, long break, cycle count, duration settings.
- [x] **T-251** UI: ring, time, start/pause/reset, skip, mode tabs, settings, session count.
- [x] **T-252** `performance.now()` timing, drift correction on visibility change, title update.
- [x] **T-253** Web Audio chime unlocked by a gesture; optional notifications; wake lock where supported.
- [x] **T-254** Settings and today's count persisted in `localStorage` under `oldmonk:v1:*`; reset control.
- [x] **T-255** Accessibility: `aria-live` at mode changes only, keyboard controls, reduced motion.
- [x] **T-256** Content: the Pomodoro method, settings advice, FAQ.
- [x] **T-257** Tests: transitions, long-break cadence, duration changes, pause and resume; browser flow: start, pause, reset.
- [ ] **T-258** Document PiP. Deferred, optional and unrequested.
- [x] **T-260** `logic.ts`: parse HH:MM:SS, target timestamp, remaining time, finish event.
- [x] **T-261** UI: 1, 5, 10, 25 minute presets, custom input, start/pause/reset, ring, finish state.
- [x] **T-262** Background-tab accuracy, audio alarm, title update, optional notification.
- [x] **T-263** Accessibility: no per-second announcements, finish announced, keyboard path.
- [x] **T-264** Content: countdown use cases, background-tab behavior, FAQ.
- [x] **T-265** Tests: parsing, remaining time, finish, zero and negative, pause.
- [x] **T-266** Browser flow: 5 second countdown reaches the finish state.
- [x] **T-270** `logic.ts`: WPM at 5 characters per word, raw WPM, accuracy, consistency, per-character states.
- [x] **T-271** Original practice passages; 15, 30, and 60 second modes.
- [x] **T-272** UI: passage, caret, live stats, restart, results card, best score.
- [x] **T-273** Input capture on a focused textarea, mobile keyboard, paste blocked with a notice.
- [x] **T-274** High-resolution timing with `performance.now()`.
- [ ] **T-275** Result share card drawn on canvas. Not built; copy still works. Moved to the v1.1 backlog.
- [x] **T-276** Content: how WPM is calculated, accuracy, limits, FAQ.
- [x] **T-277** Tests: WPM and accuracy math, edge cases, per-character state; browser flow: 15 second run reaches a result card.
- [x] **T-280** `logic.ts`: rounds, random delay, early click, mean, median, best, outlier note.
- [x] **T-281** UI: start, waiting, click now, result, five-round summary, replay, best.
- [x] **T-282** Touch and keyboard (space); scroll and zoom prevented during the wait.
- [ ] **T-283** Result share card. Not built. Moved to the v1.1 backlog; the page makes no percentile claims.
- [x] **T-284** Content: what reaction time measures, factors, limits, FAQ.
- [x] **T-285** Tests: stats, early click, round flow.
- [x] **T-286** Browser flow: five rounds reach a summary.

**Exit gate:** the 10-tool MVP set exists, and every timer keeps time when the tab is hidden.

**Carryover:** T-275 and T-283 (result share cards) are deferred to v1.1. Both results pages restart cleanly but have no result copy or share action, so they carry a recorded exception on the copy and share line of the DoD. The rest of the DoD holds. The v1.1 backlog item "Share cards for tests" closes it.

### S6 Developer batch one (5 days, delivered)

**Goal:** the parser-heavy half of the developer catalog, sharing the JSON core where it is genuinely shared.

- [x] **T-300** `json/parse.ts` shared with the formatter; error codes plus line and column.
- [x] **T-301** JSON Validator UI: verdict, error location, jump to line, sample invalid JSON.
- [x] **T-302** JSON Minifier UI: bytes before and after, percent saved, copy, download.
- [x] **T-303** Content: syntax rules, common errors, when to minify, gzip note, FAQ.
- [x] **T-304** Tests: trailing commas, comments, single quotes, unquoted keys, BOM, unicode bytes.
- [x] **T-305** Browser flows: invalid shows the error line, valid shows success, minified output parses.
- [x] **T-306** Distinct titles and descriptions from the formatter; the trio cross-links.
- [x] **T-307** Both tools added to the registry, sitemap, and related graph.
- [x] **T-310** `logic.ts`: text encode and decode with `TextEncoder` and `TextDecoder`, URL-safe variant, file bytes, size cap.
- [x] **T-311** UI: text and file tabs, encode and decode, URL-safe toggle, copy, download, size.
- [x] **T-312** Errors: invalid Base64, non-UTF-8 bytes, size cap.
- [x] **T-313** Content: what Base64 is, URL-safe variant, 33 percent overhead, privacy, FAQ.
- [x] **T-314** Tests: ASCII, emoji, CJK, binary, URL-safe, invalid input.
- [x] **T-315** Browser flows: text round trip, file round trip, invalid input error.
- [x] **T-320** `logic.ts`: `encodeURIComponent`, `encodeURI`, query builder, decode errors.
- [x] **T-321** UI: mode switch, encode and decode, query param table, copy.
- [x] **T-322** Content: component versus full URL, reserved characters, `+` versus `%20`, FAQ.
- [x] **T-323** Tests: spaces, `&`, `=`, unicode, malformed percent sequences.
- [x] **T-324** Browser flow: encode then decode round trip.
- [x] **T-325** Query table editing pattern ported from devtoolkit `UrlParser`.
- [x] **T-330** `logic.ts`: v4 through `crypto.randomUUID` or `getRandomValues`, v7 with timestamp, bulk, format options.
- [x] **T-331** UI: count from 1 to 1000, version, uppercase, hyphens, copy all, download.
- [x] **T-332** Content: v4 versus v7, collision odds, when to use each, FAQ.
- [x] **T-333** Tests: format regex, version and variant bits, v7 monotonic timestamp, uniqueness.
- [x] **T-334** Browser flow: generate 100, copy, count.
- [x] **T-335** devtoolkit `Math.random()` implementation explicitly rejected.
- [x] **T-340** `logic.ts`: detect seconds or milliseconds, parse ISO, local and UTC, relative time, timezone formatting.
- [x] **T-341** UI: live "now", input, unit switch, timezone select, result table, copy.
- [x] **T-342** Content: Unix time, seconds versus milliseconds, timezones, leap seconds, FAQ.
- [x] **T-343** Tests: second and millisecond boundaries, ISO, invalid input, DST-sensitive zones.
- [x] **T-344** Browser flow: convert now to ISO and back.
- [x] **T-345** devtoolkit seconds-only assumption rejected.

**Exit gate:** five more tools pass the section 5 checklist and the JSON trio keeps three distinct pages.

### S7 Developer batch two and text batch two (5 days, delivered)

**Goal:** the two tools with the most layout risk, then the two font pages that must not duplicate Fancy Text.

- [x] **T-350** `logic.ts`: Myers line diff, inline word and character diff, unified output, ignore whitespace and case.
- [x] **T-351** UI: two panes, side-by-side and unified, plus and minus stats, copy patch, swap, sample.
- [x] **T-352** Limits: 2,000 lines or 200 KB per side, with a clear message.
- [x] **T-353** Content: how the algorithm works, line versus word, whitespace options, FAQ.
- [x] **T-354** Tests: insert, delete, replace, identical, whitespace, unicode, large input guard.
- [x] **T-355** Browser flow: paste two texts, diff, swap.
- [x] **T-356** devtoolkit line-index comparison not ported.
- [x] **T-360** `logic.ts`: compile flags, matches, capture groups, named groups, indices, replace.
- [x] **T-361** Web Worker execution with a 750ms timeout; terminate on hang; clear message.
- [x] **T-362** UI: pattern, flag toggles, test text, highlighted matches, group table, replace preview.
- [x] **T-363** Pattern library: email, URL, date, whitespace, digits; insert only, never auto-run.
- [x] **T-364** Content: flags, groups, greedy versus lazy, backtracking warning, FAQ.
- [x] **T-365** Tests: flags, groups, unicode, zero-length matches, timeout path.
- [x] **T-366** Browser flows: pattern to matches, invalid pattern to error, replace preview.
- [x] **T-367** No `innerHTML`; matches highlighted with text nodes or safe spans.
- [x] **T-370** Cursive: curated script families with uppercase gaps and fallback rules.
- [x] **T-371** Cursive UI: focused style list, preview, copy, character count.
- [x] **T-372** Cursive content: cursive Unicode versus real fonts, where it renders, FAQ.
- [x] **T-373** Cursive tests: known gaps, fallback, mixed input; browser flow: type and copy.
- [x] **T-374** Instagram: curated bio styles, 150 character counter, line breaks, copy.
- [x] **T-375** Instagram content: bio limits, which styles render, caption versus bio, disclaimer, FAQ.
- [x] **T-376** Instagram tests: counter, line breaks, style coverage; browser flow: type, count, copy.
- [x] **T-377** Instagram page materially different from Fancy Text and Cursive.
- [x] **T-378** No Instagram logo or brand assets; "Not affiliated with Instagram" present.

**Exit gate:** the diff and regex pages use the 1200px workspace, and the three font pages have distinct H1s, examples, and FAQs.

### S8 Random and test batch two (5 days, delivered)

**Goal:** close the catalog at 24 tools.

- [x] **T-380** Random Number `logic.ts`: crypto rejection sampling, min and max, integer or decimal, unique, bulk.
- [x] **T-381** UI: range, count, unique toggle, generate, history, copy.
- [x] **T-382** Content: fairness, crypto versus `Math.random`, uniqueness, FAQ.
- [x] **T-383** Tests: bounds, distribution sanity, unique mode, invalid ranges; browser flow: generate 10 in range.
- [x] **T-384** Dice `logic.ts`: d4, d6, d8, d10, d12, d20, d100, count, modifier, crypto rolls, notation parser.
- [x] **T-385** UI: dice picker, count, modifier, roll, total, individual dice, history.
- [x] **T-386** Content: notation such as 2d6+1, fairness, tabletop use, FAQ.
- [x] **T-387** Tests: bounds per die, modifier, count, notation; browser flow: 2d6+1 shows total and dice.
- [x] **T-390** Sequence `logic.ts`: sequence generation, level progression, input validation, scoring.
- [x] **T-391** UI: 3 by 3 grid, playback, input phase, level, mistakes, best.
- [x] **T-392** Accessibility: keyboard 1 to 4, audio tones, reduced-motion playback, `aria-live` status.
- [x] **T-393** Content: what it measures, strategy, limits, FAQ.
- [x] **T-394** Tests: sequence, level advance, wrong input, scoring; browser flow: short sequence by keyboard.
- [x] **T-395** Click `logic.ts`: 10 second window, click count, CPS, intervals, consistency.
- [x] **T-396** UI: large target, timer, CPS, clicks, result, replay, best.
- [x] **T-397** Accessibility: spacebar, mobile tap, no double count, reduced motion.
- [x] **T-398** Content: CPS calculation, device and browser factors, FAQ.
- [x] **T-399** Tests: CPS, duration, interval stats, zero clicks; browser flow: 10 clicks reach a result.

**Exit gate:** 24 tools registered, each with a route, tests, content, and related links.

### S9 Catalog audit (5 days, delivered)

**Goal:** make 24 pages read as one product, with no duplicate H1, no thin section, and no invented claim.

- [x] **C-00** `free-tools` skill used to check tool intent and page angle; `copywriting` used for drafts.
- [x] **C-01** Unique content for all 24 tools: intro, how-to, explanation, privacy, 8 to 10 FAQs.
- [x] **C-01a** Content pattern locked on JSON Formatter, then repeated.
- [x] **C-02** Category intros for 5 categories and the `/json-tools` topic intro.
- [x] **C-03** About, Privacy, Terms, Contact written as specific pages. Contact address still placeholder, tracked as D-05.
- [x] **C-04** Related-tool graph defined; every link resolves through the registry check.
- [x] **C-05** Breadcrumbs and contextual links on every page.
- [x] **C-06** Title and description lengths checked for uniqueness by the prerender assertions.
- [x] **C-07** JSON-LD validated for every page type.
- [x] **C-08** Duplicate boilerplate and thin sections reviewed.
- [x] **C-09** Real `updated` dates, no fake freshness.
- [x] **C-10** No fake numbers check: the rendered HTML is scanned for percentile, top percent, studies show, users, million, rated, reviewed.
- [x] **C-12** No indexable 404, legal, or test page.
- [ ] **C-11** Sitemap submitted to Search Console. Moves to F3, needs the domain.
- [~] **G-01** Desktop review at 1280 and 1440. Lighthouse recorded on home, JSON, and diff; pixel review moves to F2.
- [~] **G-02** Mobile review at 360, 390, and 768. Moves to F2.
- [~] **G-03** Keyboard-only pass. Partial, completes in F2.
- [~] **G-04** Reduced motion, 200 percent zoom, high contrast. Partial, completes in F2.
- [x] **G-05** Lighthouse and PSI on the JSON page: accessibility 100, best practices 100, SEO 100.

Automated gates already covered by `verify` at the end of S9: Q-01 typecheck, Q-02 lint, Q-02a copy check, Q-03 unit tests, Q-05 build and prerender, Q-06 link crawl, Q-07 bundle budgets, Q-09 SEO assertions, and Q-11 golden vectors in the unit suite. The rest of the automated gates are F1 work.

**Exit gate:** 36 routes prerender, the link crawl is clean, and the build report shows the initial bundle at 72.2 KB gzip.

---

## 2. Forward sprints

### F1 Trust gate (5 days, ready)

**Goal:** make the checks that catch regressions run without a human, and put them in CI before launch.

**Build lane**

- [ ] **P-03** Install `@playwright/test`, `@axe-core/playwright`, `@solidjs/testing-library`, `jsdom`, and `@solidjs/diagnostics` as dev dependencies.
- [ ] **P-01a** Add `test:e2e` and make it a documented local command.
- [ ] **U-12a** Component test for `CopyButton`: success state, announcement, clipboard fallback, keyboard.
- [ ] **U-13** ui-sdk agent smoke: `createAgent().snapshot()` finds the named search and form controls, and no input or secret appears.
- [ ] **P-09a** Fold `check:correctness` into `verify` or delete the duplicate script.
- [ ] **P-06a** Add explicit oxlint rules for the component layer now that component tests exist.
- [ ] **Q-04** Playwright suite: 24 tool routes, 5 category pages, `/json-tools`, 6 static pages, 404, metadata assertions, no console errors, no horizontal overflow at 360px, core flows per tool.
- [ ] **Q-08** Axe scans on home, a category, a tool, and a test result state. No serious or critical violations.
- [ ] **Q-12** GitHub Actions: typecheck, lint, unit, build and prerender, e2e, dependency cache, artifacts uploaded.
- [ ] **Q-13** Agent smoke in CI with the same boundary: no pasted content, no secrets.
- [ ] **Q-10** No-network test that fails if a tool module calls `fetch`, `XMLHttpRequest`, `sendBeacon`, or a third-party URL.
- [ ] **Q-11** Golden-vector audit: crypto against Node `crypto`, JSON against `JSON.parse`, encoding against `Buffer`, JWT HS256, HS384, HS512, timer arithmetic, score calculations.
- [ ] **Q-14** `THIRD_PARTY_NOTICES.md` matches every ported file, and each file carries its source header.
- [ ] **Q-30** No `innerHTML` or `eval` with user input.
- [ ] **Q-31** Regex worker timeout proven with a catastrophic pattern.
- [ ] **Q-32** Size caps verified for JSON, diff, Base64, and upload paths.
- [ ] **Q-33** No secret in the client bundle.
- [ ] **Q-34** Security headers present; CSP documented.
- [ ] **Q-35** `localStorage` clear-all works; no pasted content stored.
- [ ] **Q-36** No third-party request from any tool route.

**Content and QA lane**

- [ ] Write the keyboard and screen-reader test script that F2 executes, so F2 does not improvise.
- [ ] Record the expected result of each tool flow in the Playwright helper, one line per tool.
- [ ] Review the 404, legal, and notices pages for placeholder text one more time.

**Exit gate:** a red CI run blocks merge, and `npm run verify` plus `npm run test:e2e` pass from a clean checkout.

### F2 Device and accessibility pass (5 days, ready)

**Goal:** the catalog holds up at 360px, in a screen reader, at 200 percent zoom, and on Safari.

- [ ] **G-01** Desktop review at 1280 and 1440: palette, Bitter, row anatomy, hero, light and dark.
- [ ] **G-02** Mobile review at 360, 390, and 768: layout, touch targets, no overflow, no hover-only control.
- [ ] **G-03** Keyboard-only pass on home, a category, and 4 representative tools: JSON, Diff, Typing, Pomodoro.
- [ ] **G-04** Reduced motion, 200 percent zoom, high contrast.
- [ ] **Q-19** Design review of the full catalog against the Catalog brief, both themes.
- [ ] **Q-20** Mobile 360, 390, 768: layout, touch targets, keyboard, overflow.
- [ ] **Q-21** Desktop 1280, 1440: layout, code blocks, long output.
- [ ] **Q-22** Keyboard-only full pass on home, category, and 4 tools.
- [ ] **Q-23** Screen reader pass: labels, errors, results, timer state, test results.
- [ ] **Q-24** Reduced motion, 200 percent zoom, high contrast.
- [ ] **Q-25** Slow 4G: LCP, CLS, and INP inside the `Plan.md` §8 budgets.
- [ ] **Q-26** Production preview: no console errors, no 404 assets, correct headers.
- [ ] **Q-27** Ad slots stay inert with no config and cause no layout shift.
- [ ] **Q-28** Chrome, Firefox, Safari, iOS Safari, Edge. Timers, audio, and clipboard get a second look on iOS.

**Fix budget:** each fix is capped at one day. Anything larger goes to the post-launch backlog with a note. The tint chip and the category rule are the two patterns not to redesign under pressure.

**Exit gate:** no serious axe violation, no horizontal page scroll at 360px, and a screen reader can complete the JSON, diff, and timer flows.

### F3 Launch (3 days, blocked on D-00 and D-05)

**Goal:** the catalog is live on its real domain with real legal copy and real analytics.

- [ ] **D-00** Confirm final brand, domain, and canonical `SITE_URL`. Update `src/seo/site.ts`, `robots.txt`, sitemap, and the OG image if the name changes.
- [ ] **D-05** Replace `hello@oldmonk.dev` and write the legal entity and address into Privacy, Terms, and Contact.
- [ ] **L-01** Verify the 24-tool catalog, 6 hubs, and legal pages ship together. This supersedes the 10-tool MVP build.
- [ ] **L-02** `npm run verify` green, with a non-zero test count.
- [ ] **L-03** Deploy `dist/client` to Cloudflare Pages and configure `SITE_URL`.
- [ ] **L-04** Verify 24 tool routes, 6 hubs, 6 static pages, canonicals, sitemap, robots, and the 404.
- [ ] **P-59** Trailing slash redirects to the canonical URL on the preview.
- [ ] **L-05** GSC property, verification, sitemap submission.
- [ ] **L-06** Plausible pageviews and custom events verified with `VITE_PLAUSIBLE_DOMAIN` set.
- [ ] **L-07** Lighthouse and PSI on production home plus 3 tool pages. Fix regressions inside the sprint.
- [ ] **L-08** Sprint and launch retro: what the engine-first order saved, what to change for v1.1.
- [ ] **L-10** Cloudflare Pages project connected to the repo.
- [ ] **L-11** `SITE_URL`, `VITE_PLAUSIBLE_DOMAIN`, `VITE_GSC_VERIFICATION`, and ad env vars set for production.
- [ ] **L-12** `_headers`, `_redirects`, pretty URLs, and the 404 verified on the deployment.
- [ ] **L-13** Post-deploy smoke over 24 routes, sitemap, robots, canonical, OG.
- [ ] **L-14** GSC property verified and sitemap submitted.
- [ ] **L-16** Plausible pageview and event check in the live dashboard.
- [ ] **L-17** Lighthouse and PSI on the live home page and 3 tool pages.
- [ ] **L-18** Uptime or error monitoring set up.
- [ ] **L-19** Release tagged and launch notes written.
- [ ] **L-20** Placeholder name and domain checks re-run if the final name differs.
- [ ] **C-11** Sitemap submitted after the domain is final.
- [ ] **L-15** AdSense application only if the answer to the ads question is yes. Otherwise it stays in F4.

**Exit gate:** 24 routes return 200 with unique titles and canonicals, the sitemap is submitted, and the launch retro is written.

### F4 Monetization (5 days, deferred)

Starts only after AdSense approval, a publisher ID, and a signed-off consent flow. Until then `AdSlot` stays an inert no-op and this sprint does not exist.

- [ ] **M-01** AdSense client and slot env values, or keep disabled.
- [ ] **M-02** Placements per `Plan.md` §6.2 with reserved heights and no CLS.
- [ ] **M-03** No ad inside a tool panel; at most 2 per page.
- [ ] **M-04** `ads.txt` generated when the publisher ID exists.
- [ ] **M-05** Google CMP or equivalent; no ad request before consent where required.
- [ ] **M-06** Privacy policy and cookie disclosure reviewed against the live setup.
- [ ] **M-07** Plausible pageviews and custom events verified in debug.
- [ ] **M-08** No PII or input in event payloads.
- [ ] **M-09** Ad blocker test: layout intact, no errors.
- [ ] **M-10** CWV with ads on and off; CSP exception list documented.

**Exit gate:** no CLS from ad slots, no request before consent, and the privacy page matches what the page actually loads.

---

## 3. Phase to sprint map

| Original section | Original work | Sprint |
| --- | --- | --- |
| Phase 1, §1.0 to §1.1 | Docs, porting, ui-sdk, project setup | S0 |
| Phase 1, §1.2 to §1.3 | Shell, routes, home, category, topic, static pages | S1 |
| Phase 1, §1.4 | Tool shell and shared tool UI | S2 |
| Phase 1, §1.5 | ui-sdk primitives | S3, remainder deferred |
| Phase 1, §1.6 | SEO and prerender pipeline | S1 and S2 |
| Phase 1, §1.7 | Search | S3 |
| Phase 1, §1.8 | Analytics and ad scaffolding | S4 |
| Phase 1, §1.9 | JSON Formatter | S2 |
| Phase 1, §1.10 | Design and framework gate | S9 and F2 |
| Phase 2, §2.1 to §2.9 | The other 9 MVP tools | S3, S4, S5 |
| Phase 2, §2.10 | MVP launch | F3, merged into the v1 launch |
| Phase 3, §3.1 to §3.5 | JSON tools, Base64, URL, UUID, Timestamp | S6 |
| Phase 3, §3.6 to §3.9 | Diff, Regex, Cursive, Instagram, random and dice | S7 and S8 |
| Phase 3, §3.10 | Memory and Click | S8 |
| Phase 4 | Content, SEO, internal linking | S9, per tool from S2 onward |
| Phase 5 | Monetization and analytics | Analytics in S4, ads in F4 |
| Phase 6, §6.1 | Automated gates | `verify` from S2, CI in F1 |
| Phase 6, §6.2 to §6.3 | Manual and security gates | F1 and F2 |
| Phase 7 | Deploy and launch | F3 |

---

## 4. Decisions and guardrails

### 4.1 Decisions

- [~] **D-00** Final brand and domain. Working name `oldmonk`, placeholder `https://oldmonk.dev`.
- [x] **D-01** Design direction: The Catalog.
- [x] **D-02** AdSense placeholders only; no live ads before approval and consent.
- [x] **D-03** Plausible for analytics.
- [x] **D-04** Cloudflare Pages static output only.
- [!] **D-05** Contact email and legal entity.
- [x] **D-06** 24 tools, 10-tool MVP, Cron Generator in v2.
- [x] **D-07** Neutral voice, English only, Playwright plus GitHub Actions.
- [x] **D-08** Audit, porting, and notice docs.
- [x] **D-09** No fake numbers.
- [x] **D-10** Port framework-free logic and data only.

### 4.2 Guardrails

- Do not introduce React, Next, Astro, SolidStart, Kobalte, Radix, or a runtime backend.
- Do not send tool input over the network.
- Do not use `Math.random()` for UUIDs, passwords, picks, shuffles, dice, or wheel winners.
- Do not copy devtoolkit HashGenerator, PasswordGenerator, UUID v4, QR generator, regex highlighter, Markdown viewer, `SEOHead`, HashRouter, AdBanner, or GA service.
- Do not copy HumanEval `benchmarks.ts`, bell curve, CGI tiers, or neubrutalist UI.
- Do not copy fancy-fonts UI, `innerHTML` output, `execCommand`, `alert`, or Twemoji CDN.
- Do not copy random-picker's 2,205-line UI or Dopa-Gaki celebration.
- Do not copy pomo's `setInterval` timer, Jotai, server, auth, DB, or SSE.
- Do not hand-roll ARIA patterns ui-sdk already ships; read its docs per `AGENTS.md`.
- Do not add a dependency without a written reason in the PR or commit.
- Do not create a tool page without a real working tool and unique content.
- Do not place ads inside tool controls or above the tool on mobile.
- Do not ship placeholder copy, fake stats, or unfinished states.
- Update `PORTING.md` and `THIRD_PARTY_NOTICES.md` in the same change as any port.
- No new scope inside a sprint without an equal cut.

---

## 5. Per-tool definition of done

A tool is done only when all are true. This is the gate for every sprint that ships a tool.

- [ ] Route exists, resolves from the registry, and deep-links.
- [ ] Tool works with real input; no mocked result.
- [ ] Empty, error, and success states are designed.
- [ ] Input limits and edge cases are handled with clear messages.
- [ ] `logic.ts` is framework-free, with no DOM, fetch, or storage, and is unit-tested.
- [ ] Golden vectors cover the parser, generator, or crypto path.
- [ ] Tool chunk is lazy-loaded and 20 KB gzip or less.
- [ ] No network request from tool logic or UI, enforced by a test.
- [ ] No `Math.random()` for security-sensitive output.
- [ ] Mobile layout works at 360px; no horizontal page scroll.
- [ ] Keyboard-only path works; focus visible; labels present.
- [ ] Screen-reader result and error announcements work.
- [ ] Reduced motion respected.
- [ ] Copy, share, and reset actions work where relevant.
- [ ] Unique title, description, canonical, H1, and JSON-LD.
- [ ] Unique content: how-to, explanation, privacy, FAQ.
- [ ] No fake numbers or unsupported claims.
- [ ] 3 to 6 related tools, all valid.
- [ ] Analytics events fire: `tool_view`, `tool_first_input`, `tool_complete` where applicable.
- [ ] E2E smoke test passes; no console errors.
- [ ] Added to the category page, search, sitemap, and link graph.
- [ ] Any port recorded in `PORTING.md`; notice present in `THIRD_PARTY_NOTICES.md`.

---

## 6. Deferred work

Deferred means no sprint contains it. It returns only when a tool, a metric, or an approval asks for it.

| Item | Reason | Trigger |
| --- | --- | --- |
| **P-41** Tabs, **P-42** SegmentedControl, **P-43** Switch and Slider, **P-44** Tooltip, **P-45** Toast | No shipped tool uses them; ui-sdk already ships the behavior when one does | A tool needs the control |
| Anime.js | The wheel and timer ring do not need it | A tool needs a timeline |
| Document PiP (T-258) | Optional, unrequested | User asks |
| Spreadsheet paste detection (T-236) | Optional | Users paste columns |
| Ads, CMP, `ads.txt` | No publisher ID, no approval | AdSense approval, then F4 |
| i18n, PWA, accounts, saved lists, share cards | Out of v1 scope | Post-launch demand |
| Cron Generator, QR, Markdown, Password Generator | v2 | After v1 launch and demand check |

---

## 7. Post-launch backlog

Prioritize by Search Console demand, not by count.

### v1.1

- [ ] Case Converter
- [ ] Word and Character Counter
- [ ] Hash Generator (real WebCrypto SHA-1/256/384/512; MD5 only with a vetted implementation)
- [ ] Color Converter
- [ ] Lorem Ipsum Generator
- [ ] Saved lists for Random Name Picker
- [ ] PWA and offline mode (evaluate)
- [ ] Share cards for tests

### v2

- [ ] Cron Generator and Parser
- [ ] QR Code Generator (local library, no network)
- [ ] Markdown Viewer (sanitized)
- [ ] Password Generator (WebCrypto)
- [ ] Stopwatch
- [ ] Coin Flip
- [ ] Team and Group Generator
- [ ] Decision Maker
- [ ] SQL, HTML, and XML Formatter
- [ ] Optional i18n (ES, HI, ID)
- [ ] Accounts only if a measured need appears

Backlog rules:
- Add only when there is a clear query intent and a differentiated tool.
- Reuse the tool contract and shell; no new architecture.
- One tool per PR-sized change, with content and tests.
- Update `PORTING.md` and `THIRD_PARTY_NOTICES.md` in the same change as any port.

---

## 8. Next actions

F1 starts now. The order inside the sprint:

1. Install Playwright, axe, testing library, jsdom, and diagnostics; add `test:e2e`.
2. Write the 24-route smoke spec first, run it, and fix what it finds.
3. Add axe and the no-network test.
4. Add the GitHub Actions workflow and make it required.
5. Add the CopyButton component test and the ui-sdk agent smoke.
6. Fold `check:correctness` into `verify` or delete it.

Before F3 starts, two decisions are blocking: the final name and domain (D-00), and the contact email plus legal entity (D-05). Both are content changes, not code changes, and both can be prepared during F1 and F2.
