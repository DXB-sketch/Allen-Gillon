import "./site.css";
import { headers } from "next/headers";
import SiteChrome from "../components/SiteChrome";
import NotFoundContent from "../components/NotFoundContent";
import { SITES, siteForHost } from "../lib/sites.mjs";

// Unmatched URLs on either host. vinext would otherwise wrap route misses in
// the (main) layout, because (main) owns "/"; this page reads the Host header
// so a miss on other.allengillon.com gets the More on Allen mast and footer.
export async function generateMetadata() {
  const site = siteForHost((await headers()).get("host"));
  return {
    title: `Page not found · ${SITES[site].name}`,
    robots: { index: false },
  };
}

export default async function GlobalNotFound() {
  const site = siteForHost((await headers()).get("host"));
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dynalight&family=Lora:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
