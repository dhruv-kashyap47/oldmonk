import { Link, Meta, Title } from "@solidjs/meta";
import { absoluteUrl, site, titleWithSuffix } from "../../seo/site";

export function MetaTags(props: {
  title: string;
  description: string;
  path: string;
  robots?: string;
  type?: "website" | "article";
}) {
  const canonical = () => absoluteUrl(props.path);
  const fullTitle = () => titleWithSuffix(props.title);

  return (
    <>
      <Title>{fullTitle()}</Title>
      <Meta name="description" content={props.description} />
      <Meta name="robots" content={props.robots ?? "index,follow"} />
      <Link rel="canonical" href={canonical()} />
      <Meta property="og:type" content={props.type ?? "website"} />
      <Meta property="og:site_name" content={site.name} />
      <Meta property="og:title" content={fullTitle()} />
      <Meta property="og:description" content={props.description} />
      <Meta property="og:url" content={canonical()} />
      <Meta property="og:locale" content={site.locale} />
      <Meta property="og:image" content={absoluteUrl("/brand/og-default.png")} />
      <Meta property="og:image:width" content="1200" />
      <Meta property="og:image:height" content="630" />
      <Meta property="og:image:alt" content="oldmonk logo" />
      <Meta name="twitter:card" content={site.twitterCard} />
      <Meta name="twitter:title" content={fullTitle()} />
      <Meta name="twitter:description" content={props.description} />
      <Meta name="twitter:image" content={absoluteUrl("/brand/og-default.png")} />
      <Meta name="twitter:image:alt" content="oldmonk logo" />
    </>
  );
}
