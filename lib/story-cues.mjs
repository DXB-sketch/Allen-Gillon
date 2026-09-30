// Helpers for content/story-cues/<slug>.json, written by
// scripts/align-story-cues.py. A cue file maps each reader page (0-based index
// in `cues`) to the time in the narration where that page's words begin.

/**
 * Pages may follow the narration only after a human has listened to the cue
 * review clips and set `"verified": true` in the cue file. Anything else,
 * including a missing file, keeps follow off.
 */
export function followEnabled(cueFile) {
  return Boolean(cueFile) && cueFile.verified === true;
}

/** Start times in seconds, one per page, or null when follow is off. */
export function cueStarts(cueFile) {
  if (!followEnabled(cueFile)) return null;
  return cueFile.cues.map((cue) => cue.start);
}
