import type { ParentProps } from "solid-js";
import { Show } from "solid-js";
import { HydrationScript } from "@solidjs/web";
import { themeInitScript } from "./lib/theme";

export default function Document(props: ParentProps) {
  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN ?? "";
  const verification = import.meta.env.VITE_GSC_VERIFICATION ?? "";

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3f0e6" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#141512" />
        <Show when={verification}>
          <meta name="google-site-verification" content={verification} />
        </Show>
        <link rel="icon" href="/brand/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/brand/favicon-64.png" sizes="64x64" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link
          rel="preload"
          href="/fonts/bitter-latin-var.woff2"
          as="font"
          type="font/woff2"
          crossorigin="anonymous"
        />
        <script innerHTML={themeInitScript} />
        <Show when={plausibleDomain}>
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        </Show>
        <HydrationScript />
      </head>
      <body>{props.children}</body>
    </html>
  );
}
