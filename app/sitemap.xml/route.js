import { siteForHost } from "../../lib/sites.mjs";
import { sitemapXml, TEXT_ROUTE_HEADERS } from "../../lib/seo.mjs";

// Host-aware sitemap.xml: each host lists only the pages it owns.
// Dynamic on purpose: a build-time copy would be the same for both hosts.
export const dynamic = "force-dynamic";

export function GET(request) {
  const site = siteForHost(request.headers.get("host") || new URL(request.url).host);
  return new Response(sitemapXml(site), { headers: { ...TEXT_ROUTE_HEADERS.sitemap, vary: "host" } });
}
