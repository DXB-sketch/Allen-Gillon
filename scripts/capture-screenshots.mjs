// Full-page screenshots of every route on both hosts, for the PR checklist.
// Usage (with a dev server running):
//   SITE_DEV_PORT=3742 node scripts/capture-screenshots.mjs docs/screenshots/after-w3
// Each shot is downscaled to 960px wide and saved as a quality-60 JPEG with
// sharp, to keep the repo small. Names follow docs/screenshots/before/:
// <route>-<width>.jpg, with "/" -> "_" and the other host's home as other-home.
// Pages are captured with prefers-reduced-motion: reduce.
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const port = Number(process.env.SITE_DEV_PORT || 3001);
const outDir = process.argv[2] || "docs/screenshots/after";
const WIDTHS = [375, 768, 1280, 1920];

export const SHOTS = [
  { host: "main", path: "/", name: "home" },
  { host: "main", path: "/hire", name: "hire" },
  { host: "main", path: "/music", name: "music" },
  { host: "main", path: "/reviews", name: "reviews" },
  { host: "main", path: "/shows", name: "shows" },
  { host: "main", path: "/comments", name: "comments" },
  { host: "main", path: "/no-such-page", name: "not-found" },
  { host: "other", path: "/", name: "other-home" },
  { host: "other", path: "/biography", name: "biography" },
  { host: "other", path: "/books", name: "books" },
  { host: "other", path: "/read/little-ray", name: "read_little-ray" },
  { host: "other", path: "/read/melting-pot", name: "read_melting-pot" },
  { host: "other", path: "/read/little-ray/text", name: "read_little-ray_text" },
  { host: "other", path: "/read/practice-in-communication-book-1", name: "read_practice-in-communication-book-1" },
  { host: "other", path: "/anns-art", name: "anns-art" },
  { host: "other", path: "/anns-art/ann-426502619623139", name: "anns-art_painting" },
  { host: "other", path: "/delivery", name: "delivery" },
  { host: "other", path: "/comments", name: "other-comments" },
  { host: "other", path: "/no-such-page", name: "other-not-found" },
];

const origin = (host) => (host === "other" ? `http://other.localhost:${port}` : `http://localhost:${port}`);

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const width of WIDTHS) {
    // Reduced motion: drawings are in their final state and /anns-art shows
    // its index layout, so every run captures the same frames.
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    // SHOTS_ONLY=name,name limits a run to some routes.
    const only = (process.env.SHOTS_ONLY || "").split(",").filter(Boolean);
    for (const shot of SHOTS) {
      if (only.length && !only.includes(shot.name)) continue;
      await page.goto(`${origin(shot.host)}${shot.path}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      // Let lazy images in view settle; the reader mounts after hydration.
      await page.evaluate(async () => {
        for (const img of document.images) img.loading = "eager";
        await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; setTimeout(r, 4000); }))));
      });
      // Scroll top to bottom so below-the-fold images (and anything the motion
      // observer reveals) paint, then decode every image. Without this a
      // full-page capture can show empty scrapbook frames on /biography.
      await page.evaluate(async () => {
        const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
        await Promise.all([...document.images].map((img) => img.decode().catch(() => null)));
      });
      await page.waitForTimeout(400);
      const png = await page.screenshot({ fullPage: true });
      const file = join(outDir, `${shot.name}-${width}.jpg`);
      await sharp(png).resize({ width: Math.min(960, width) }).jpeg({ quality: 60, mozjpeg: true }).toFile(file);
      console.log(file);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
