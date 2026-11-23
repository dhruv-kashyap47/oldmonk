# Audit — five open-source repos

**Date:** 2026-11-20
**Method:** cloned each repository at HEAD, read the build configuration, routes, tool implementations, tests, and licenses. Ran the tests where they existed. Did not trust README claims.
**Scope:** determine what is safe to reuse in a Solid 2 browser-first tools platform, what must be rewritten, and what must be rejected.
**Related:** [PORTING.md](./PORTING.md), [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md), [Plan.md](./Plan.md), [Task.md](./Task.md).

---

## 1. Summary

| Repo | Stack | Last commit | Runtime deps | Tests | License | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| devtoolkit | React 18, Vite 5, Tailwind 3, shadcn, HashRouter | 2026-09-11 | 51 | None | MIT, © 2025 MinJae Kwon (Miti) | Reference only |
| HumanEval | Next 15, React 18, Tailwind 4, shadcn | 2026-10-06 | 53 | None | MIT, © 2025 Shaikh Warsi | Patterns + audio only |
| fancy-fonts-generator | Vanilla HTML/CSS/JS | 2022-12-19 | 0 | None | MIT, © 2021 Alan | Data only |
| htmlapps-random-picker | Single HTML, zero deps | 2026-11-15 | 0 | 80 passing | MIT, © 2026 ttomohisa | Logic donor |
| pomo | Next 16, React 19, Jotai, Drizzle/Postgres | 2026-03-28 | 18 web + server | None | MIT, © 2022 nmsn | PiP pattern only |

**Conclusion:** none of the five is a viable base. Keep the existing `oldmonk` Solid scaffold. Port framework-free logic and data, not UI.

---

## 2. devtoolkit

**Stack:** React 18.3, Vite 5, Tailwind 3, shadcn/Radix (20 Radix packages), `react-router-dom` 6 with `HashRouter`, TanStack Query, cmdk, sonner. 51 runtime dependencies, 17 dev dependencies. No test runner.

**Shape:** one SPA. `Index` + `ToolPage`, 44 tool entries in `src/utils/toolsConfig.ts`, per-tool SEO copy under `src/utils/seo/*`, translations under `src/utils/translations/*`, shadcn primitives under `src/components/ui/*`.

### What is worth taking

| Item | Location | Action |
| --- | --- | --- |
| Multi-token search scorer | `src/utils/toolsConfig.ts` (`matchesTool`, `filterTools`) | Port concept, ~10 lines |
| Recent-tools store pattern | `src/hooks/useRecentTools.ts` | Port concept to Solid signals |
| Platform-specific ⌘K rule | `src/components/CommandPalette.tsx` | Port the rule, not the cmdk UI |
| JWT base64url + HMAC helpers | `src/components/tools/JwtDecoder.tsx` | Port helpers, add tests |
| URL query-table editing | `src/components/tools/UrlParser.tsx` | Port logic |
| Cron presets | `src/components/tools/CronGenerator.tsx` | Keep as data for v2 |
| Tool intent/keyword inventory | `src/utils/toolsConfig.ts` | Use as research input |

### What must be rewritten

- JSON formatting and error reporting (needs line/column).
- Base64 (must use `TextEncoder`/`TextDecoder`; `btoa` fails on Unicode).
- UUID (must use `crypto.randomUUID` / `crypto.getRandomValues`).
- Timestamp conversion (needs seconds/milliseconds detection).
- Diff (needs Myers or equivalent; current is line-index comparison).
- Regex (needs a Worker timeout and safe highlighting).
- Cron description and next-run calculation (v2).

### What must be rejected

- **HashGenerator is not MD5/SHA.** It computes a 32-bit string hash and pads/repeats it. For `"abc"` the tool returns `0001786200017862...`; real MD5 is `900150983cd24fb0d6963f7d28e17f72`.
- **UUID v4 uses `Math.random()`** (`UuidGenerator.tsx`).
- **PasswordGenerator uses `Math.random()`** (`PasswordGenerator.tsx`).
- **QrCodeGenerator sends user text to `api.qrserver.com`** (`QrCodeGenerator.tsx`), contradicting the README's "nothing leaves your machine."
- **RegexTester builds `innerHTML` from the test string** (`highlightMatches`), creating an XSS/self-XSS path. It also runs regex on the main thread without a timeout.
- **TextDiff compares line *i* to line *i***, so any insertion shifts all following lines.
- **Base64Converter uses `btoa`/`atob`**, so `"hi 😀"` throws `InvalidCharacterError`.
- **CronGenerator has no next-run calculation** and hardcodes Korean particles inside English strings.
- **UnixTimeConverter assumes every number is seconds** and uses weak validation.
- **GA4 loads on `DOMContentLoaded`** with no consent gate; AdSense has no CMP.
- **No privacy, terms, or about routes.**
- **HashRouter + `SEOHead`**: routes are `/#/tools/...`; per-page metadata is applied in `useEffect`.
- **Sitemap mismatch**: `public/sitemap.xml` lists 45 URLs without `#` (home + 44 tools), but the app serves hash routes. Every tool URL in the sitemap is a different URL from the app's route.
- **SPA fallback**: `/* /index.html 200` produces soft 404s at scale.

