import type { JSX } from "@solidjs/web";
import { Show, onSettled } from "solid-js";
import { track } from "../../analytics";
import { getCategory } from "../../content/categories";
import { breadcrumbSchema, webApplicationSchema } from "../../seo/schema";
import type { ToolMeta } from "../../tools/types";
import { JsonLd } from "../seo/JsonLd";
import { MetaTags } from "../seo/MetaTags";
import { Breadcrumbs } from "../seo/Breadcrumbs";
import { AdSlot } from "../ads/AdSlot";
import { Container } from "../layout/Container";
import { RelatedTools } from "./RelatedTools";
import { SpecGrid } from "./SpecGrid";
import { ToolHeader } from "./ToolHeader";

export function ToolShell(props: {
  tool: ToolMeta;
  children: JSX.Element;
  content: JSX.Element;
}) {
  const category = () => getCategory(props.tool.category);
  const crumbs = () => [
    { name: "Home", path: "/" },
    ...(category() ? [{ name: category()!.name, path: category()!.path }] : []),
    { name: props.tool.name, path: `/${props.tool.slug}` },
  ];
  const width = () => (props.tool.layout === "wide" ? "wide" : "tool");

  onSettled(() => {
    track("tool_view", { slug: props.tool.slug, category: props.tool.category });
  });

  return (
    <>
      <MetaTags
        title={props.tool.title}
        description={props.tool.description}
        path={`/${props.tool.slug}`}
      />
      <JsonLd data={webApplicationSchema(props.tool)} />
      <JsonLd data={breadcrumbSchema(crumbs())} />

      <main id="main" class="pb-20">
        <Container width={width()} class="pt-8">
          <Breadcrumbs items={crumbs()} />
          <ToolHeader tool={props.tool} />

          <div class="mt-8">{props.children}</div>

          <Show when={props.tool.specs && props.tool.specs.length > 0}>
            <section aria-labelledby="tool-facts" class="mt-12">
              <h2 id="tool-facts" class="sr-only">
                Tool facts
              </h2>
              <SpecGrid items={props.tool.specs ?? []} />
            </section>
          </Show>

          <AdSlot placement="tool-below" class="mt-12" />

          <section class="mt-14 max-w-[68ch]">{props.content}</section>

          <AdSlot placement="tool-content" class="mt-12" />

          <RelatedTools tool={props.tool} />
        </Container>
      </main>
    </>
  );
}
