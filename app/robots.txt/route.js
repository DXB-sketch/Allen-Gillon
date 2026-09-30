import { siteForHost } from "../../lib/sites.mjs";
import { robotsTxt, TEXT_ROUTE_HEADERS } from "../../lib/seo.mjs";

// Host-aware robots.txt: each host points at its own sitemap.
// Dynamic on purpose: a build-time copy would be the same for both hosts.
export const dynamic = "force-dynamic";

export function GET(request) {
  const site = siteForHost(request.headers.get("host") || new URL(request.url).host);
  return new Response(robotsTxt(site), { headers: { ...TEXT_ROUTE_HEADERS.robots, vary: "host" } });
}