### Quality scores (1–5, based on implementation)

| SEO | Accessibility | Mobile | Performance |
| --- | --- | --- | --- |
| 1.5 | 3 | 4 | 2.5 |

---

## 3. HumanEval

**Stack:** Next 15.2.8, React 18, Tailwind 4, shadcn/Radix (27 Radix packages). 53 runtime dependencies. `next.config.mjs` sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true`. No tests. Includes a feedback API route, so it is not purely static.

**Shape:** 9 client test components: reaction time, sequence memory, number memory, chimp test, visual memory, aim trainer, verbal memory, typing, reading comprehension.

### What is worth taking

| Item | Location | Action |
| --- | --- | --- |
| Web Audio synth (tones, click, success, error, tile notes) | `lib/audio.ts` | Port class to TypeScript; keep mute persistence |
| Reaction state machine | `components/tests/reaction-time-test.tsx` | Use as behavioral spec; rewrite in Solid |
| Sequence memory pacing | `components/tests/sequence-memory-test.tsx` | Use adaptive 460→260 ms ISI and 450 ms gap |
| Per-character typing coloring | `components/tests/typing-test.tsx` | Use the visual model; rewrite the scoring |
| Score storage shape | `lib/score-context.tsx` | Keep best/recent/history concept; simplify |

### What must be rejected

- **`lib/benchmarks.ts` is fabricated authority.** It claims "82,000,000+ runs," cites Woods et al., Miller, and a Kyoto primate study, and provides quantile tables and a "CGI" index. There is no dataset, no methodology, and no reproducible source in the repository. The tables are hand-written constants.
- **Percentile badges, bell curves, "Apex Neuro" tiers.** These are invented and conflict with the product rule "No fake numbers."
- **Typing test scoring.** It only ends when the passage is finished (no 15/30/60 s modes), `startTime` is React state, and accuracy is character-based rather than keystroke-based.
- **Accessibility gaps.** The reaction arena is a `<div onClick>` with no role, tab index, or keyboard path. Sequence grid buttons have no accessible names.
- **All neubrutalist UI.** Heavy borders, dark-first, oversized type; conflicts with "The Catalog."
- **Next app shell, dashboard, profile, engine, facility, feedback API.** Out of scope.

### Quality scores

| SEO | Accessibility | Mobile | Performance |
| --- | --- | --- | --- |
| 3 | 1.5 | 3 | 2 |

---

## 4. fancy-fonts-generator

**Stack:** vanilla HTML/CSS/JS, roughly 352 lines, one dev dependency (`live-server`), no build step.

**Data audit:** `fonts.json` contains **53 styles**. Four are marked experimental (`Comic`, `Andalusia`, `Manga`, `Rune`). Three non-experimental styles have malformed digit maps: `Brackets` (9 digits), `Dashes` (9), `SideSlashes` (11). Empty maps default to ASCII in the original code.

### What is worth taking

- `fonts.json` — the single biggest time-saver in this audit.
- The lowercase/uppercase/digit mapping model.
- Style transforms: uppercase, lowercase, alternating case, spaced, reversed.
- The accessibility warning about screen readers and platform font coverage.

### What must be rewritten

- Conversion as a pure `Record<string, string>` lookup with grapheme-safe iteration.
- Coverage tests for every A–Z, a–z, and 0–9 in every style.
- UI: input, style cards, per-style copy, copy all, character count, mobile layout.

### What must be rejected

- `String.prototype.unicodeAwareSplit` and `String.prototype.toAlternateCase` monkey-patches.
- `innerHTML` output.
- `document.execCommand('copy')` plus `alert()`.
- Runtime `fetch("fonts.json")`; if it fails, the textarea stays disabled and the tool is unusable.
- The Twemoji CDN script and `document.body.innerHTML = twemoji.parse(...)`.
- Random pastel page background on every load.
- The pun list (low value, not needed for the tool).

### Quality scores

| SEO | Accessibility | Mobile | Performance |
| --- | --- | --- | --- |
| 2 | 2 | 1.5 | 4 |

---

## 5. htmlapps-random-picker

**Stack:** one 2,205-line HTML file with inline CSS/JS. Zero runtime dependencies. PowerShell build produces a readable HTML and a gzip self-extracting HTML. CSP includes `connect-src 'none'`. **80 Node tests, all passing.**

### What is worth taking

| Item | Location in `random-picker.html` | Action |
| --- | --- | --- |
| `secureRandomInt` rejection sampling | lines 1441–1449 | Port almost verbatim |
| `secureShuffle` Fisher–Yates | 1450–1454 | Port almost verbatim |
| `selectUnique` partial shuffle | 1455–1461 | Port almost verbatim |
| `parseCandidates` | 1345–1358 | Port; add types |
| `modeError` validation | 1361–1374 | Port; localize messages |
| `runTeams` round-robin | 1555–1564 | Port |
| `wheelStopAngle` | 1652–1656 | Port |
| `drawWheel` DPR canvas | 1785+ | Port, simplify |
| Exclusion pool / restore / history | throughout | Port reducer model |
| Safe storage wrappers | throughout | Port |
| Spreadsheet paste column detection | throughout | Port if time allows |
| The 80-test suite | `tests/*.test.cjs` | Use as the porting spec |

### What must be rejected

- The 2,205-line HTML/CSS UI.
- Japanese/English i18n layer.
- "Dopa-Gaki" full-screen celebration (brand mismatch, large effect surface).
- Saved lists, rename, duplicate, undo (v1.1/v2).
- Legacy gzip share-link import (attack surface, not needed).
- PowerShell build and self-extracting HTML build.

### Quality scores

| SEO | Accessibility | Mobile | Performance |
| --- | --- | --- | --- |
| 3.5 | 4.5 | 5 | 4.5 |

---

## 6. pomo

**Stack:** pnpm monorepo. Web: Next 16, React 19, Jotai, Tailwind 4, Radix, canvas-confetti, shaders. Server: Drizzle/Postgres, better-auth, SSE. `reactStrictMode: false`. No tests.

### What is worth taking

| Item | Location | Action |
| --- | --- | --- |
| Document Picture-in-Picture pattern | `apps/web/src/hooks/useDocumentPiP.ts` | Port to a Solid primitive |
| Timer presets (25/5, 52/17, 40/20, countdown, stopwatch) | `apps/web/src/atoms/timer.ts` | Keep as data |
| Large tabular-numeral timer layout | `apps/web/src/components/TimerRenderer.tsx` | Inspiration only |

### What must be rejected

- **`setInterval` decrement timer.** It drifts when the tab is backgrounded. Use `performance.now()` plus visibility-change correction.
- **Chinese strings hardcoded** inside atoms and components.
- **`user-scalable=0`** in the viewport meta (prevents zoom).
- **The entire server:** Drizzle, Postgres, better-auth, sessions, stats, SSE.
- **Jotai atoms and React components.**
- **Canvas confetti, shader backgrounds, auth login toast.**

The README's "no network requests / localStorage only" claim is stale: the repository now contains a server and database.

### Quality scores

| SEO | Accessibility | Mobile | Performance |
| --- | --- | --- | --- |
| 2 | 3 | 3 | 2.5 |

---

## 7. README vs reality

| Claim | Reality |
| --- | --- |
| devtoolkit: "44 tools" | Correct: 44 tool entries across 8 categories. |
| devtoolkit: "nothing leaves your machine" | False for the QR tool, which sends text to `api.qrserver.com`; GA/AdSense also load. |
| devtoolkit: "MD5/SHA hashes" | False: a 32-bit string hash padded to length. |
| devtoolkit: "UUID v4" | False: `Math.random()`. |
| devtoolkit: sitemap lists tool URLs | 45 URLs, none with `#`, while the app uses HashRouter. |
| HumanEval: "82M+ empirical runs" | No dataset, no methodology; hand-written quantile tables. |
| fancy-fonts: "50+ fonts" | 53 styles; 3 have malformed digit maps. |
| random-picker: "no network, tested, mobile" | Accurate; 80 tests pass. |
| pomo: "no network requests, localStorage only" | Stale; the repo includes a server, auth, and Postgres. |

---

## 8. Base decision

### Keep the existing `oldmonk` scaffold

Verified on 2026-11-20:

- `npm run verify` passes (typecheck, lint, test with zero tests, build).
- `handleRequest(new Request("http://localhost/"))` returns 200.
- The rendered HTML contains `<title>`, meta description, canonical-ready head structure, and the Bitter font preload.
- Client build: ~51 KB gzip JS + 14.8 KB gzip CSS before tools.

### Do not fork any of the five

- **devtoolkit**: HashRouter, sitemap mismatch, client-only meta, 51 deps, wrong crypto, network QR.
- **HumanEval**: fabricated benchmarks, global metadata, TS errors ignored, 53 deps.
- **fancy-fonts**: one page, no framework, deprecated APIs.
- **random-picker**: best logic, but a monolithic single-file app.
- **pomo**: backend/auth/DB, drifting timer.

The framework decision belongs to the platform, not the donors. The reusable assets are framework-free, so Solid 2 remains the right choice. Set a go/no-go gate after the JSON vertical slice; if Solid blocks progress for more than two working days, switch the shell to React + Vite and keep the logic modules unchanged.

---

## 9. Written records

- **Reuse map and rejected code:** [PORTING.md](./PORTING.md)
- **MIT attribution:** [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)
- **Execution plan:** [Plan.md](./Plan.md)
- **Task checklist:** [Task.md](./Task.md)
