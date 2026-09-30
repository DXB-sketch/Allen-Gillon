// Host routing for the two sites served by one Worker.
//
// allengillon.com        music and professional work (main)
// other.allengillon.com  "More on Allen": family, writing, Timeless and Ann's art (other)
//
// resolveRequest() is the single source of truth for redirects and rewrites.
// proxy.ts calls it on every non-asset request; tests/sites.test.mjs covers it.
// It has no imports so it runs unchanged in Node tests, the Vite dev server
// and the Cloudflare Worker.

export const SITES = {
  main: {
    key: "main",
    host: "allengillon.com",
    origin: "https://allengillon.com",
    devHost: "localhost",
    name: "Allen Gillon",
  },
  other: {
    key: "other",
    host: "other.allengillon.com",
    origin: "https://other.allengillon.com",
    devHost: "other.localhost",
    name: "More on Allen",
  },
};

export const WWW_HOST = "www.allengillon.com";

// Path prefixes owned by one site. Anything not listed (/, /comments, /api,
// /robots.txt, /sitemap.xml, icons) is served on both hosts.
export const ROUTE_OWNER = {
  "/hire": "main",
  "/music": "main",
  "/reviews": "main",
  "/shows": "main",
  "/privacy": "main",
  "/terms": "main",
  "/accessibility": "main",
  "/biography": "other",
  "/books": "other",
  "/read": "other",
  "/anns-art": "other",
  "/delivery": "other",
};

export const LEGAL_PATHS = ["/privacy", "/terms", "/accessibility"];

export const OTHER_HOME_PATH = "/other-home";

// Where the old /plays page lives now.
export const PLAYS_DESTINATION = "https://other.allengillon.com/books#school-plays";

export const DEFAULT_DEV_PORT = 3001;

function stripPort(host) {
  const value = String(host || "").trim().toLowerCase();
  if (value.startsWith("[")) {
    const end = value.indexOf("]");
    return end === -1 ? value : value.slice(1, end);
  }
  // A bare IPv6 address has more than one colon and no port to strip.
  if ((value.match(/:/g) || []).length > 1) return value;
  return value.split(":")[0];
}

function portOf(host) {
  const value = String(host || "").trim();
  const match = value.match(/:(\d+)$/);
  if (!match) return null;
  if (!value.startsWith("[") && (value.match(/:/g) || []).length > 1) return null;
  return match[1];
}

/** Loopback, *.localhost and *.test hosts. These never redirect. */
export function isLocalHost(host) {
  const name = stripPort(host);
  if (!name) return true;
  return (
    name === "localhost" ||
    name.endsWith(".localhost") ||
    name === "127.0.0.1" ||
    name.startsWith("127.") ||
    name === "::1" ||
    name === "0.0.0.0" ||
    name.endsWith(".test")
  );
}

/** Which site a host belongs to. Unknown hosts are main unless they start with other. */
export function siteForHost(host) {
  const name = stripPort(host);
  if (name === SITES.other.host || name.startsWith("other.")) return "other";
  return "main";
}

function isKnownHost(name) {
  return name === SITES.main.host || name === SITES.other.host || name === WWW_HOST;
}

/** The site that owns a pathname, or null when both sites serve it. */
export function ownerForPath(pathname, { legalPublished = false } = {}) {
  for (const [prefix, owner] of Object.entries(ROUTE_OWNER)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!legalPublished && LEGAL_PATHS.includes(prefix)) return null;
      return owner;
    }
  }
  return null;
}

function devPort(env = {}) {
  const port = Number(env.SITE_DEV_PORT);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_DEV_PORT;
}

function isTruthy(value) {
  return value === true || value === "1" || value === "true" || value === "yes";
}

/**
 * The routing variables from the runtime environment. Each is read as a
 * literal `process.env.NAME` so Vite can replace it (NODE_ENV always,
 * SITE_DEV_PORT in `vinext dev`), and guarded so the browser bundle, which has
 * no `process`, gets an empty value instead of a ReferenceError. In the
 * Worker, wrangler vars reach process.env through nodejs_compat.
 */
export function runtimeEnv() {
  const read = (fn) => {
    try {
      return fn();
    } catch {
      return undefined;
    }
  };
  return {
    NODE_ENV: read(() => process.env.NODE_ENV),
    SITE_PREVIEW: read(() => process.env.SITE_PREVIEW),
    SITE_DEV_PORT: read(() => process.env.SITE_DEV_PORT),
    VERCEL: read(() => process.env.VERCEL),
  };
}

/**
 * True when unknown hosts must not be sent to production: any non-production
 * build, SITE_PREVIEW set (start:vinext sets it for the local Worker), or a
 * Vercel deployment (VERCEL=1 is set on every Vercel build and function).
 */
export function isPreviewEnv(env = {}) {
  return env.NODE_ENV !== "production" || isTruthy(env.SITE_PREVIEW) || isTruthy(env.VERCEL);
}

/**
 * True when cross-site links should point at localhost / other.localhost:
 * `vinext dev`, or the local Worker preview (start:vinext sets SITE_PREVIEW).
 * Vercel previews keep production cross-site links.
 */
export function usesLocalLinks(env = {}) {
  return env.NODE_ENV !== "production" || isTruthy(env.SITE_PREVIEW);
}

/**
 * Absolute URL for a path on a site.
 *
 * With `host` set to a local host (localhost, other.localhost, 127.0.0.1),
 * the URL points at the local counterpart on the same port, so cross-site
 * links keep working in `vinext dev` and `wrangler dev`. With `dev: true`
 * and no host, the port comes from SITE_DEV_PORT (default 3001).
 * Otherwise it is the production URL.
 */
