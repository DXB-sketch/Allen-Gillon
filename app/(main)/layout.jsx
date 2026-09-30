import SiteChrome from "../../components/SiteChrome";
import { jsonLdProps, siteGraph } from "../../lib/schema.mjs";
import { hostMetadata, hostViewport } from "../../lib/seo.mjs";

// Site-wide metadata for allengillon.com: metadataBase, title template, the
// red-led icon set and manifest, Open Graph defaults and the twitter card.
// Each page adds its own title, description and canonical with
// pageMetadata("main", route) from lib/seo.mjs (docs/SEO-WIRING.md).
export const metadata = hostMetadata("main");
export const viewport = hostViewport("main");

export default function MainLayout({ children }) {
  return (
    <>
      <script {...jsonLdProps(siteGraph("main"))} />
      <SiteChrome site="main">{children}</SiteChrome>
    </>
  );
}
