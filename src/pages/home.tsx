import { For, Show, createSignal } from "solid-js";
import { categories } from "../content/categories";
import { searchTools } from "../lib/search";
import { getToolsByCategory, tools } from "../tools/registry";
import { formatCount } from "../lib/format";
import { categoryColor, categoryInk } from "../lib/category-style";
import { site } from "../seo/site";
import { organizationSchema, websiteSchema } from "../seo/schema";
import { MetaTags } from "../components/seo/MetaTags";
import { JsonLd } from "../components/seo/JsonLd";
import { Container } from "../components/layout/Container";
import { CatalogRow } from "../components/catalog/CatalogRow";
import { EmptyState } from "../components/tool/states";
import { AdSlot } from "../components/ads/AdSlot";
import { focusRing, inputBase, monoMeta } from "../components/ui/styles";

export default function HomePage() {
  const [query, setQuery] = createSignal("");

  const matches = () => searchTools(tools, query());
  const grouped = () =>
    categories
      .map((category) => ({
        category,
        rows: searchTools(getToolsByCategory(category.slug), query()),
      }))
      .filter((group) => group.rows.length > 0);
  const quickTools = () => tools.slice(0, 3);

  return (
    <>
      <MetaTags title={site.defaultTitle} description={site.description} path="/" />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={organizationSchema()} />

      <main id="main" class="pb-16">
        <Container class="pt-14 sm:pt-20">
          <div class="hero-rule h-[3px] w-14 bg-accent-warm" aria-hidden="true" />
          <h1 class="mt-6 max-w-[20ch] font-serif text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.98] font-semibold tracking-tight text-ink">
            Useful tools, instantly.
          </h1>
          <p class="mt-5 max-w-[54ch] text-lg leading-relaxed text-muted">
            A small catalog for code, text, random picks, timers, and quick tests. Every
            tool runs in this tab, and nothing you paste is uploaded.
          </p>
          <p class={`${monoMeta} mt-4`}>
            {formatCount(tools.length, "tool")} in{" "}
            {formatCount(categories.length, "category", "categories")}
          </p>

          <div class="mt-8 max-w-2xl">
            <label for="catalog-search" class="sr-only">
              Search tools
            </label>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div class="relative sm:flex-1">
                <svg
                  viewBox="0 0 24 24"
                  class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  id="catalog-search"
                  type="search"
                  value={query()}
                  onInput={(event) => setQuery(event.currentTarget.value)}
                  placeholder="Search tools, like JSON or timer"
                  autocomplete="off"
                  class={`${inputBase} ${focusRing} h-12 rounded-panel pl-10`}
                />
              </div>
              <p role="status" aria-live="polite" class={`${monoMeta} sm:w-32 sm:text-right`}>
                <Show when={query().trim().length > 0} fallback={`${formatCount(tools.length, "tool")}`}>
                  {formatCount(matches().length, "match", "matches")}
                </Show>
              </p>
            </div>

            <Show when={quickTools().length > 0}>
              <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span class="text-muted">Start here</span>
                <For each={quickTools()}>
                  {(tool) => (
                    <a
                      href={`/${tool.slug}`}
                      class={`${focusRing} rounded-control text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent`}
                    >
                      {tool.name}
                    </a>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Container>

        <Container class="mt-20">
          <Show
            when={grouped().length > 0}
            fallback={
              <EmptyState title="No tools match that filter">
                Try a shorter word, a category name, or clear the field to see the full
                catalog.
              </EmptyState>
            }
          >
            <div class="flex flex-col gap-24">
              <For each={grouped()}>
                {(group) => (
                  <section aria-labelledby={`category-${group.category.slug}`}>
                    <div class="grid gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-16">
                      <div>
                        <h2
                          id={`category-${group.category.slug}`}
                          class="font-serif text-[clamp(1.6rem,2.5vw,2.25rem)] leading-tight font-semibold text-ink"
                        >
                          <a
                            href={group.category.path}
                            class={`${focusRing} rounded-control underline-offset-4 hover:underline`}
                          >
                            {group.category.name}
                          </a>
                        </h2>
                        <div
                          class="category-rule mt-3 h-0.5 w-9"
                          style={`background-color:${categoryColor(group.category.slug)}`}
                          aria-hidden="true"
                        />
                        <p class="mt-3 text-sm leading-relaxed text-muted">
                          {group.category.intro}
                        </p>
                        <p
                          class={`${monoMeta} mt-2`}
                          style={`color:${categoryInk(group.category.slug)}`}
                        >
                          {formatCount(group.rows.length, "tool")}
                        </p>
                      </div>
                      <ul>
                        <For each={group.rows}>
                          {(tool, index) => <CatalogRow tool={tool} index={index()} />}
                        </For>
                      </ul>
                    </div>
                  </section>
                )}
              </For>
            </div>
          </Show>
        </Container>

        <AdSlot placement="home-below" class="mt-20" />
      </main>
    </>
  );
}
