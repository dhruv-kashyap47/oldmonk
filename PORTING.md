# Porting and reuse policy

**Status:** Approved 2026-11-20.
**Implementation note (2026-11-23):** no code or data from the audited repositories has been ported yet. The tool logic and content in this release were written for oldmonk. The source map below is the policy and the reuse plan for future ports; a port is recorded here and in `THIRD_PARTY_NOTICES.md` in the same change.
**Purpose:** keep the fastest practical reuse path without importing the debt, unsafe code, or design of the five audited repositories.

Read [Audit.md](./Audit.md) before porting anything. Record every port here. Update [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) in the same change.

---

## 1. Rules

1. **Port logic and data, not UI.** No React, Next, shadcn, Radix, Jotai, or single-file CSS is copied into `src/`.
2. **Ported code lands in a pure module.** It must not import `solid-js`, `@solidjs/*`, touch `document`, or call `fetch`. The Solid component is a thin view.
3. **Write the test first.** A port is not accepted until a known-answer test fails against the naive implementation and passes against the ported one.
4. **No secrets, no network.** Tool logic never sends user input anywhere. The no-network test must cover every `src/tools/**/logic.ts` and `Tool.tsx`.
5. **No `Math.random()` for security-sensitive output.** UUIDs, passwords, random picks, shuffles, dice, and wheel winners use `crypto.getRandomValues` or `crypto.randomUUID`.
6. **No `innerHTML` with user content.** DOM text nodes only. If a Markdown renderer is added later, sanitize it.
7. **No copied copy.** Rewrite descriptions, FAQs, and UI strings. Do not reuse marketing claims, fake statistics, or another project's brand.
8. **Attribution is mandatory.** MIT requires the copyright and permission notice in copies or substantial portions. Add the source to `THIRD_PARTY_NOTICES.md` and a short header comment in the ported file.
9. **One port, one commit.** Keep the source path, destination path, and test names in the commit message.
10. **If a port needs more than a day to make safe, rewrite it.** The donors are references, not obligations.

---

## 2. Status legend

| Status | Meaning |
| --- | --- |
| **Copy** | Data or a tiny pure function, used with minimal edits. |
| **Port** | Logic is sound, but it must be typed, isolated, and tested. |
| **Rewrite** | The idea is useful; the implementation is unsafe, incorrect, or coupled. |
| **Reject** | Do not use, for correctness, security, licensing, or product reasons. |

---

## 3. Source map

### 3.1 devtoolkit (MIT, © 2025 MinJae Kwon / Miti)

| Source | Destination | Status | Notes |
| --- | --- | --- | --- |
| `src/components/tools/JwtDecoder.tsx`: `base64UrlToBytes`, `bytesToBase64Url`, `decodeJsonSegment`, HMAC verify | `src/tools/_shared/jwt.ts` | **Port** | Add tests for HS256/384/512, malformed segments, Unicode payloads. Keep "signature not verified" and "HMAC only" warnings. |
| `src/components/tools/UrlParser.tsx`: URL parsing and query table edits | `src/tools/_shared/url.ts` | **Port** | Use `new URL`; handle malformed percent escapes; never fetch. |
| `src/utils/toolsConfig.ts`: `matchesTool`, `filterTools` | `src/lib/search.ts` | **Port** | Every whitespace token must match name, description, category, or keywords. |
| `src/hooks/useRecentTools.ts` | `src/lib/recent-tools.ts` | **Port concept** | Solid signal + safe `localStorage`; max 6; sync on `storage` events. |
| `src/components/CommandPalette.tsx`: platform shortcut rule | `src/components/search/SearchDialog.tsx` | **Port concept** | ⌘K on Apple, Ctrl+K elsewhere; never claim Ctrl+K on macOS. |
| `src/components/tools/CronGenerator.tsx`: presets | `src/content/presets.ts` | **Copy data** | v2 only. Do not copy the description logic. |
| `src/utils/seo/*`, `src/utils/toolsConfig.ts`: tool intents and keywords | `Plan.md` / `Task.md` research | **Reference** | Rewrite titles/descriptions; do not copy Korean/English marketing copy. |
| `src/components/tools/JsonFormatter.tsx` | none | **Rewrite** | Needs line/column errors, size caps, indent control. |
| `src/components/tools/TextDiff.tsx` | none | **Rewrite** | Use Myers; current is line-index comparison. |
| `src/components/tools/RegexTester.tsx` | none | **Rewrite** | Worker + timeout; no `innerHTML`. |
| `src/components/tools/UuidGenerator.tsx` | none | **Rewrite** | v4 must use WebCrypto; v5 may reuse the SHA-1 namespace idea. |
| `src/components/tools/Base64Converter.tsx` | none | **Rewrite** | `TextEncoder`/`TextDecoder`; URL-safe mode; file bytes. |
| `src/components/tools/UnixTimeConverter.tsx` | none | **Rewrite** | Detect seconds vs milliseconds; validate ranges. |
| `src/components/tools/HashGenerator.tsx` | none | **Reject** | Not MD5/SHA. `"abc"` → `0001786200017862...`; real MD5 is `900150983cd24fb0d6963f7d28e17f72`. |
| `src/components/tools/PasswordGenerator.tsx` | none | **Reject** | Uses `Math.random()`. |
| `src/components/tools/QrCodeGenerator.tsx` | none | **Reject** | Sends text to `api.qrserver.com`. |
| `src/components/tools/MarkdownViewer.tsx` | none | **Reject** | 460-line custom parser + `dangerouslySetInnerHTML`. |
| `src/components/ads/AdBanner.tsx` | none | **Reject** | No consent, no lazy init, visible debug placeholders. |
| `src/services/analytics.ts` | none | **Reject** | GA loads without consent; Plausible adapter is separate. |
| `src/components/SEOHead.tsx` | none | **Reject** | Client-only head mutation. |
| `src/App.tsx`: HashRouter | none | **Reject** | Not indexable. |

