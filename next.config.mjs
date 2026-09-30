/** @type {import('next').NextConfig} */
// Redirects, including the old /plays page, live in lib/sites.mjs and run from proxy.ts.
export default {
  experimental: {
    // Route misses render app/global-not-found.jsx, which is host-aware.
    globalNotFound: true,
  },
};
