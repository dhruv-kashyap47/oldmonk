# Design references

**Status:** decided 2026-11-20.
**Scope:** `Plan.md` §4 ("The Catalog"). Direction, palette, and Bitter are unchanged. These guides supply the anatomy the plan describes but does not specify.

Three MIT-licensed DESIGN.md guides from [OpenDesignMD](https://opendesignmd.com) are kept verbatim in `design/references/`. They are references, not a style to copy wholesale: no font files, screenshots, logos, or brand assets come with them.

## 1. Split

| Surface | File | Source | Governs |
| --- | --- | --- | --- |
| Catalog home | `design/references/catalog-index.research-perplexity-ai.DESIGN.md` | https://opendesignmd.com/designs/research-perplexity-ai/ | Row anatomy, mono metadata, section rhythm |
| Tool workbench | `design/references/tool-workbench.thinkwithmark.DESIGN.md` | https://opendesignmd.com/designs/thinkwithmark/ | Spec grid, surface ladder, panel states |
| Category markers | `design/references/category-system.pangram.DESIGN.md` | https://opendesignmd.com/designs/pangram/ | Tint system, dashed rules, focus ring |

## 2. Why these three

Scored all 1,186 records from `https://opendesignmd.com/api/designs.json` by palette distance to the §4.2 tokens, then read the full guides. These three were the only light-mode, dense, in-browser products whose palettes landed within a few units of ours **and** whose page structures answer a real gap.

- **research.perplexity.ai**: `canvas #F6F5EE`, `ink #091717`, secondary `#2E565E`, mono labels, and an index page built from asymmetric two-column entries with category and date on a shared rule. It is the closest thing in the library to the catalog home.
- **thinkwithmark.com**: `#FFFCF5 → #F7F2E8 → #F2EFE8 → #EFE5D1` surface ladder, petrol-black `#0D1B1E`, and a label/value spec grid. It is the closest thing to a tool page that states facts without cards.
- **pangram.com**: warm canvas `#F8F7F5`, deep green `#15502E`, tangerine `#FF5E00` / `#D17A01`, and **category tints used as UI**: peach, lavender, mint, yellow. It solves the plum/moss/rose marker problem without inventing a card kit.

Runner-ups considered and why they lost: `cosmos.so` (exact plum/rose/olive, but paper-white marketing only), `land-book.com` (petrol `#017669` and compact UI, but pill everything), `typewolf.com` (best index rows, but warm paper plus high-contrast serif is the exact cliché §4.1 bans), `percival.ink` (strong serif workbench, cold gray palette).

## 3. Token check

The point of the score was to test our palette, not replace it. Six tokens land within a few units of a shipping product:

| Ours | Reference | Verdict |
| --- | --- | --- |
| `--bg #F3F0E6` | `#F6F5EE` | Keep. Four units apart. |
| `--surface #FFFCF4` | `#FFFCF5` | Keep. Identical intent. |
| `--line #DCD6C5` | `#DDD6CB` | Keep. |
| `--muted #676357` | `#64645F` | Keep. |
| `--accent #1E5A62` | `#2E565E` | Keep. Same hue family, ours is darker for AA on paper. |
| `--accent-warm #B86B16` | `#D17A01` | Keep ours. Theirs fails AA as small body text. |

No palette change. The references govern **anatomy and usage**, not hex values.

## 4. Catalog home

From the index page of `research.perplexity-ai`:

- **Row anatomy:** tool name (Bitter 600, 20px), one-line description (`--muted`, 15px), category label and metadata on the right. One thin rule above each row, none below. No card, no shadow, no rounded container.
- **Metadata is mono, body is not.** System mono stack, 12px, 400, `0.03em` tracking, `--muted`, sentence case. Use it for counts, kind, and updated dates only, never for UI labels or buttons. One stack for code output and metadata; no extra font is downloaded for this.
- **Baseline alignment:** category label and metadata share one baseline at the end of the row, separated by an 8px gap. On narrow screens the metadata wraps under the description, never into a second column.
- **Section rhythm:** 96px between categories, 64px between the intro and the first row, 32px between the hero and search, 16px inside a row.
- **Section headers:** Bitter `clamp(1.6rem, 2.5vw, 2.25rem)`, sentence case, one short sentence of intro to the left at ≥1024px. No all-caps eyebrows, no counts in the heading.
- **Search:** one input, 44px tall, 14px radius, inline with the hero. Results replace rows in place, with a polite count announcement.

## 5. Tool workbench

From `thinkwithmark`, adapted to a workbench:

- **Surface ladder:** `--bg` page, `--surface` panel, `--surface-2` well for inputs and outputs, `--surface-2` plus 8% accent tint for the active result. This replaces "card on card" with value contrast. Never nest more than two surfaces.
- **Spec grid:** two columns, 48px column gap, 40px row gap, label 13px `--muted`, value 15px `--ink`. Use it for tool facts: input, output, limit, storage, keyboard. It sits under the actions, above the how-to. **Ships with the first tool page**, as part of the design gate, so there is no second layout pass later.
- **Panel radius:** 14px on panels, 8px on buttons, pills only for tags, unchanged from §4.3. The reference's 16 to 20px media radius applies to result previews, not to containers.
- **Quiet states:** empty, loading, and error states use the same ladder and a single line of copy. No illustration, no skeleton shimmer.

Deliberately **not** adopted: the reference's sectional dark (a dark hero inside a light page). Sectional dark fights the theme toggle; dark is handled by the `[data-theme]` token set instead.

## 6. Category markers

From `pangram`'s feature tints, which is the only reference that uses color as taxonomy rather than decoration:

| Marker | Token | Usage |
| --- | --- | --- |
| Developer | `--cat-dev` | 8% tint chip background, full-strength 6px dot, label in `--muted` |
| Text | `--cat-text` | Same pattern |
| Random | `--cat-random` | Same pattern |
| Timer | `--cat-timer` | Same pattern; small text uses `--cat-timer`, which passes AA |
| Test | `--cat-test` | Same pattern |

Rules: the tint never fills a row, never colors a heading, and never appears as a left border. One marker per row. In dark mode the tint drops to 14% because the surfaces are lighter than the paper.

Two other patterns are worth keeping. First, a **1px dashed `--line`** separating filter groups only: catalog rows keep the solid rule above, and the footer stays plain. Second, a **double-ring focus state**, 2px `--surface` inside a 4px `--focus` outer, instead of the browser default.

## 7. Not adopted

Do not reintroduce these from the reference files: cinematic full-bleed imagery, GT Canon or Copernicus, `#0000EE` links, 3rem-rounded feature cards, pill-shaped primary buttons, gradients on pricing or result cards, dashed borders on catalog rows, monospace for navigation, cream plus terracotta.

## 8. Resolved decisions

| Decision | Rule | Consequence |
| --- | --- | --- |
| Mono stack | System mono, shared with code output | No extra font, no extra preload. Accept per-OS rendering differences. |
| Spec grid | Ships with the first tool page | Built and reviewed inside the design gate; no follow-up layout pass. |
| Dashed rules | Filter groups only | Catalog rows keep one solid rule above; footer groups stay plain. |

Revisit only if the design gate (G-01) fails on row legibility or metadata rendering.