### 3.2 HumanEval (MIT, © 2025 Shaikh Warsi)

| Source | Destination | Status | Notes |
| --- | --- | --- | --- |
| `lib/audio.ts`: Web Audio synth | `src/tools/_shared/audio.ts` | **Port** | TypeScript; `AudioContext` unlock on gesture; mute persistence under `oldmonk:v1:audio`; no assets. |
| `components/tests/reaction-time-test.tsx`: state machine | `src/tools/reaction-time-test/logic.ts` | **Port concept** | 5 rounds; 1.5–4.5 s random delay; early click; <120 ms false start; median. Rewrite in Solid. |
| `components/tests/sequence-memory-test.tsx`: pacing | `src/tools/sequence-memory-test/logic.ts` | **Port concept** | 3×3 grid; adaptive 460→260 ms ISI; 450 ms gap; no repeated tile. |
| `components/tests/typing-test.tsx`: per-char view | `src/tools/typing-speed-test/Tool.tsx` | **Reference** | Use the coloring model; rewrite scoring for 15/30/60 s and keystroke accuracy. |
| `lib/score-context.tsx`: score shape | `src/lib/scores.ts` | **Port concept** | `bestScores`, `recentScores`, export/import; no percentiles. |
| `lib/benchmarks.ts` | none | **Reject** | Fabricated "82M+ runs" and hand-written quantile tables. |
| `components/bell-curve.tsx` | none | **Reject** | Depends on the fabricated benchmarks. |
| `components/tests/*` UI | none | **Rewrite** | Neubrutalist; non-semantic click surfaces. |
| `app/*`, `components/ui/*` | none | **Reject** | Next shell, dashboards, Radix tree. |

### 3.3 fancy-fonts-generator (MIT, © 2021 Alan / waterrmalann)

| Source | Destination | Status | Notes |
| --- | --- | --- | --- |
| `fonts.json` | `src/tools/_shared/unicode-fonts.data.ts` | **Copy** | 53 styles. Normalize the 3 malformed digit maps (`Brackets`, `Dashes`, `SideSlashes`) or mark them experimental. Keep the 4 experimental flags. |
| `js/converter.js`: `PseudoFont.convert` | `src/tools/_shared/unicode.ts` | **Rewrite** | `Record<string, string>` lookup; iterate by code point; pass through unmapped characters; never split surrogates. |
| `js/converter.js`: `toAlternateCase`, spaced, reverse | `src/tools/_shared/unicode.ts` | **Port concept** | Pure functions; grapheme-aware where it matters. |
| Accessibility warning | `src/tools/fancy-text-generator/Content.tsx` | **Rewrite copy** | Explain screen-reader and platform limits honestly. |
| `index.html`, `css/main.css` | none | **Reject** | Random background, fixed `cols="60"`, disabled textarea, `alert()` copy. |
| Twemoji CDN | none | **Reject** | External runtime dependency; no network. |

### 3.4 htmlapps-random-picker (MIT, © 2026 ttomohisa)

