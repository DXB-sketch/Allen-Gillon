"use client";

import { usePlayer } from "./Player";

/* Numbered, playable setlist for the Matthew Allen 5 shows page.
   Same player wiring as the album track lists. */
export default function ShowSetlist({ tracks }) {
  const { current, playing, toggle } = usePlayer();
  return (
    <ol className="setlist" aria-label="Setlist">
      {tracks.map((track, i) => {
        const isCurrent = current && current.src === track.src;
        const isCurrentAndPlaying = isCurrent && playing;
        return (
          <li key={track.src}>
            <span className="no">{i + 1}</span>
            <button
              type="button"
              className={"tplay" + (isCurrentAndPlaying ? " playing" : "")}
              onClick={() => toggle(track, tracks)}
              aria-label={(isCurrentAndPlaying ? "Pause " : "Play ") + track.name}
            >
              {isCurrentAndPlaying ? "❚❚" : "▶"}
            </button>
            <span className="tname">{track.name}</span>
            <span className="ttime">{track.time}</span>
          </li>
        );
      })}
    </ol>
  );
}
