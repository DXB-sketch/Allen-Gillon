// Auto-turn ("follow the narration") rules for the book reader, kept free of
// React so node --test can check them. components/reader/BookReader.jsx is a
// thin shell around these functions.
//
// The reader turns a page by itself only while ALL of these are true:
//   1. follow is available: the title has cues AND a human has signed them
//      off ("verified": true in content/story-cues/<slug>.json),
//   2. the "Turn pages with the narration" toggle is on,
//   3. the shared player's source is THIS book,
//   4. the player's status is "playing",
//   5. the reader is not suspended.
// So: reading without audio never turns a page, pausing never turns a page,
// and opening the reader while its audio is already playing starts suspended
// (no jump on mount; the reader offers "Follow the narration" instead).
//
// A manual flip while this book's audio is loaded suspends following and the
// reader offers "Play from this page" and "Back to the narration".

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

/**
 * State on mount. `isThisBook` is whether the shared player already holds
 * this book's audio (playing or paused): then the reader starts suspended so
 * it never jumps away from the page the visitor asked for.
 */
export function initialFollow({ available = false, isThisBook = false } = {}) {
  return {
    available: Boolean(available),
    enabled: true,
    suspended: Boolean(isThisBook),
    reason: isThisBook ? "mount" : null,
  };
}

/** True when the page should track the narration right now. */
export function isFollowing(state, { isThisBook, status }) {
  return Boolean(state?.available && state.enabled && !state.suspended && isThisBook && status === "playing");
}

/**
 * Events:
 * - { type: "toggle", on }            the "Turn pages with the narration" switch
 * - { type: "manualFlip", isThisBook, status }  the visitor turned a page
 * - { type: "resume" }                "Follow the narration" / "Back to the narration"
 * - { type: "listen" }                Listen or "Play from this page" was pressed
 */
export function followReducer(state, event) {
  switch (event?.type) {
    case "toggle":
      return event.on
        ? { ...state, enabled: true }
        : { ...state, enabled: false, suspended: false, reason: null };
    case "manualFlip":
      if (event.isThisBook && ["playing", "loading", "paused"].includes(event.status)) {
        return { ...state, suspended: true, reason: "flip" };
      }
      return state;
    case "resume":
    case "listen":
      return { ...state, suspended: false, reason: null };
    default:
      return state;
  }
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
 * The page to turn to for the narration at `time`, or null to stay put.
 * `visible` lists the page indexes on screen (two in a spread), so a page that
 * is already showing is never flipped to.
 */
export function turnTarget(state, { isThisBook, status, time, cues, visible = [] }) {
  if (!isFollowing(state, { isThisBook, status })) return null;
  const page = pageForTime(cues, time);
  return visible.includes(page) ? null : page;
}

/**
 * What the reader offers under its toolbar, or null for nothing:
 * - "following": pages are turning with the narration
 * - "mount":     opened while this book was playing: offer "Follow the narration"
 * - "flip":      the visitor turned away: offer "Play from this page" and
 *                "Back to the narration"
 */
export function followPrompt(state, { isThisBook, status }) {
  if (!state?.available || !state.enabled || !isThisBook) return null;
  if (!state.suspended) return status === "playing" ? { kind: "following" } : null;
  if (status !== "playing" && status !== "paused" && status !== "loading") return null;
  return { kind: state.reason === "mount" ? "mount" : "flip" };
}
