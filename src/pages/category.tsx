import { For, Show } from "solid-js";
import { useLocation } from "@solidjs/router";
import { categories } from "../content/categories";
import { topics } from "../content/topics";
import { getToolsByCategory } from "../tools/registry";
import { breadcrumbSchema } from "../seo/schema";
import { MetaTags } from "../components/seo/MetaTags";
import { JsonLd } from "../components/seo/JsonLd";
import { Breadcrumbs } from "../components/seo/Breadcrumbs";
import { Container } from "../components/layout/Container";
import { CatalogRow } from "../components/catalog/CatalogRow";
import { EmptyState } from "../components/tool/states";
import { AdSlot } from "../components/ads/AdSlot";
import { focusRing, monoMeta } from "../components/ui/styles";
import NotFoundPage from "./not-found";

export default function CategoryPage() {
  const location = useLocation();
  const category = () =>
    categories.find((entry) => entry.path === location.pathname) ?? null;

  return (
    <Show when={category()} fallback={<NotFoundPage />} keyed>
      {(current) => {
        const rows = () => getToolsByCategory(current.slug);
        const siblings = () => categories.filter((entry) => entry.slug !== current.slug);
        const crumbs = () => [
          { name: "Home", path: "/" },
          { name: current.name, path: current.path },
        ];

        return (
          <>
            <MetaTags title={current.title} description={current.description} path={current.path} />
            <JsonLd data={breadcrumbSchema(crumbs())} />

            <main id="main" class="pb-16">
              <Container class="pt-8">
                <Breadcrumbs items={crumbs()} />
                <h1 class="mt-6 max-w-[18ch] font-serif text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.02] font-semibold tracking-tight text-ink">
                  {current.name}
                </h1>
                <p class="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted">
                  {current.intro}
                </p>
                <p class={`${monoMeta} mt-3`}>
                  {rows().length} {rows().length === 1 ? "tool" : "tools"} in this category
                </p>
              </Container>

              <Container class="mt-12">
                <Show
                  when={rows().length > 0}
                  fallback={
                    <EmptyState title="Nothing here yet">
                      This category is still being built. The home page lists every tool
                      that has shipped.
                    </EmptyState>
                  }
                >
                  <ul>
                    <For each={rows()}>{(tool) => <CatalogRow tool={tool} />}</For>
                  </ul>
                </Show>
              </Container>

              <AdSlot placement="category-below" class="mt-12" />

              <Show when={topics.filter((topic) => topic.category === current.slug).length > 0}>
                <Container class="mt-16">
                  <h2 class="font-serif text-2xl font-semibold text-ink">Topic guides</h2>
                  <ul class="mt-5 grid gap-3 sm:grid-cols-2">
                    <For each={topics.filter((topic) => topic.category === current.slug)}>
                      {(topic) => (
                        <li>
                          <a
                            href={topic.path}
                            class={`${focusRing} flex min-h-11 items-center rounded-control border border-line px-3 text-sm text-ink hover:border-accent`}
                          >
                            {topic.name}
                          </a>
                        </li>
                      )}
                    </For>
                  </ul>
                </Container>
              </Show>

              <Container class="mt-16">
                <h2 class="font-serif text-2xl font-semibold text-ink">Other categories</h2>
                <ul class="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                  <For each={siblings()}>
                    {(sibling) => (
                      <li>
                        <a
                          href={sibling.path}
                          class={`${focusRing} rounded-control text-sm text-accent underline-offset-4 hover:underline`}
                        >
                          {sibling.name}
                        </a>
                      </li>
                    )}
                  </For>
                </ul>
              </Container>
            </main>
          </>
        );
      }}
    </Show>
  );
}
