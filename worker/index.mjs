import handler from "vinext/server/fetch-handler";
import { resolveRequest, runtimeEnv } from "../lib/sites.mjs";
import legal from "../content/legal.config.json" with { type: "json" };

export * from "vinext/server/fetch-handler";

// The Worker entry: vinext's own handler, with one step in front.
// vinext answers /page/ with a 308 to /page before proxy.ts runs, so on the
// wrong host (www, http, a path the other site owns) a trailing slash cost a
// second redirect. Here such requests go through resolveRequest (lib/sites.mjs),
// which drops the slash in the same single 301. Local and preview hosts,
// /api/* and everything else go to vinext unchanged.
export default {
  ...handler,
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      const result = resolveRequest(request.headers.get("host") || url.host, `${url.pathname}${url.search}`, {
        env: runtimeEnv(),
        legalPublished: legal.published === true,
        protocol: request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || url.protocol,
      });
      if (result.action === "redirect") return Response.redirect(result.location, result.status);
    }
    return handler.fetch(request, env, ctx);
  },
};
