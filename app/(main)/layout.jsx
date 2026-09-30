import SiteChrome from "../../components/SiteChrome";
import { jsonLdProps, siteGraph } from "../../lib/schema.mjs";
import { hostMetadata, hostViewport } from "../../lib/seo.mjs";

// Site-wide metadata for allengillon.com: metadataBase, title template, the
// red-led icon set and manifest, Open Graph defaults and the twitter card.
// Each page adds its own title, description and canonical with
// pageMetadata("main", route) from lib/seo.mjs (docs/SEO-WIRING.md).
export const metadata = hostMetadata("main");
export const viewport = hostViewport("main");

// Every page in this group is static HTML (the spec keeps only /comments and
// /api dynamic). Without this vinext sends "no-store"; revalidate = false
// gives "s-maxage=31536000, stale-while-revalidate" so the edge can cache it.
// A render that still reads the request (the host-aware not-found) stays
// no-store. The edge cache key includes the host, and each host's pages have
// their own paths (other "/" is rewritten to /other-home), so no collision.
export const revalidate = false;

export default function MainLayout({ children }) {
  return (
    <>
      <script {...jsonLdProps(siteGraph("main"))} />
      <SiteChrome site="main">{children}</SiteChrome>
    </>
  );
}
