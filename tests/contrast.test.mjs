import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkPalette, readTokens } from "../scripts/contrast.mjs";

const css = readFileSync(new URL("../app/site.css", import.meta.url), "utf8");

test("the palette tokens are read from app/site.css", () => {
  const tokens = readTokens(css);
  for (const name of ["paper", "paper-2", "ink", "red", "red-deep", "blue", "soft", "on"]) {
    assert.ok(tokens[name], `--${name} is an oklch token`);
  }
});

test("every colour pair meets its WCAG threshold (body 7:1, text 4.5:1, large text and UI 3:1)", () => {
  const failed = checkPalette(css).filter((r) => !r.pass);
  assert.deepEqual(
    failed.map((r) => `${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)} < ${r.min}`),
    [],
  );
});
