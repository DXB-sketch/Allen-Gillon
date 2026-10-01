"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CrossSiteLink from "./CrossSiteLink";
import { CROSS_LINK, NAV, SITES, isCurrentNav } from "../lib/sites.mjs";

// Shared masthead. `site` picks the link set; the nav wraps on small screens.
// On other, "/" is served by the /other-home rewrite, so Home is current on both.
export default function SiteMast({ site = "main" }) {
  const pathname = usePathname();
  const links = NAV[site] || NAV.main;
  const home = links[0];
  // Main links to the other site only from the bottom of its home page.
  const cross = site === "other" ? CROSS_LINK.other : null;
  const isHome = isCurrentNav(home, pathname);
  return (
    <header className={`mast${isHome ? " home-mast" : ""}`} data-site={site}>
      <Link prefetch={false} className="logo" href="/">
        {SITES[site]?.name || SITES.main.name}
      </Link>
      <nav className="mnav" aria-label="Site">
        {links.map((l) => (
          <Link
            key={l.href}
            prefetch={false}
            className={l.className}
            href={l.href}
            aria-current={isCurrentNav(l, pathname) ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
        {cross ? (
          <CrossSiteLink className="nav-cross" site={cross.site} path={cross.path}>
            {cross.label}
          </CrossSiteLink>
        ) : null}
      </nav>
    </header>
  );
}
