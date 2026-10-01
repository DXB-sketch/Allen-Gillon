// Byte-range support for the self-hosted audio and video.
//
// Cloudflare's static-asset path answers every Range request with the whole
// file as 200, so browsers cannot seek into audio they have not buffered yet.
// wrangler.jsonc sends /audio/* and /videos/* to the Worker first
// (assets.run_worker_first) and proxy.ts answers them with serveMedia(), which
// fetches the file from the ASSETS binding and answers Range requests with 206.
// (A route handler would not do: vinext serves public/ files ahead of routes
// and forces route responses to no-store.) In production Workers Caching may
// strip Range, cache the full 200 and slice it itself; serveMedia only slices
// when a Range header reaches it.

/* Parses a single "bytes=" range against a file of `size` bytes.
   Returns {start, end} (inclusive), "unsatisfiable", or null to ignore the
   header and send the whole file (missing, malformed or multi-range). */
export function parseRange(header, size) {
  if (typeof header !== "string") return null;
  const match = /^\s*bytes\s*=\s*(\d*)\s*-\s*(\d*)\s*$/i.exec(header);
  if (!match) return null;
  const [, first, last] = match;
  if (first === "" && last === "") return null;
  if (size <= 0) return "unsatisfiable";
  if (first === "") {
    const suffix = Number(last);
    if (!Number.isSafeInteger(suffix)) return null;
    if (suffix === 0) return "unsatisfiable";
    return { start: Math.max(0, size - suffix), end: size - 1 };
  }
  const start = Number(first);
  const end = last === "" ? size - 1 : Math.min(Number(last), size - 1);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return null;
  if (start >= size || end < start) return "unsatisfiable";
  return { start, end };
}

const PASS_HEADERS = ["content-type", "etag", "last-modified", "cache-control"];

/* Turns a full asset response into the response for `request`: the whole file
   (200, with Accept-Ranges) or one slice (206), or 416. HEAD gets no body. */
export async function rangeResponse(request, asset) {
  if (!asset.ok) return asset;
  const headers = new Headers();
  for (const name of PASS_HEADERS) {
    const value = asset.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("accept-ranges", "bytes");
  const head = request.method === "HEAD";
  const rangeHeader = request.headers.get("range");
  const ifRange = request.headers.get("if-range");
  const etag = asset.headers.get("etag");
  const useRange = rangeHeader && (!ifRange || (etag && ifRange === etag));

  if (!useRange) {
    const length = asset.headers.get("content-length");
    if (length) headers.set("content-length", length);
    return new Response(head ? null : asset.body, { status: 200, headers });
  }

  const body = await asset.arrayBuffer();
  const size = body.byteLength;
  const range = parseRange(rangeHeader, size);
  if (range === null) {
    headers.set("content-length", String(size));
    return new Response(head ? null : body, { status: 200, headers });
  }
  if (range === "unsatisfiable") {
    headers.set("content-range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  const { start, end } = range;
  headers.set("content-range", `bytes ${start}-${end}/${size}`);
  headers.set("content-length", String(end - start + 1));
  return new Response(head ? null : body.slice(start, end + 1), { status: 206, headers });
}

/* Fetches /audio/... or /videos/... from the static assets binding (never
   through the Worker again) and applies rangeResponse. */
export async function serveMedia(request) {
  const cloudflareRuntime = "cloudflare:workers";
  const { env } = await import(/* @vite-ignore */ /* webpackIgnore: true */ cloudflareRuntime);
  const url = new URL(request.url);
  const assetPath = mediaAssetPath(url.pathname);
  if (!assetPath) return new Response("Not found", { status: 404 });
  const asset = await env.ASSETS.fetch(new Request(new URL(assetPath, url.origin)));
  return rangeResponse(request, asset);
}

/* The asset path for a media request (/audio/... or /videos/... files only),
   or null for anything else. */
export function mediaAssetPath(pathname) {
  const path = pathname;
  if (!/^\/(audio|videos)\/[^?#]+\.[A-Za-z0-9]+$/.test(path) || path.includes("..")) return null;
  return path;
}
