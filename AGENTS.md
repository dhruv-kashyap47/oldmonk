# AGENTS.md

## ui-sdk

Before using ui-sdk, follow the `ui-sdk` skill if it is installed, and read `node_modules/@ui-sdk/solid/docs/llms.txt`.

To build a new component, also search `node_modules/@ui-sdk/solid/docs/core.md` by heading, and read `node_modules/@ui-sdk/solid/docs/rendering.md` next to it.

This project uses Solid 2 (`solid-js` and `@solidjs/web` 2.0.0 or newer). ui-sdk components are unstyled and imported per entry, for example `@ui-sdk/solid/button`. Keep `@ui-sdk/core` excluded from Vite dependency pre-bundling.

## Skills

- `ui-sdk`: before using ui-sdk; read the package docs listed above.
- `frontend-design`: for visual direction, layout, typography, and design critique.
- `free-tools`: for tool selection, page angle, and free-tool SEO strategy.
- `copywriting`: for homepage, tool-page, and legal copy.

## Repo reuse

Read `Audit.md` and `PORTING.md` before porting any code from an external repository.

- Port framework-free logic and data only. Do not copy React, Next, shadcn, Radix, Jotai, or single-file UI into `src/`.
- Record every port in `PORTING.md` and add its MIT notice to `THIRD_PARTY_NOTICES.md` in the same change.
- Rejected code must not be reintroduced: devtoolkit HashGenerator, PasswordGenerator, UUID v4, QR generator, regex highlighter, Markdown viewer, `SEOHead`, HashRouter, AdBanner, GA service; HumanEval `benchmarks.ts`, bell curve, CGI tiers, neubrutalist UI; fancy-fonts `innerHTML`/`execCommand`/Twemoji; random-picker single-file UI/Dopa-Gaki; pomo `setInterval` timer/server.
- No fake numbers. No invented percentiles, benchmarks, user counts, ratings, or "studies show" claims.
- `logic.ts` must not import `solid-js`, `@solidjs/*`, or touch the DOM, storage, or network.
- No `Math.random()` for UUIDs, passwords, picks, shuffles, dice, or wheel winners.

## Design: mandatory build rules

These rules apply to every change that produces or alters UI. They are not suggestions. If a rule conflicts with a reference guide, `Plan.md` §4 wins.

Before writing UI code:

1. Read `Plan.md` §4 and `design/REFERENCES.md`.
2. Update `Task.md` before starting, and tick the item when the gate below passes.

The gate:

- [ ] **Tokens only.** Colors, radii, spacing, and type come from the CSS variables in `src/styles/app.css`. No raw hex in components, no ad hoc pixel values for spacing.
- [ ] **Type.** Bitter 500 to 700 for display. System sans for UI. System mono for code and for metadata (12px, `0.03em` tracking, muted). Metadata mono is for counts, kind, and dates only, never for labels or buttons.
- [ ] **Catalog rows.** One solid rule above the row, none below. No card, no shadow, no rounded container, no left border. Name, one-line description, then category and metadata on a shared baseline.
- [ ] **Category markers.** A tint chip with a category-color mono label (8 percent tint, 14 percent in dark). No dot. One per row. Never fills a row, never colors a heading, never appears as a border.
- [ ] **Tool pages.** Breadcrumb, H1, summary, badges, panel (880px standard, 1200px wide), actions, spec grid, how-to, ad slot, explanation, FAQ, related tools, footer.
- [ ] **Spec grid.** Two columns, 48px column gap, 40px row gap, label 13px muted, value 15px ink. It ships with the first tool page.
- [ ] **Rules and focus.** Dashed hairlines in filter groups only. Focus is a 2px surface ring inside a 4px focus ring.
- [ ] **Both themes.** Check light and dark before calling the work done.
- [ ] **Motion.** 140ms for UI transitions, a 240ms page settle, and a 45ms catalog row stagger. One orchestrated moment on the home page, reduced motion respected, no looping decoration.
- [ ] **Copy.** No em dashes (see below). Sentence case. No all-caps eyebrows. No "it's not X, it's Y" or "no X, no Y, no Z".
- [ ] **Logo.** `assets/logo/main-logo.png` and `main-favicon.png` are the only brand artwork, derived by `npm run brand:assets` into `public/brand/`. The header and footer use `mark-128.png` plus the site name in Bitter (`size-9` and `size-8`). The full lockup is for dark surfaces only: its `old` letters are white on a transparent field and vanish on paper. Never redraw the mark, never generate a second logo, never recolor it.

Do not add a visual pattern that is not in `Plan.md` §4 or `design/REFERENCES.md`. If a new pattern is genuinely needed, record it in `design/REFERENCES.md` in the same change.

The direction, unchanged: "The Catalog". Warm stone paper, deep petrol accent, apricot highlights, plum/moss/rose category markers, Bitter slab serif for display, system sans for UI. Directory-style homepage with catalog rows, not a card grid. Single-column tool pages with a wide workspace mode. Light and dark.

## Writing

- **No em dashes.** The character U+2014 is banned in code, copy, docs, commit messages, and chat. Use a comma, a colon, a period, or parentheses. For a pause, rewrite the sentence. `npm run check:copy` enforces this over `src/` and `public/` and runs inside `npm run verify`.
- No en dash used as a dash. Use the words "to" or "from" in ranges.
- No AI tells: no "it's not X, it's Y", no "no X, no Y, no Z", no decorative arrows on every link, no invented statistics.
- Claims must be supportable. If a claim needs evidence we do not have, cut it.

## Project

- `npm run dev`: Vite dev server with SSR.
- `npm run typecheck`: TypeScript.
- `npm run lint`: oxlint.
- `npm run check:copy`: fails on em dashes in `src/` and `public/`.
- `npm run test`: Vitest.
- `npm run build`: production build.
- `npm run verify`: typecheck, lint, check:copy, test, build.

Docs: `Plan.md`, `Task.md`, `Audit.md`, `PORTING.md`, `THIRD_PARTY_NOTICES.md`, `design/REFERENCES.md`.

Read `Plan.md`, `Task.md`, and `PORTING.md` before making architectural changes.

Verbatim third-party guides in `design/references/` are exempt from the writing rules. Do not edit below their provenance header.
