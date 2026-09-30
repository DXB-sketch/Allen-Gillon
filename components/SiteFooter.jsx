import Link from "next/link";
import CrossSiteLink from "./CrossSiteLink";
import legal from "../content/legal.config.json";
import { CROSS_LINK, LEGAL_PATHS, NAV, SITES } from "../lib/sites.mjs";

const LEGAL_LABELS = { "/privacy": "Privacy", "/terms": "Terms", "/accessibility": "Accessibility" };

// Links to pages on the other host, rendered as absolute <a> elements.
const AWAY_LINKS = {
  main: [
    { site: "other", path: "/biography", label: "Timeless" },
    { site: "other", path: "/books", label: "Stories" },
    { site: "other", path: "/anns-art", label: "Ann Gillon" },
  ],
  other: [
    { site: "main", path: "/music", label: "Albums" },
    { site: "main", path: "/hire", label: "Bookings" },
  ],
};

export default function SiteFooter({ site = "main" }) {
  const key = site === "other" ? "other" : "main";
  const cross = CROSS_LINK[key];
  return (
    <footer data-site={key}>
      <div className="wrap">
        <div>
          <div className="fscript">{SITES[key].name}</div>
          <p>Bribie Island, Queensland</p>
          <p>
            <a href="sms:+61438747882">Text 0438 747 882</a>
          </p>
          <p>
            <CrossSiteLink site={cross.site} path={cross.path}>
              {cross.label}
            </CrossSiteLink>
          </p>
        </div>
        <nav aria-label="Footer">
          {NAV[key].map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          {AWAY_LINKS[key].map((l) => (
            <CrossSiteLink key={l.path} site={l.site} path={l.path}>
              {l.label}
            </CrossSiteLink>
          ))}
          {legal.published
            ? LEGAL_PATHS.map((path) =>
                key === "main" ? (
                  <Link key={path} href={path}>
                    {LEGAL_LABELS[path]}
                  </Link>
                ) : (
                  <CrossSiteLink key={path} site="main" path={path}>
                    {LEGAL_LABELS[path]}
                  </CrossSiteLink>
                ),
              )
            : null}
          <a
            className="fb"
            href="https://www.facebook.com/people/Allen-Gillon/100011388424486/"
            target="_blank"
            rel="noopener"
          >
            Facebook
          </a>
        </nav>
        <p>&copy; {new Date().getFullYear()} Allen Gillon</p>
      </div>
    </footer>
  );
}
