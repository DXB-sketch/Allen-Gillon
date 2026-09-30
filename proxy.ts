import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveRequest, runtimeEnv } from "./lib/sites.mjs";
import legal from "./content/legal.config.json";

// Host routing for allengillon.com and other.allengillon.com.
// All rules live in lib/sites.mjs resolveRequest(); this file only applies them.
// vinext 1.0.0-beta.12 loads proxy.ts (Next 16 convention) in dev and in the
// built Worker; see CLOUDFLARE.md.
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || request.nextUrl.host;
  const { pathname, search } = request.nextUrl;
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
  // except /favicon.ico, which is rewritten to the host's own icon (lib/sites.mjs).
  matcher: ["/((?!_next/|assets/|.*\\.[A-Za-z0-9]+$).*)", "/favicon.ico"],
};
