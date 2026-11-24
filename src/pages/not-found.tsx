import { For } from "solid-js";
import { httpStatus } from "@solidjs/web";
import { categories } from "../content/categories";
import { categoryColor } from "../lib/category-style";
import { CategoryMarker } from "../components/catalog/CategoryMarker";
import { MetaTags } from "../components/seo/MetaTags";
import { Container } from "../components/layout/Container";
import { focusRing } from "../components/ui/styles";

export default function NotFoundPage() {
  httpStatus(404);

  return (
    <>
      <MetaTags
        title="Page not found"
        description="This address does not match a page on oldmonk. Browse the tool catalog or pick a category."
        path="/404"
        robots="noindex,follow"
      />
      <main id="main" class="pb-16">
        <Container width="tool" class="pt-16">
          <p class="font-mono text-xs tracking-[0.03em] text-muted">Error 404</p>
          <div class="hero-rule mt-4 h-[3px] w-14 bg-accent-warm" aria-hidden="true" />
          <h1 class="mt-4 font-serif text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02] font-semibold tracking-tight text-ink">
            This page does not exist.
          </h1>
          <p class="mt-4 max-w-[52ch] text-lg leading-relaxed text-muted">
            Check the address, or start from the catalog. Every shipped tool is listed on
            the home page.
          </p>
          <a
            href="/"
            class={`${focusRing} mt-8 inline-flex min-h-11 items-center rounded-control bg-accent px-4 text-sm font-medium text-paper hover:bg-accent-hover`}
          >
            Back to the catalog
          </a>

          <section aria-labelledby="not-found-categories" class="mt-14">
            <h2 id="not-found-categories" class="font-serif text-2xl font-semibold text-ink">
              Categories
            </h2>
            <ul class="mt-4">
              <For each={categories}>
                {(category) => (
                  <li
                    class="border-t border-line"
                    style={`--cat-color:${categoryColor(category.slug)}`}
                  >
                    <a
                      href={category.path}
                      class={`${focusRing} catalog-row group -mx-3 flex min-h-11 items-center justify-between gap-3 rounded-control px-3 py-3 text-sm text-ink`}
                    >
                      {category.name}
                      <CategoryMarker category={category.slug} />
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </section>
        </Container>
      </main>
    </>
  );
}
