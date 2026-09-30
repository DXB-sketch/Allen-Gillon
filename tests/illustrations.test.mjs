import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import TwoInk from "../components/illustrations/two-ink.mjs";

const DIR = new URL("../components/illustrations/", import.meta.url);

function render(props, ...children) {
  const html = renderToStaticMarkup(h(TwoInk, { viewBox: "0 0 100 100", ...props }, ...children));
  return new JSDOM(`<!doctype html><body>${html}</body>`).window.document.querySelector("svg");
}

test("TwoInk is decorative and hidden from assistive tech", () => {
  const svg = render({}, h("path", { d: "M0 0L10 10" }));
  assert.equal(svg.getAttribute("aria-hidden"), "true");
  assert.equal(svg.getAttribute("focusable"), "false");
  assert.equal(svg.getAttribute("viewBox"), "0 0 100 100");
  assert.equal(svg.querySelector("title,desc,text"), null);
  assert.ok(svg.classList.contains("two-ink"));
});

test("TwoInk draws the strokes twice: second ink under the lead ink", () => {
  const svg = render({}, h("path", { d: "M0 0L10 10" }), h("circle", { cx: 5, cy: 5, r: 2 }));
  const groups = [...svg.children];
  assert.deepEqual(groups.map((g) => g.getAttribute("class")), ["two-ink__second", "two-ink__lead"]);
  for (const g of groups) {
    assert.equal(g.querySelectorAll("path").length, 1);
    assert.equal(g.querySelectorAll("circle").length, 1);
  }
  assert.match(svg.getAttribute("style"), /--ink-offset:\s*3px/);
});

test("draw hands the drawing to MotionObserver, nested groups drawn in both inks", () => {
  const svg = render({ draw: true, delay: 200 }, h("g", null, h("path", { d: "M0 0L1 1" })), h("line", { x1: 0, y1: 0, x2: 1, y2: 1 }));
  assert.equal(svg.getAttribute("data-motion"), "draw");
  assert.ok(svg.classList.contains("two-ink--draw"));
  assert.equal(svg.querySelectorAll("path,line").length, 4);
  assert.match(svg.getAttribute("style"), /--motion-delay:\s*200ms/);
});

test("without draw there is no motion hook", () => {
  const svg = render({}, h("path", { d: "M0 0L1 1" }));
  assert.equal(svg.getAttribute("data-motion"), null);
});

test("lead, ground and className map to classes", () => {
  const svg = render({ lead: "blue", ground: "ink", className: "hero-art" }, h("path", { d: "M0 0" }));
  for (const c of ["two-ink--blue", "two-ink--on-ink", "hero-art"]) assert.ok(svg.classList.contains(c), c);
});

test("illustration sources stay small, hand-authored and fill-free", async () => {
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".jsx") && !["TwoInk.jsx", "MotionObserver.jsx"].includes(f));
  assert.ok(files.length >= 2);
  for (const f of files) {
    const src = await readFile(new URL(f, DIR), "utf8");
    // Rendered twice, so 8KB of source is at most ~16KB on the page, well
    // inside the 40KB decorative SVG budget with room for a second drawing.
    assert.ok(Buffer.byteLength(src) < 8 * 1024, `${f} is over 8KB`);
    assert.match(src, /<TwoInk\b/, `${f} must use TwoInk`);
    assert.doesNotMatch(src, /<image\b|data:image|fill="(?!none)|Gradient|<filter\b|<text\b/, `${f} must be line art only`);
  }
});

test("illustrations.css only animates transform, opacity and stroke-dashoffset, with ease-out", async () => {
  const css = await readFile(new URL("../app/illustrations.css", import.meta.url), "utf8");
  for (const [, props] of css.matchAll(/transition:([^;]+);/g)) {
    for (const part of props.split(/,(?![^(]*\))/)) {
      const [prop] = part.trim().split(/\s+/);
      assert.ok(["opacity", "transform", "stroke-dashoffset"].includes(prop), `transition on ${prop}`);
      assert.match(part, /var\(--ease-out\)/);
    }
  }
  assert.doesNotMatch(css, /\bease\b(?!-)|ease-in-out|linear|infinite/);
  // Start states only under html.motion-ok, so content shows without JS.
  for (const m of css.matchAll(/([^{}]+)\{[^}]*(opacity:0|translate|animation:)/g)) {
    if (m[1].includes("two-ink__second")) continue; // the static misregistration
    assert.match(m[1], /html\.motion-ok/, m[1].trim());
  }
  // Keyframes move only stroke-dashoffset (the dasharray is constant).
  const frames = [...css.matchAll(/@keyframes[^{]+\{((?:[^{}]*\{[^}]*\})+)\s*\}/g)].map((m) => m[1]);
  assert.ok(frames.length > 0);
  for (const body of frames) {
    const props = new Set([...body.matchAll(/([a-z-]+):/g)].map((m) => m[1]));
    assert.deepEqual([...props].sort(), ["stroke-dasharray", "stroke-dashoffset"]);
    const arrays = new Set([...body.matchAll(/stroke-dasharray:([^;]+);/g)].map((m) => m[1]));
    assert.equal(arrays.size, 1);
  }
});
