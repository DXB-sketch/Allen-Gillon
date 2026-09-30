import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";

export default defineConfig(({ command }) => ({
  // In dev, hand SITE_DEV_PORT (set by scripts/dev-local.mjs, default 3001) to
  // the app so server-rendered cross-site links use the local port. The build
  // leaves it alone; the local Worker gets it from wrangler vars instead.
  define:
    command === "serve"
      ? { "process.env.SITE_DEV_PORT": JSON.stringify(String(Number(process.env.SITE_DEV_PORT) || 3001)) }
      : {},
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
