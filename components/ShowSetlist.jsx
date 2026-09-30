"use client";

import { usePlayer } from "./Player";
import { PREVIEW_LABEL, isPreviewTrack } from "../lib/player-state.mjs";

/* Numbered, playable setlist for the Matthew Allen 5 shows page.
   Same player wiring as the album track lists. These are 30-second previews:
   each row shows the preview's real length and they never auto-advance. */
export default function ShowSetlist({ tracks }) {
  const { current, playing, toggle } = usePlayer();
  return (
    <ol className="setlist" aria-label="Setlist">
      {tracks.map((track, i) => {
        const isCurrent = current && current.src === track.src;
        const isCurrentAndPlaying = isCurrent && playing;
        const preview = isPreviewTrack(track);
        return (
          <li key={track.src}>
            <span className="no">{i + 1}</span>
            <button
              type="button"
              className={"tplay" + (isCurrentAndPlaying ? " playing" : "")}
              onClick={() => toggle({ album: "The Matthew Allen 5 at Chandler Theatre", ...track }, tracks)}
              aria-label={(isCurrentAndPlaying ? "Pause " : "Play ") + track.name + (preview ? `, ${PREVIEW_LABEL}` : "")}
            >
              {isCurrentAndPlaying ? "❚❚" : "▶"}
            </button>
            <span className="tname">{track.name}</span>
            <span className="ttime">
              {preview ? <span className="tpreview">{PREVIEW_LABEL}</span> : null}
              {track.time}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
