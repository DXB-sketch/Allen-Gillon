// `npm run dev:vinext`: vinext dev on SITE_DEV_PORT (default 3001).
//
// The port is passed to vinext and exported as SITE_DEV_PORT, which
// vite.config.ts hands to the app so cross-site links point at
// http://localhost:<port> and http://other.localhost:<port>.
// Extra arguments go to vinext dev.
import { spawn } from "node:child_process";

const port = String(Number(process.env.SITE_DEV_PORT) || 3001);
const args = ["vinext", "dev", "--port", port, ...process.argv.slice(2)];
const child = spawn("npx", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, SITE_DEV_PORT: port },
});
child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
