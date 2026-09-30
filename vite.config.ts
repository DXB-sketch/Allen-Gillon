import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";

export default defineConfig(({ command }) => ({
  server: {
    // Both hosts work locally: localhost (main) and other.localhost (other).
    // The production host names are allowed so Host-header checks reach proxy.ts.
    allowedHosts: [".localhost", "allengillon.com", ".allengillon.com"],
  },
  plugins: [
    vinext({
      cache: { cdn: cdnAdapter() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
      // In dev the asset worker would otherwise serve the legacy root *.html
      // files (index.html, books.html, hire.html...) in place of the app routes,
      // before proxy.ts runs. Production assets come from dist/client, which has
      // no such files, so the deployed config is left unchanged.
      config: command === "serve" ? { assets: { html_handling: "none" } } : undefined,
    }),
  ],
}));
