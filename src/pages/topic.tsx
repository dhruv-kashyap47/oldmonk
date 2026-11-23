import { For, Show } from "solid-js";
import { useLocation } from "@solidjs/router";
import { getTopic } from "../content/topics";
import { getCategory } from "../content/categories";
import { getToolsByTopic } from "../tools/registry";
import { breadcrumbSchema } from "../seo/schema";
import { MetaTags } from "../components/seo/MetaTags";
import { JsonLd } from "../components/seo/JsonLd";
import { Breadcrumbs } from "../components/seo/Breadcrumbs";
import { Container } from "../components/layout/Container";
import { CatalogRow } from "../components/catalog/CatalogRow";
import { EmptyState } from "../components/tool/states";
import { focusRing, monoMeta } from "../components/ui/styles";
import NotFoundPage from "./not-found";

export default function TopicPage() {
  const location = useLocation();
  const topic = () => getTopic(location.pathname) ?? null;

  return (
    <Show when={topic()} fallback={<NotFoundPage />} keyed>
      {(current) => {
        const rows = () => getToolsByTopic(current.slug);
        const category = () => getCategory("developer");
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
                <p class="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted">{current.intro}</p>
                <p class={`${monoMeta} mt-3`}>
                  {rows().length} {rows().length === 1 ? "tool" : "tools"} in this cluster
                </p>
              </Container>

              <Container class="mt-12">
                <Show
                  when={rows().length > 0}
                  fallback={
                    <EmptyState title="This cluster is still being built">
                      The tools in this group ship one at a time. The home page lists every
                      tool that is ready.
                    </EmptyState>
                  }
                >
                  <ul>
                    <For each={rows()}>{(tool) => <CatalogRow tool={tool} />}</For>
                  </ul>
                </Show>
              </Container>

              <Container width="tool" class="mt-16">
                <h2 class="font-serif text-2xl font-semibold text-ink">Which one do I need?</h2>
                <div class="prose-catalog mt-4 max-w-[68ch]">
                  <p>
                    Use the formatter when the document is valid and you need to read it.
                    It indents objects and arrays, can sort keys for a clean diff, and keeps
                    the output ready to paste.
                  </p>
                  <p>
                    Use the validator when you suspect a syntax problem. It stops at the first
                    error, reports the line and column, and shows the surrounding text so the
                    fix is obvious.
                  </p>
                  <p>
                    Use the minifier when the document is already correct and you need the
                    smallest text for a request body, an environment variable, or a fixture.
                    It reports the bytes saved and never changes the data.
                  </p>
                </div>
                <div class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <Show when={category()}>
                    {(info) => (
                      <a
                        href={info().path}
                        class={`${focusRing} rounded-control text-accent underline-offset-4 hover:underline`}
                      >
                        All developer tools
                      </a>
                    )}
                  </Show>
                  <a
                    href="/"
                    class={`${focusRing} rounded-control text-muted underline-offset-4 hover:text-ink hover:underline`}
                  >
                    Full catalog
                  </a>
                </div>
              </Container>
            </main>
          </>
        );
      }}
    </Show>
  );
}
