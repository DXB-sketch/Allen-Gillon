import "./site.css";
import { headers } from "next/headers";
import SiteChrome from "../components/SiteChrome";
import NotFoundContent from "../components/NotFoundContent";
import { SITES, siteForHost } from "../lib/sites.mjs";

// Unmatched URLs on either host. vinext would otherwise wrap route misses in
// the (main) layout, because (main) owns "/"; this page reads the Host header
// so a miss on other.allengillon.com gets the other-site mast and footer.
// No robots entry: vinext already adds <meta name="robots" content="noindex"> to 404s.
export async function generateMetadata() {
  const site = siteForHost((await headers()).get("host"));
  return {
    title: `Page not found · ${SITES[site].name}`,
  };
}

export default async function GlobalNotFound() {
  const site = siteForHost((await headers()).get("host"));
  return (
    <html lang="en-AU" data-site={site}>
      <head>
        <link rel="preload" href="/fonts/dynalight-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteChrome site={site}>
          <NotFoundContent />
        </SiteChrome>
      </body>
    </html>
  );
}
