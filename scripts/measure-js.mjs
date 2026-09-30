// JS budget check (redesign plan: 150 KB gzip per route).
//
// Loads every route of both hosts in Chromium against a running server, waits
// for the network to go quiet, and sums the gzip size of every script the
// page fetched without interaction (each body is gzipped here at level 9, so
// the figure does not depend on the server's compression).
//
//   SITE_DEV_PORT=4870 npm run start:vinext        (the built Worker)
//   SITE_DEV_PORT=4870 node scripts/measure-js.mjs [--json]
import { gzipSync } from "node:zlib";
import { chromium } from "@playwright/test";

const port = Number(process.env.SITE_DEV_PORT || 8787);
const MAIN = `http://localhost:${port}`;
const OTHER = `http://other.localhost:${port}`;
const BUDGET = 150 * 1024;

const routes = [
  ...["/", "/hire", "/music", "/reviews", "/shows", "/comments"].map((r) => [MAIN, r]),
  ...["/", "/biography", "/books", "/anns-art", "/anns-art/ann-426502619623139", "/delivery"].map((r) => [OTHER, r]),
  [OTHER, "/read/little-ray"],
  [OTHER, "/read/melting-pot"],
  [OTHER, "/read/practice-in-communication-book-1"],
  [OTHER, "/read/little-ray/text"],
];

const browser = await chromium.launch();
const rows = [];
for (const [origin, route] of routes) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const scripts = new Map();
  page.on("response", async (res) => {
    const req = res.request();
    if (req.resourceType() !== "script") return;
    try {
      const body = await res.body();
      scripts.set(res.url(), gzipSync(body, { level: 9 }).length);
    } catch {}
  });
  await page.goto(origin + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const total = [...scripts.values()].reduce((a, b) => a + b, 0);
  const top = [...scripts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
    .map(([u, n]) => `${new URL(u).pathname.split("/").pop()} ${(n / 1024).toFixed(1)}`);
  rows.push({ host: origin === MAIN ? "main" : "other", route, files: scripts.size, kb: +(total / 1024).toFixed(1), over: total > BUDGET, top });
  await context.close();
}
await browser.close();
if (process.argv.includes("--json")) console.log(JSON.stringify(rows, null, 1));
else for (const r of rows) console.log(`${r.over ? "OVER" : "ok  "} ${r.host.padEnd(5)} ${r.route.padEnd(40)} ${String(r.kb).padStart(6)} KB  ${r.files} files  ${r.top.join(", ")}`);
