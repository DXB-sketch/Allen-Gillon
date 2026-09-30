import SiteChrome from "../../components/SiteChrome";
import { jsonLdProps, siteGraph } from "../../lib/schema.mjs";
import { hostMetadata, hostViewport } from "../../lib/seo.mjs";

// Site-wide metadata for other.allengillon.com ("More on Allen"):
// metadataBase, title template, the blue-led icon set and manifest, Open
// Graph defaults and the twitter card. Each page adds its own title,
// description and canonical with pageMetadata("other", route) from
// lib/seo.mjs (docs/SEO-WIRING.md).
export const metadata = hostMetadata("other");
export const viewport = hostViewport("other");

export default function OtherLayout({ children }) {
  return (
    <>
      <script {...jsonLdProps(siteGraph("other"))} />
      <SiteChrome site="other">{children}</SiteChrome>
    </>
  );
}
