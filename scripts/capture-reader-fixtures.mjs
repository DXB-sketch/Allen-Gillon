/* Saves the server-rendered <main> of a few real pages as fixtures for
   tests/page-reader.test.mjs.

   Start a dev server first (npx vinext dev --port 3101), then run:
     SITE_DEV_PORT=3101 node scripts/capture-reader-fixtures.mjs */

import { mkdir, writeFile } from "node:fs/promises";

const port = Number(process.env.SITE_DEV_PORT || 3001);
const base = process.env.SITE_URL || `http://localhost:${port}`;
const pages = {
  books: "/books",
  "read-little-hi-doh": "/read/little-hi-doh",
  "read-melting-pot": "/read/melting-pot",
  "anns-art": "/anns-art",
};

const outDir = new URL("../tests/fixtures/page-reader/", import.meta.url);
await mkdir(outDir, { recursive: true });

for (const [name, path] of Object.entries(pages)) {
  const response = await fetch(base + path);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  const html = await response.text();
  const match = html.match(/<main[\s\S]*<\/main>/);
  if (!match) throw new Error(`${path} has no <main>`);
  /* Drop inline scripts and styles: they are not read and only add noise. */
  const main = match[0]
    .replace(/<script\b[\s\S]*?<\/script>/g, "")
    .replace(/<style\b[\s\S]*?<\/style>/g, "");
  await writeFile(new URL(`${name}.html`, outDir), `<!-- captured from ${path} -->\n${main}\n`);
  console.log(`${name}.html  ${main.length} bytes`);
}
