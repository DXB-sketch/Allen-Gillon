import { headers } from "next/headers";
import SiteChrome from "../components/SiteChrome";
import NotFoundContent from "../components/NotFoundContent";
import { SITES, siteForHost } from "../lib/sites.mjs";

// notFound() thrown inside a (main) or (other) page (the gated legal routes,
// a bad /anns-art/[id]) renders here. Under vinext this renders inside the
// root layout only, not the group layout, so it adds the host's SiteChrome
// itself: the mast <header>/<nav>, the one <main id="main"> the skip link
// targets, and the footer. Unmatched URLs render app/global-not-found.jsx,
// which does the same.
// No robots entry: vinext already adds <meta name="robots" content="noindex"> to 404s.
export async function generateMetadata() {
  const site = siteForHost((await headers()).get("host"));
  return {
    title: `Page not found · ${SITES[site].name}`,
  };
}

export default async function NotFound() {
  const site = siteForHost((await headers()).get("host"));
  return (
    <SiteChrome site={site}>
      <NotFoundContent />
    </SiteChrome>
  );
}
