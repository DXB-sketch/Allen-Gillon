import Link from "next/link";
import CrossSiteLink from "./CrossSiteLink";
import legal from "../content/legal.config.json";
import {
  FACEBOOK_URL,
  LOCALITY,
  SMS_DISPLAY,
  SMS_NUMBER,
  SUPPORT_EMAIL,
  copyrightLine,
  legalLinks,
} from "../lib/legal.mjs";
import { CROSS_LINK, NAV, SITES } from "../lib/sites.mjs";

// Links to pages on the other host, rendered as absolute <a> elements.
const AWAY_LINKS = {
  main: [
    { site: "other", path: "/books", label: "Stories" },
    { site: "other", path: "/biography", label: "Timeless Duo" },
    { site: "other", path: "/anns-art", label: "Ann's Art Room" },
  ],
  other: [
    { site: "main", path: "/music", label: "Albums" },
    { site: "main", path: "/hire", label: "Bookings" },
  ],
};

// The same footer on both hosts (W7): a contact block, the site links, the
// legal links (hidden while content/legal.config.json is unpublished;
// absolute links to the main host on other) and the copyright line.
// Human TODO: add a tel: link beside the text link if Allen accepts calls.
export default function SiteFooter({ site = "main" }) {
  const key = site === "other" ? "other" : "main";
  // Main links to the other site only from the bottom of its home page.
  const cross = key === "other" ? CROSS_LINK.other : null;
  const legalNav = legalLinks(key, legal);
  return (
    <footer data-site={key}>
      <div className="footer-inner">
        <div className="footer-contact">
          <p className="fscript">{SITES[key].name}</p>
          <address>
            <p>{LOCALITY}</p>
            <p>
              <a href={`sms:${SMS_NUMBER}`}>Text Allen on {SMS_DISPLAY}</a>
            </p>
            <p>
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
            <p>
              <a className="fb" href={FACEBOOK_URL} target="_blank" rel="noopener">
                Allen on Facebook<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </p>
          </address>
          {cross ? (
            <p>
              <CrossSiteLink site={cross.site} path={cross.path}>
                {cross.label}
              </CrossSiteLink>
            </p>
          ) : null}
        </div>
        <div className="footer-links">
          <nav aria-label="Footer">
            {NAV[key].map((l) => (
              <Link prefetch={false} key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
            {AWAY_LINKS[key].map((l) => (
              <CrossSiteLink key={l.path} site={l.site} path={l.path}>
                {l.label}
              </CrossSiteLink>
            ))}
          </nav>
          {legalNav.length ? (
            <nav aria-label="Legal">
              {legalNav.map((l) =>
                l.crossSite ? (
                  <CrossSiteLink key={l.path} site={l.site} path={l.path}>
                    {l.label}
                  </CrossSiteLink>
                ) : (
                  <Link prefetch={false} key={l.path} href={l.path}>
                    {l.label}
                  </Link>
                ),
              )}
            </nav>
          ) : null}
        </div>
        <p className="footer-copy">{copyrightLine()}</p>
      </div>
    </footer>
  );
}
