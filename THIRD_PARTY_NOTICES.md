# Third-party notices

This project links to, installs, and references third-party work. This file records the licenses that apply and the one case where third-party text is copied into the repository.

**Implementation status (2026-11-23):** the tool logic and content in this release were written for oldmonk. No code or data has been copied from the five audited repositories. [PORTING.md](./PORTING.md) keeps the reuse policy and the source map for future ports. When a port lands, its copyright notice and license text must be added here in the same change.

---

## Copied text

Only the three design guides in `design/references/` are copied into the repository. They are MIT licensed. The MIT permission notice below applies to those files.

## MIT License

Copyright notices for the individual guides are listed under [Design guides](#design-guides).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Design guides

Three design guides are kept verbatim in `design/references/`. They are documentation, not shipped code. No font files, screenshots, logos, or imagery were copied.

- **Source:** https://opendesignmd.com/designs/research-perplexity-ai/ , /designs/thinkwithmark/ , /designs/pangram/
- **Copyright:** Copyright (c) 2026 Fudge; Copyright (c) 2026 VoltAgent
- **License:** MIT (https://opendesignmd.com/licenses/)
- **Used portions:** the DESIGN.md text files only, as design references. The mapping to this project's tokens is in [design/REFERENCES.md](./design/REFERENCES.md).
- **Not used:** GT Canon, Copernicus, PP Eiko, IBM Plex, or any other referenced typeface; their screenshots, logos, imagery, and brand names.
- **Files:** `design/references/*.DESIGN.md`, `design/REFERENCES.md`.

---

## Fonts

**Bitter** is self-hosted at `public/fonts/bitter-latin-var.woff2`. It is licensed under the SIL Open Font License 1.1. The license text is at `public/fonts/OFL.txt`.

No other font files are bundled. UI and code use system font stacks.

---

## Runtime dependencies

Runtime dependencies are installed from npm and pinned in `package-lock.json`. They are not copied into this repository. The deployed page loads no third-party JavaScript unless `VITE_PLAUSIBLE_DOMAIN` is set, in which case the Plausible script loads from `https://plausible.io/js/script.js`.

| Package | License |
| --- | --- |
| `solid-js`, `@solidjs/web`, `@solidjs/router`, `@solidjs/meta` | MIT |
| `@ui-sdk/solid`, `@ui-sdk/core` | MIT |
| `tailwindcss`, `@tailwindcss/vite` | MIT |
| `vite`, `vitest`, `tsx`, `oxlint`, `typescript` | MIT or Apache 2.0 |

The full text of each license ships in `node_modules/<package>/LICENSE` after installation. If a dependency is added, check its license and add a notice here when required.

---

## Audited repositories

`Audit.md` records the five open-source repositories that informed the product research. No code, data, UI, or brand assets from them are present in this release. The rejected items are listed in [PORTING.md](./PORTING.md) §4 and must not be reintroduced.
