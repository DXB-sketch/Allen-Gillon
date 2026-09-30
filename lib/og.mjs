// Open Graph image lookup for page metadata.
//
// content/og-images.json is written by scripts/build-og.mjs and imported
// statically, because the Workers runtime cannot read the filesystem.
// URLs are returned absolute: the other-site home clears metadataBase, and
// absolute URLs are correct everywhere else too.
//
//   import { ogImages } from "../../lib/og.mjs";
//   export const metadata = {
//     openGraph: { images: ogImages("other", "/books") },
//     twitter: { card: "summary_large_image", images: ogImages("other", "/books") },
//   };

import manifest from "../content/og-images.json" with { type: "json" };
import { SITES } from "./sites.mjs";

export { manifest as ogManifest };

/** The manifest entry for a route, or the host's home image when the route has none. */
export function ogEntry(site, route) {
  const key = site === "other" ? "other" : "main";
  const table = manifest[key] || {};
  return table[route] || table["/"] || null;
}

/** Next.js `openGraph.images` / `twitter.images` value: one absolute 1200x630 JPEG. */
export function ogImages(site, route) {
  const entry = ogEntry(site, route);
  if (!entry) return [];
  const origin = (SITES[site] || SITES.main).origin;
  return [{ url: `${origin}${entry.url}`, width: entry.width, height: entry.height, alt: entry.alt, type: "image/jpeg" }];
}