| Source (`random-picker.html`) | Destination | Status | Notes |
| --- | --- | --- | --- |
| `secureRandomInt` (1441–1449) | `src/tools/_shared/random.ts` | **Port** | Keep rejection sampling; validate positive safe integer. |
| `secureShuffle` (1450–1454) | `src/tools/_shared/random.ts` | **Port** | Fisher–Yates. |
| `selectUnique` (1455–1461) | `src/tools/_shared/random.ts` | **Port** | Partial shuffle; no duplicates in one draw. |
| `parseCandidates` (1345–1358) | `src/tools/_shared/candidates.ts` | **Port** | Trim; blank/duplicate counts; duplicate labels stay distinct; 10,000 cap. |
| `modeError` (1361–1374) | `src/tools/_shared/candidates.ts` | **Port** | Localize messages; teams/wheel/pick limits. |
| `runTeams` (1555–1564) | `src/tools/random-name-picker/logic.ts` | **Port** | Shuffle then round-robin; sizes differ by at most one. |
| `wheelStopAngle` (1652–1656) | `src/tools/spin-wheel/logic.ts` | **Port** | Pick winner first; stop angle inside sector with 8% margin. |
| `drawWheel` (1785+) | `src/tools/spin-wheel/Wheel.tsx` | **Port** | DPR-aware canvas; one classic style; reduced motion = instant result. |
| Exclusion pool / restore / 50-entry history | `src/tools/random-name-picker/logic.ts` | **Port** | Keep the state model; simplify UI. |
| Safe storage wrappers | `src/lib/storage.ts` | **Port** | Namespaced `oldmonk:v1:*`; try/catch; no sensitive content. |
| Spreadsheet paste column detection | `src/tools/random-name-picker/Tool.tsx` | **Port if time** | High value for the name picker; not MVP-blocking. |
| 80-test suite (`tests/*.test.cjs`) | `src/tools/_shared/*.test.ts` | **Port** | Reuse the cases as the specification; do not copy the DOM harness. |
| 2,205-line UI, i18n, Dopa-Gaki, saved lists, share links, PowerShell | none | **Reject** | Out of scope for v1. Saved lists may return in v1.1. |

### 3.5 pomo (MIT, © 2022 nmsn)

| Source | Destination | Status | Notes |
| --- | --- | --- | --- |
| `apps/web/src/hooks/useDocumentPiP.ts` | `src/lib/pip.ts` | **Port concept** | Feature-detect `documentPictureInPicture`; copy styles; close cleanup; optional. |
| `apps/web/src/atoms/timer.ts`: presets | `src/tools/_shared/timer-presets.ts` | **Copy data** | 25/5, 52/17, 40/20, countdown, stopwatch. |
| `apps/web/src/components/TimerRenderer.tsx` | none | **Reference** | Large tabular numerals, progress bar, mode toggle. |
| `setInterval` timer, Jotai atoms, React components | none | **Reject** | Drift; framework mismatch. |
| `apps/server/*` | none | **Reject** | No backend, database, auth, or SSE. |

### 3.6 OpenDesignMD design guides (MIT, © 2026 Fudge / VoltAgent)

