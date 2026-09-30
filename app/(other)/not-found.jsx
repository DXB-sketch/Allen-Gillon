import NotFoundContent from "../../components/NotFoundContent";

// notFound() thrown by a page in this group (the gated legal routes on main,
// a bad /anns-art/[id] or /read/[slug] on other) renders here, inside the
// group layout, so the site's own mast, the one <main id="main"> and the
// footer are already around it. Unmatched URLs render app/global-not-found.jsx.
//
// No headers() here on purpose: vinext renders this boundary with every page
// in the group, and reading the request would make every page dynamic
// ("no-store"). The site is known from the group. The unpublished legal paths
// on other are rewritten to a missing path (lib/sites.mjs MISSING_PATH), so
// they get global-not-found and the More on Allen chrome.
// No robots entry: vinext already adds <meta name="robots" content="noindex"> to 404s.
export const metadata = {
  title: { absolute: "Page not found · More on Allen" },
};

export default function NotFound() {
  return <NotFoundContent />;
}
