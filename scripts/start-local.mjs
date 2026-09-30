// Local preview of the built Worker on both hosts.
//
// `wrangler dev` infers an origin from the first route in wrangler.json
// (allengillon.com) and rewrites every request's Host header to it, which
// hides the host that proxy.ts routes on. This script writes a copy of the
// built config without `routes` (dist/server/wrangler.local.json) so the Host
// header reaches the Worker unchanged, then runs `wrangler dev` on it.
//
// Port: SITE_DEV_PORT, default 8787. Extra arguments go to wrangler.
import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const built = path.resolve("dist/server/wrangler.json");
const local = path.resolve("dist/server/wrangler.local.json");
const config = JSON.parse(readFileSync(built, "utf8"));
delete config.routes;
delete config.route;
writeFileSync(local, JSON.stringify(config, null, 2));

const port = String(Number(process.env.SITE_DEV_PORT) || 8787);
const args = ["wrangler", "dev", "--config", local, "--port", port, ...process.argv.slice(2)];
const child = spawn("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