Not code. Design references captured from [OpenDesignMD](https://opendesignmd.com); the mapping to our tokens is in [design/REFERENCES.md](./design/REFERENCES.md).

| Source | Destination | Status | Notes |
| --- | --- | --- | --- |
| `designs/research-perplexity-ai/DESIGN.md` | `design/references/catalog-index.research-perplexity-ai.DESIGN.md` | **Reference** | Row anatomy, mono metadata, section rhythm. |
| `designs/thinkwithmark/DESIGN.md` | `design/references/tool-workbench.thinkwithmark.DESIGN.md` | **Reference** | Spec grid, surface ladder, panel states. |
| `designs/pangram/DESIGN.md` | `design/references/category-system.pangram.DESIGN.md` | **Reference** | Category tints, dashed rules, focus ring. |
| Their fonts, screenshots, logos, imagery | none | **Reject** | Brand assets and licensing do not transfer. |

---

## 4. Rejected code: do not resurrect

| Rejected item | Source | Reason |
| --- | --- | --- |
| HashGenerator | devtoolkit | Not MD5/SHA; produces wrong digests. |
| PasswordGenerator | devtoolkit | `Math.random()`. |
| UUID v4 | devtoolkit | `Math.random()`. |
| QR generator | devtoolkit | Sends user text to a third party. |
| Regex highlighter | devtoolkit | `innerHTML` XSS path; no timeout. |
| Markdown viewer | devtoolkit | Custom parser + `dangerouslySetInnerHTML`. |
| `SEOHead` | devtoolkit | Client-only metadata. |
| HashRouter + sitemap | devtoolkit | 45 sitemap URLs do not match the app's hash routes. |
| AdBanner / GA service | devtoolkit | No consent; debug placeholders; CLS. |
| `lib/benchmarks.ts` | HumanEval | Fabricated "empirical" data and percentiles. |
| Bell curve / CGI / tiers | HumanEval | Depends on fabricated data. |
| Neubrutalist test UI | HumanEval | Design conflict; accessibility gaps. |
| `String.prototype` patches | fancy-fonts | Global mutation. |
| `innerHTML` output / `execCommand` / `alert` | fancy-fonts | XSS, deprecated APIs, poor a11y. |
| Twemoji CDN | fancy-fonts | External runtime request. |
| 2,205-line vanilla UI | random-picker | Not maintainable across 24 tools. |
| Dopa-Gaki celebration | random-picker | Brand mismatch; large effect surface. |
| Saved lists / share links | random-picker | v1.1/v2, not MVP. |
| `setInterval` timer | pomo | Drifts in background tabs. |
| Server / auth / Drizzle / SSE | pomo | Violates the no-backend constraint. |
| `user-scalable=0` | pomo | Prevents zoom. |

---

## 5. Per-tool mapping

| Tool | Primary source | Reuse | Remaining work |
| --- | --- | --- | --- |
| JSON Formatter | none | Native `JSON` | Parser error line/column, indent/sort, size cap |
| JSON Validator | JSON Formatter core | Shared | Error codes, jump-to-line, samples |
| JSON Minifier | JSON Formatter core | Shared | Byte stats, percent saved |
| Regex Tester | devtoolkit concept | Low | Worker, timeout, groups, replace preview, safe highlight |
| JWT Decoder | devtoolkit helpers | Medium | Claims table, expiry, optional HMAC verify |
| Base64 | devtoolkit concept | Low | UTF-8, URL-safe, file bytes, errors |
| URL Encoder | devtoolkit URL logic | Medium | Component vs full URL, query table |
| UUID | devtoolkit concept | Low | WebCrypto v4/v7, bulk, format options |
| Timestamp | devtoolkit concept | Low | s/ms detection, time zones, relative time |
| Diff | none | None | Myers, inline diff, unified view, limits |
| Fancy Text | fancy-fonts | High | Engine, style cards, copy, coverage tests |
| Cursive Text | fancy-fonts | High | Curated styles, fallback notes |
| Symbols | none | None | Curated categories, search, click-to-copy |
| Instagram Fonts | fancy-fonts | High | Bio counter, line breaks, disclaimer |
| Random Number | random-picker | High | Range, bulk, unique, crypto |
| Name Picker | random-picker | High | Parsing, no-repeat, history, teams |
| Spin Wheel | random-picker | High | Canvas, reduced motion, list fallback |
| Dice Roller | random-picker RNG | Medium | Notation, modifiers, history |
| Pomodoro | pomo presets / PiP | Low | Timestamp clock, cycles, audio, wake lock |
| Countdown | none | None | Presets, precise finish, audio |
| Typing Speed | HumanEval pattern | Medium | 15/30/60 s, keystroke accuracy, replay |
| Reaction Time | HumanEval pattern | Medium | 5 rounds, early click, median |
| Sequence Memory | HumanEval pattern | Medium | 3×3, pacing, scoring, keyboard |
| Click Speed | none | None | 10 s window, CPS, consistency |

---

## 6. Porting checklist

Copy this into the PR or commit message:

```
Source:
  repo:
  file:
  function/lines:
Destination:
Status: Copy / Port / Rewrite
License notice updated: yes/no
Pure module (no solid, no DOM, no fetch): yes/no
Known-answer test added: yes/no
Edge cases covered:
  - empty input
  - maximum input
  - Unicode
  - invalid input
No-network test passes: yes/no
Bundle impact (gzip):
```

A port is done only when:

- It is typed and exported from a pure module.
- It has known-answer tests, including one failure case and one Unicode case.
- It has no `document`, `window`, `fetch`, `XMLHttpRequest`, `localStorage`, or Solid import.
- Its source and license are recorded here and in `THIRD_PARTY_NOTICES.md`.
- The tool page passes the per-tool definition of done in `Task.md`.

---

## 7. Attribution

MIT requires the copyright notice and permission notice to be included in copies or substantial portions. The project keeps one consolidated notice in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md), linked from the footer and the About page. Ported files also carry a short header:

```ts
// Ported from <repo> (<source path>), MIT.
// Copyright (c) <year> <author>. See THIRD_PARTY_NOTICES.md.
```

Do not use the source project's name, logo, or visual identity as branding. "HumanEval" is strongly associated with OpenAI's benchmark; "DevToolkit" and "oldmonk" both carry naming risk. The product name is still a launch blocker.
