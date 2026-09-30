// Local preview of the built Worker on both hosts.
//
// `wrangler dev` infers an origin from the first route in wrangler.json
// (allengillon.com) and rewrites every request's Host header to it, which
// hides the host that proxy.ts routes on. This script writes a copy of the
// built config without `routes` (dist/server/wrangler.local.<port>.json) so the Host
// header reaches the Worker unchanged, adds the local preview vars, then runs
// `wrangler dev` on it.
//
// Port: SITE_DEV_PORT, default 8787. Extra arguments go to wrangler.
import { readFileSync, writeFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const built = path.resolve("dist/server/wrangler.json");
const port = String(Number(process.env.SITE_DEV_PORT) || 8787);
// One config per port, so previews running side by side never hot-reload each
// other's SITE_DEV_PORT. To give a second preview its own .wrangler state, pass
// `-- --persist-to <dir>` (the default state holds the locally migrated D1).
const local = path.resolve(`dist/server/wrangler.local.${port}.json`);

const config = JSON.parse(readFileSync(built, "utf8"));
delete config.routes;
delete config.route;
// SITE_PREVIEW: unknown hosts (a LAN IP, a tunnel) are served locally instead
// of being sent to https://allengillon.com, and cross-site links point at
// localhost / other.localhost on this port. The deployed config never has it.
config.vars = { ...(config.vars || {}), SITE_PREVIEW: "1", SITE_DEV_PORT: port };
writeFileSync(local, JSON.stringify(config, null, 2));

// The built config lives in dist/server, so wrangler keeps this preview's
// local D1 in dist/server/.wrangler, which a rebuild starts empty. Apply the
// reviews migrations to that state first (a no-op once applied), so
// /api/reviews answers 200 locally instead of "no such table".
const extra = process.argv.slice(2);
const persistAt = extra.indexOf("--persist-to");
const persist = persistAt >= 0 ? extra.slice(persistAt, persistAt + 2) : [];
for (const db of config.d1_databases || []) {
  const migrate = spawnSync("npx", ["wrangler", "d1", "migrations", "apply", db.database_name, "--local", "--config", local, ...persist], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, CI: "1" },
  });
  if (migrate.status !== 0) console.warn(`start-local: could not apply the local D1 migrations for ${db.database_name}; /api/reviews may answer 503.`);
}

const args = ["wrangler", "dev", "--config", local, "--port", port, ...extra];
const child = spawn("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