export function crossSiteUrl(site, path = "/", { host, env, dev = false } = {}) {
  const target = SITES[site] || SITES.main;
  const suffix = path.startsWith("/") || path.startsWith("#") || path.startsWith("?") ? path : `/${path}`;
  if (host && isLocalHost(host)) {
    const port = portOf(host);
    return `http://${target.devHost}${port ? `:${port}` : ""}${suffix}`;
  }
  if (dev) return `http://${target.devHost}:${devPort(env)}${suffix}`;
  return `${target.origin}${suffix}`;
}


function hasFileExtension(pathname) {
  const last = pathname.split("/").pop() || "";
  return /\.[a-z0-9]+$/i.test(last);
}

/**
 * Decide what to do with a request.
 *
 * @param {string} host  the Host header (port allowed)
 * @param {string} path  pathname, optionally with ?search
 * @param {{env?: object, legalPublished?: boolean}} options
 *   The HTTP method does not matter: /api/* is never redirected, whatever the method.
 * @returns {{site: 'main'|'other', action: 'next'} |
 *           {site: 'main'|'other', action: 'rewrite', pathname: string} |
 *           {site: 'main'|'other', action: 'redirect', status: 301, location: string}}
 */
export function resolveRequest(host, path, { env = {}, legalPublished = false } = {}) {
  const raw = String(path || "/");
  const queryAt = raw.indexOf("?");
  const pathname = (queryAt === -1 ? raw : raw.slice(0, queryAt)) || "/";
  const search = queryAt === -1 ? "" : raw.slice(queryAt);
  const name = stripPort(host);
  const site = siteForHost(host);
  const next = { site, action: "next" };
  const redirect = (location) => ({ site, action: "redirect", status: 301, location });
  const homeRewrite = site === "other" && pathname === "/"
    ? { site, action: "rewrite", pathname: OTHER_HOME_PATH }
    : null;

  // 5. The API is never redirected on any host, so POST /api/reviews works on both.
  if (pathname === "/api" || pathname.startsWith("/api/")) return next;

  // 6. Local and preview hosts: never redirect. Only the other-site home rewrite applies.
  // Known production host names still route with the preview flag set, so
  // curl Host-header checks against the local Worker behave like production.
  if (isLocalHost(host) || (!isKnownHost(name) && isPreviewEnv(env))) {
    return homeRewrite || next;
  }

  // 6. Unknown hosts in production go to main.
  if (!isKnownHost(name)) return redirect(`${SITES.main.origin}${pathname}${search}`);

  // 1. www goes to the apex.
  if (name === WWW_HOST) return redirect(`${SITES.main.origin}${pathname}${search}`);

  // 4. The old plays page.
  if (pathname === "/plays" || pathname === "/plays/") return redirect(PLAYS_DESTINATION);

  // 3. /other-home is only reachable through the rewrite of "/" on other.
  if (pathname === OTHER_HOME_PATH || pathname.startsWith(`${OTHER_HOME_PATH}/`)) {
    return redirect(`${SITES.other.origin}/${search}`);
  }

  // Static files are served on both hosts.
  if (hasFileExtension(pathname)) return next;

  // 2. Owned paths move to their own host.
  const owner = ownerForPath(pathname, { legalPublished });
  if (owner && owner !== site) return redirect(`${SITES[owner].origin}${pathname}${search}`);

  // 3. The other-site home.
  return homeRewrite || next;
}

/** Nav links per site. Cross-site entries carry `site` and render as absolute <a>. */
export const NAV = {
  main: [
    { href: "/", label: "Home" },
    { href: "/hire", label: "Bookings", className: "nav-booking" },
    { href: "/music", label: "Albums" },
  ],
  other: [
    { href: "/", label: "Home", aliases: [OTHER_HOME_PATH] },
    { href: "/biography", label: "Timeless" },
    { href: "/books", label: "Stories" },
    { href: "/anns-art", label: "Ann Gillon" },
  ],
};

export const CROSS_LINK = {
  main: { site: "other", path: "/", label: "More on Allen: stories, Timeless and Ann's art" },
  other: { site: "main", path: "/", label: "Allen Gillon: bookings and albums (Allen's music site)" },
};

/** True when a nav link should carry aria-current="page". */
export function isCurrentNav(link, pathname) {
  if (!pathname) return false;
  if (link.href === "/") return pathname === "/" || (link.aliases || []).includes(pathname);
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

// /comments "Back to" targets, per host. Each site only returns to its own pages.
const RETURN_PATTERNS = {
  main: /^\/(?:music(?:#[a-z0-9-]+)?|hire(?:#[a-z0-9-]+)?|shows|reviews)$/,
  other: /^\/(?:books(?:#[a-z0-9-]+)?|biography(?:#[a-z0-9-]+)?|anns-art|read\/[a-z0-9-]+)$/,
};
const RETURN_DEFAULT = { main: "/shows", other: "/books" };

export function safeReturnTo(site, requested) {
  const key = site === "other" ? "other" : "main";
  return typeof requested === "string" && RETURN_PATTERNS[key].test(requested)
    ? requested
    : RETURN_DEFAULT[key];
}

export function defaultReturnTo(site) {
  return RETURN_DEFAULT[site === "other" ? "other" : "main"];
}

/**
 * Inline script for app/layout.jsx: sets <html data-site="main|other"> before
 * first paint, using the same rule as siteForHost() (a host starting with
 * "other." is the other site). The root layout stays static because it never
 * reads the request; body-level CSS, NowBar and PageReader can read
 * document.documentElement.dataset.site.
 */
export const SITE_MARKER_SCRIPT =
  'document.documentElement.setAttribute("data-site",location.hostname.toLowerCase().indexOf("other.")===0?"other":"main")';
