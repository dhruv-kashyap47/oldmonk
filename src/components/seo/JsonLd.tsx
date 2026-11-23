import { serializeJsonLd } from "../../seo/schema";

/**
 * Structured data is generated from our own registry and content, never from
 * user input. `serializeJsonLd` escapes `<` so the payload cannot close the
 * script element.
 */
export function JsonLd(props: { data: unknown }) {
  return <script type="application/ld+json" innerHTML={serializeJsonLd(props.data)} />;
}
