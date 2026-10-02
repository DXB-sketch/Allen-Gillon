// Auto-turn ("follow the narration") rules for the book reader, kept free of
// React so node --test can check them. components/reader/BookReader.jsx is a
// thin shell around these functions.
//
// Following is always on for a title with signed-off cues ("verified": true in
// content/story-cues/<slug>.json). There is no switch: while the shared
// player is playing THIS book, the reader turns pages with the narration.
//
// The reader turns only when the narration reaches a new page (a cue is
// crossed, or the playhead is moved to another page's words). It never jumps
// on its own otherwise, so:
//   - opening the reader while the audiobook already plays (say, coming back
//     from another part of the site) leaves the visitor's page alone until the
//     narration's next page turn, then goes to the narrated page;
//   - turning pages by hand while it plays is fine: at the narration's next
//     page turn the book goes to the narrated page, wherever the visitor was.
// Reading without audio, or with the audio paused, never turns a page.

/** Seconds of slack when matching a time to a cue (float rounding in timeupdate). */
const EPSILON = 0.05;

/** Follow may run only for signed-off cues with one start time per page. */
export function followAvailable({ cues, verified } = {}) {
  return verified === true && Array.isArray(cues) && cues.length > 0 && cues.every(Number.isFinite);
}

/** Index of the page being narrated at `time`: the last cue at or before it. */
export function pageForTime(cues, time) {
  if (!Array.isArray(cues) || !cues.length || !Number.isFinite(time)) return 0;
  let page = 0;
  for (let i = 1; i < cues.length; i += 1) {
    if (time + EPSILON < cues[i]) break;
    page = i;
  }
  return page;
}

/** True when the page should track the narration right now. */
export function isFollowing({ available, isThisBook, status }) {
  return Boolean(available && isThisBook && status === "playing");
}

/**
 * What Listen (or "Play from this page") does. It never touches another
 * source: when the player holds something else (an album track, another
 * book), this book's audio is loaded instead of seeking that source.
 * - { type: "seek", time }  the player already has this book: seek and play
 * - { type: "load", time }  load this book's audio starting at `time`
 * - { type: "toggle" }      no signed-off cues: plain play or pause
 */
export function listenAction({ isThisBook, page = 0, cues, available }) {
  if (!available) {
    return isThisBook ? { type: "toggle" } : { type: "load", time: 0 };
  }
  const time = Number.isFinite(cues?.[page]) ? cues[page] : 0;
  return { type: isThisBook ? "seek" : "load", time };
}

/**
 * How far ahead (seconds) an animated narration turn starts. The flip takes
 * 0.7 s and timeupdate fires every 0.25 s or so. With the 0.05 s cue slack
 * (EPSILON) a 0.45 s lead starts the turn up to 0.5 s early, which puts
 * both the start of the turn (about cue - 0.5 to cue - 0.25) and the new page
 * landing (about cue + 0.2 to cue + 0.45) inside the plan's 0.5 s window.
 * Instant turns (reduced motion) use no lead.
 */
export const TURN_LEAD = 0.45;

/** The narrated page at `time`, looking ahead by `lead` seconds. */
export function narratedPage(cues, time, lead = 0) {
  return pageForTime(cues, time + (Number.isFinite(lead) && lead > 0 ? lead : 0));
}

/**
 * One step of following. `last` is the narrated page the reader saw on its
 * previous step (null when it has not seen one yet: the first step only
 * records where the narration is, it never turns).
 * Returns { page, target }: `page` is the narrated page now (remember it as
 * the next `last`), and `target` the page to turn to, or null to stay put.
 * The book turns only when the narrated page has changed since `last`, and
 * never to a page that is already on screen (`visible`: two in a spread).
 */
export function followStep({ last = null, time, cues, visible = [], lead = 0 }) {
  const page = narratedPage(cues, time, lead);
  if (last === null || page === last || visible.includes(page)) return { page, target: null };
  return { page, target: page };
}
