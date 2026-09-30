/* What the page reader speaks: the readable blocks inside <main>, each once.

   - Only leaf blocks are read (an h1-h6, p or li that holds no other block),
     so a list item is never read together with the heading inside it.
   - A TreeWalker skips whole subtrees that are hidden, collapsed or controls:
     [hidden], closed <details>, buttons, summaries, aria-hidden content and
     anything marked data-reader-skip (plus nav, forms and the book reader,
     album track lists and painting grid, which have their own controls).
   - Consecutive identical chunks are dropped.

   Pure DOM code with no React, so node --test can run it against jsdom. */

export const BLOCK_SELECTOR = "h1,h2,h3,h4,h5,h6,p,li";

export const SKIP_SELECTOR = [
  "[hidden]",
  "details:not([open])",
  "button",
  "summary",
  "[aria-hidden='true']",
  "[data-reader-skip]",
  "nav",
  "form",
  "select",
  "script",
  "style",
  "noscript",
  "template",
  ".bkr",
  ".trklist",
  ".artgrid",
].join(",");

function shouldSkip(element) {
  return element.matches(SKIP_SELECTOR);
}

/* Text of one leaf block, leaving out any skipped descendants (an icon marked
   aria-hidden, a button inside a paragraph, and so on). */
function blockText(element, NodeFilter) {
  const doc = element.ownerDocument;
  const walker = doc.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === 1) return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let text = "";
  for (let node = walker.nextNode(); node; node = walker.nextNode()) text += node.nodeValue;
  return text.replace(/\s+/g, " ").trim();
}

export function pageText(root) {
  if (!root) return [];
  const doc = root.ownerDocument || root;
  const view = doc.defaultView;
  const NodeFilter = view?.NodeFilter || globalThis.NodeFilter;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
      if (node.matches(BLOCK_SELECTOR) && !node.querySelector(BLOCK_SELECTOR)) return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_SKIP;
    },
  });
  const chunks = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = blockText(node, NodeFilter);
    if (text && text !== chunks[chunks.length - 1]) chunks.push(text);
  }
  return chunks;
}
