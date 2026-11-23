import type { FAQItem, ToolMeta } from "../tools/types";
import { absoluteUrl, site } from "./site";

export interface BreadcrumbItemSchema {
  readonly name: string;
  readonly path: string;
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: site.locale,
  };
}

export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    email: site.contactEmail,
  };
}

export function webApplicationSchema(tool: ToolMeta): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: absoluteUrl(`/${tool.slug}`),
    description: tool.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Runs in the browser.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function breadcrumbSchema(items: readonly BreadcrumbItemSchema[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(items: readonly FAQItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * JSON.stringify output for a script tag. `<` is escaped so a value can never
 * close the script element.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
