"use client";

import { useEffect, useState } from "react";
import { crossSiteUrl, isLocalHost } from "../lib/sites.mjs";

// A plain <a> with an absolute URL to the other host. Cross-site navigation is
// a full page load by design (it stops NowBar audio). The server renders the
// production URL; on localhost, other.localhost or 127.0.0.1 the link is
// pointed at the local counterpart on the same port after hydration.
export default function CrossSiteLink({ site, path = "/", children, ...rest }) {
  const [href, setHref] = useState(() => crossSiteUrl(site, path));
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
