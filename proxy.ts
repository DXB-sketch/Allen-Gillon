import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocalHost, resolveRequest, runtimeEnv } from "./lib/sites.mjs";
import legal from "./content/legal.config.json";
import { mediaAssetPath, serveMedia } from "./lib/media-range.mjs";

// Host routing for allengillon.com and other.allengillon.com.
// All rules live in lib/sites.mjs resolveRequest(); this file only applies them.
// vinext 1.0.0-beta.12 loads proxy.ts (Next 16 convention) in dev and in the
// built Worker; see CLOUDFLARE.md.
export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || request.nextUrl.host;
  const { pathname, search } = request.nextUrl;

  // Self-hosted audio and video, served with byte ranges so browsers can seek
  // (lib/media-range.mjs). Answered here, on every host, before any routing.
  if (mediaAssetPath(pathname)) return serveMedia(request);

  // Local previews only: drop a trailing slash on the same Host. The built
  // Worker under wrangler dev sees request.url as 127.0.0.1, so its own
  // trailing-slash redirect would send other.localhost visitors to main.
  // Production hosts are left to the framework (request.url matches Host there).
  if (pathname.length > 1 && pathname.endsWith("/") && host && isLocalHost(host)) {
    const target = `http://${host}${pathname.replace(/\/+$/, "")}${search}`;
    return NextResponse.redirect(target, 308);
  }

  const result = resolveRequest(host, `${pathname}${search}`, {
    // NODE_ENV, SITE_PREVIEW (set by start:vinext) and VERCEL decide whether
    // unknown hosts are sent to production; see isPreviewEnv().
    env: runtimeEnv(),
    legalPublished: legal.published === true,
  });

  if (result.action === "redirect") {
    return NextResponse.redirect(result.location, result.status);
  }
  if (result.action === "rewrite") {
    const url = request.nextUrl.clone();
    url.pathname = result.pathname;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // Skip build assets and any path with a file extension (images, audio, books, icons),
  // except /favicon.ico (rewritten to the host's own icon) and /robots.txt and
  // /sitemap.xml, so the www rule in lib/sites.mjs sends them to the apex too,
  // and /audio and /videos, which serveMedia answers with byte ranges.
  matcher: ["/((?!_next/|assets/|.*\\.[A-Za-z0-9]+$).*)", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/audio/:path*", "/videos/:path*"],
};
