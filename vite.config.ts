import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [solid({ start: true, ssr: true }), tailwindcss()],
  optimizeDeps: {
    exclude: ["@ui-sdk/core"],
  },
  build: {
    target: "esnext",
    assetsInlineLimit: 0,
  },
});
