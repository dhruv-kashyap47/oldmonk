import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { formatIsoDate } from "../../lib/format";
import { findPageRoute } from "../../seo/routes";
import { MetaTags } from "../seo/MetaTags";
import { JsonLd } from "../seo/JsonLd";
import { Container } from "./Container";
import { Breadcrumbs } from "../seo/Breadcrumbs";
import { breadcrumbSchema, type BreadcrumbItemSchema } from "../../seo/schema";

export function ProsePage(props: {
  title: string;
  summary: string;
  path: string;
  updated?: string;
  breadcrumbs?: readonly BreadcrumbItemSchema[];
  children: JSX.Element;
}) {
  const crumbs = () => props.breadcrumbs ?? [{ name: "Home", path: "/" }, { name: props.title, path: props.path }];
  const description = () => findPageRoute(props.path)?.description ?? props.summary;

  return (
    <>
      <MetaTags title={props.title} description={description()} path={props.path} />
      <JsonLd data={breadcrumbSchema(crumbs())} />
      <main id="main" class="pb-16">
        <Container width="tool" class="pt-8">
          <Breadcrumbs items={crumbs()} />
          <div class="hero-rule mt-6 h-[3px] w-14 bg-accent-warm" aria-hidden="true" />
          <h1 class="mt-5 font-serif text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.05] font-semibold tracking-tight text-ink">
            {props.title}
          </h1>
          <p class="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{props.summary}</p>
          <Show when={props.updated}>
            {(updated) => (
              <p class="mt-3 font-mono text-xs tracking-[0.03em] text-muted">
                Updated {formatIsoDate(updated())}
              </p>
            )}
          </Show>
          <div class="prose-catalog mt-10 max-w-[68ch]">{props.children}</div>
        </Container>
      </main>
    </>
  );
}
