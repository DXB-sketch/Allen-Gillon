/* Pure logic for the shared audio player (components/Player.jsx), kept free of
   React so node --test can import it.

   Player status is one of: idle | loading | playing | paused | ended | error. */

export const PLAYER_STATUSES = ["idle", "loading", "playing", "paused", "ended", "error"];

export const PREVIEW_LABEL = "30-second preview";

/* Folders that hold 30-second previews rather than full recordings:
   the Matthew Allen 5 at Chandler Theatre and "Dedicated to Tim Hughes". */
const PREVIEW_FOLDERS = ["/audio/ma5-chandler-theatre/", "/audio/dedicated-to-tim-hughes/"];

export function isPreviewTrack(track) {
  if (!track) return false;
  if (track.preview === true) return true;
  const src = String(track.src || "");
  return PREVIEW_FOLDERS.some((folder) => src.includes(folder));
}

/* The words shown in the now-playing bar. */
export function nowBarLabel(status, track) {
  const name = track?.name;
  if (!name) return "";
  switch (status) {
    case "loading":
      return `Loading: ${name}`;
    case "playing":
      return `Playing: ${name}`;
    case "paused":
      return `Paused: ${name}`;
    case "ended":
      return `Finished: ${name}`;
    case "error":
      return `Couldn't play ${name}`;
    default:
      return "";
  }
}

/* The track to play after `track` ends, or null to stop.
   Previews never auto-advance, and a list only advances into the next track
   of the same list the listener chose (never into a preview). */
export function nextTrackAfterEnd(track, playlist) {
  if (!track || !Array.isArray(playlist) || isPreviewTrack(track)) return null;
  const index = playlist.findIndex((item) => item && item.src === track.src);
  if (index < 0) return null;
  const next = playlist[index + 1];
  if (!next || isPreviewTrack(next)) return null;
  return next;
}

/* Status after an audio element event. `audio` needs only `ended` and `error`.
   Browsers fire "pause" after a media error; the error must stay visible. */
export function statusForAudioEvent(type, audio, previous) {
  switch (type) {
    case "playing":
      return "playing";
    case "pause":
      if (audio?.error) return "error";
      return audio?.ended ? "ended" : "paused";
    case "ended":
      return "ended";
    case "error":
      return "error";
    default:
      return previous;
  }
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest < 10 ? "0" : ""}${rest}`;
}

export function timeText(currentTime, duration, fallbackDuration = "0:00") {
  const total = Number.isFinite(duration) && duration > 0 ? formatTime(duration) : fallbackDuration || "0:00";
  return `${formatTime(currentTime)} / ${total}`;
}
