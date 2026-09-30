// Publishing gate and shared facts for the legal pages (redesign plan W7).
//
// content/legal.config.json {"published": false} keeps /privacy, /terms and
// /accessibility unpublished: the routes 404 on both hosts (lib/sites.mjs
// treats them as unowned, and each page calls notFound()), the footer legal
// links are hidden and the sitemap leaves them out. Flip it to true only
// after the human signs off the wording (see LEGAL-TODO.md).
//
// Everything here is a pure function of the config, so tests/legal.test.mjs
// can flip the flag without touching the file.

import { LEGAL_PATHS } from "./sites.mjs";

export const SUPPORT_EMAIL = "support@allengillon.com";
export const SMS_NUMBER = "+61438747882";
export const SMS_DISPLAY = "0438 747 882";
export const FACEBOOK_URL = "https://www.facebook.com/people/Allen-Gillon/100011388424486/";
export const LOCALITY = "Bribie Island QLD";

/** Shown at the foot of each legal page. Change it whenever the wording changes. */
export const LEGAL_UPDATED = "1 October 2026";

export const LEGAL_LABELS = {
  "/privacy": "Privacy",
  "/terms": "Terms of sale",
  "/accessibility": "Accessibility",
};

/** True only when the config explicitly says the legal pages are published. */
export function isLegalPublished(config) {
  return config?.published === true;
}

/**
 * The footer legal links for a site. Empty while unpublished. On main they
 * are local links; on other they are absolute links to the main host,
 * because the legal pages are served on main only.
 */
export function legalLinks(site, config) {
  if (!isLegalPublished(config)) return [];
  const crossSite = site === "other";
  return LEGAL_PATHS.map((path) => ({ path, label: LEGAL_LABELS[path], site: "main", crossSite }));
}

/** True when a legal page should render (the page calls notFound() otherwise). */
export function legalRouteVisible(path, config) {
  return LEGAL_PATHS.includes(path) && isLegalPublished(config);
}

/** The footer copyright line. */
export function copyrightLine(year = new Date().getFullYear()) {
  return `© ${year} Allen Gillon · Paintings © Ann Gillon`;
}
