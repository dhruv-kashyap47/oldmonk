import { For } from "solid-js";
import { categories } from "../../content/categories";
import { categoryColor, categoryInk } from "../../lib/category-style";
import { site } from "../../seo/site";
import { Container } from "./Container";
import { focusRing } from "../ui/styles";

const siteLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/notices", label: "Notices" },
];

export function SiteFooter() {
  return (
    <footer
      class="mt-24 border-t-2 py-12"
      style="border-top-color: color-mix(in srgb, var(--color-accent-warm) 45%, var(--color-line))"
    >
      <Container class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div class="lg:col-span-2">
          <a href="/" class={`${focusRing} inline-flex items-center gap-2 rounded-control no-underline`}>
            <img
              src="/brand/mark-128.png"
              alt=""
              width="128"
              height="128"
              class="size-8 rounded-control"
            />
            <span class="font-serif text-xl font-semibold tracking-tight text-ink">
              oldmonk<span class="text-accent-warm">.</span>
            </span>
          </a>
          <p class="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Useful tools, instantly. Everything runs in your browser, and nothing you
            paste is uploaded.
          </p>
        </div>

        <nav aria-label="Categories">
          <h2 class="font-serif text-base font-semibold text-ink">Categories</h2>
          <ul class="mt-3 flex flex-col gap-2 text-sm">
            <For each={categories}>
              {(category) => (
                <li style={`--cat-color:${categoryColor(category.slug)};--cat-ink:${categoryInk(category.slug)}`}>
                  <a
                    href={category.path}
                    class={`${focusRing} rounded-control text-muted underline-offset-4 hover:text-[var(--cat-ink)] hover:underline`}
                  >
                    {category.name}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </nav>

        <nav aria-label="Site">
          <h2 class="font-serif text-base font-semibold text-ink">Site</h2>
          <ul class="mt-3 flex flex-col gap-2 text-sm">
            <For each={siteLinks}>
              {(link) => (
                <li>
                  <a
                    href={link.href}
                    class={`${focusRing} rounded-control text-muted underline-offset-4 hover:text-ink hover:underline`}
                  >
                    {link.label}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </Container>

      <Container class="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Tools run locally. Input is never uploaded.</p>
        <p>
          © 2026 {site.name}. <a href="/privacy" class="underline-offset-4 hover:text-ink hover:underline">Privacy</a>
        </p>
      </Container>
    </footer>
  );
}
