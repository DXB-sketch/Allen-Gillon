"use client";

import { usePlayer } from "./Player";

/* The full school-play recordings moved to private/audio/ (paid content).
   Online there is a one-minute preview of each. Older links to the full
   recording play the preview instead, labelled as a preview. */
const PLAY_RECORDING = /^\/audio\/school-play-audiobooks\/([a-z0-9-]+)\.mp3$/;
export const PLAY_PREVIEW_LABEL = "1-minute preview";

export function audiobookTrack({ title, src, kind = "audiobook" }) {
  const recording = PLAY_RECORDING.exec(src || "");
  if (recording || kind === "preview") {
    const previewSrc = recording ? `/audio/school-play-previews/${recording[1]}.mp3` : src;
    return {
      track: { src: previewSrc, name: `${title} (preview)`, album: title, preview: true, previewLabel: PLAY_PREVIEW_LABEL },
      noun: "preview",
    };
  }
  return { track: { src, name: `${title} ${kind}`, album: title }, noun: kind };
}

export default function Audiobook({ title, src, kind = "audiobook" }) {
  const { track: loaded, status, toggle } = usePlayer();
  const { track, noun } = audiobookTrack({ title, src, kind });
  const isCurrent = loaded && loaded.src === track.src;
  const busy = isCurrent && (status === "playing" || status === "loading");
  const action = busy ? `Pause ${noun}` : noun === "preview" ? "Listen to a preview" : `Listen to ${noun}`;

  return (
    <button
      type="button"
      className={"audiobook-play" + (busy ? " playing" : "")}
      onClick={() => toggle(track, [track])}
      aria-label={`${busy ? "Pause" : "Play"} ${title} ${noun}`}
    >
      <span className="audiobook-play-icon" aria-hidden="true">{busy ? "❚❚" : "▶"}</span>
      <span>{action}</span>
    </button>
  );
}
