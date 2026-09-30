import { expect, test } from "@playwright/test";

/* The now-playing bar must never claim a track is playing when it is not. */

async function nothingPlaying(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("audio,video")].every((media) => media.paused || media.ended)
  );
}

test("a 30-second preview finishes without moving on to the next song", async ({ page }) => {
  await page.goto("/shows", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Play Brazil/ }).click();
  const name = page.locator("#nowname");
  await expect(name).toHaveText("Playing: Brazil", { timeout: 15_000 });
  await expect(page.locator(".nowbar .nowpreview")).toHaveText("30-second preview");

  await page.waitForTimeout(32_000);

  await expect(name).toHaveText("Finished: Brazil");
  expect(await nothingPlaying(page)).toBe(true);
  await expect(page.locator("#nowannounce")).toHaveText("Finished: Brazil");
});

test("starting the page reader pauses the music and the bar says so", async ({ page }) => {
  await page.goto("/music", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Show tracks for Misty" }).or(page.locator("#misty .sleeve")).first().click();
  await page.getByRole("button", { name: "Play Misty", exact: true }).click();
  const name = page.locator("#nowname");
  await expect(name).toHaveText("Playing: Misty", { timeout: 15_000 });

  await page.getByRole("button", { name: "Listen to this page" }).click();

  await expect(name).toHaveText("Paused: Misty");
  expect(await nothingPlaying(page)).toBe(true);
  await page.evaluate(() => window.speechSynthesis?.cancel());
});
