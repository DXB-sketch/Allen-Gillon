"use client";

import { useEffect, useState } from "react";
import { crossSiteUrl, isLocalHost, runtimeEnv, usesLocalLinks } from "../lib/sites.mjs";

// A plain <a> with an absolute URL to the other host. Cross-site navigation is
// a full page load by design (it stops NowBar audio).
//
// Server render: the production URL, except in `vinext dev` and the local
// Worker preview (start:vinext sets SITE_PREVIEW), where it is
// http://localhost or http://other.localhost on SITE_DEV_PORT. So local HTML
// never links to production, even before hydration or with JS off.
// After hydration, a page opened on localhost, other.localhost or 127.0.0.1
// is pointed at the local counterpart on the port actually in use.
function initialHref(site, path) {
  const env = runtimeEnv();
  return crossSiteUrl(site, path, { dev: usesLocalLinks(env), env });
}

export default function CrossSiteLink({ site, path = "/", children, ...rest }) {
  const [href, setHref] = useState(() => initialHref(site, path));
  useEffect(() => {
    const host = window.location.host;
    if (isLocalHost(host)) setHref(crossSiteUrl(site, path, { host }));
  }, [site, path]);
  return (
    <a href={href} data-cross-site={site} {...rest}>
      {children}
    </a>
  );
}
