/** @type {import('next').NextConfig} */
// Redirects, including the old /plays page, live in lib/sites.mjs and run from proxy.ts.
export default {
  experimental: {
    // Route misses render app/global-not-found.jsx, which is host-aware.
    globalNotFound: true,
  },
  // Metadata is resolved before the <head> is sent for every visitor, not only
  // for known bots. Without this, pages with an async generateMetadata
  // (/comments, /anns-art/[id], /read/[slug]) stream their <title> into the
  // body, which pa11y (HTML_CodeSniffer H25) reports as a missing title and
  // screen readers may announce late (W7).
  htmlLimitedBots: ".*",
};
