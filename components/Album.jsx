"use client";

import { useState } from "react";
import { usePlayer } from "./Player";

export default function Album({ id, title, meta, cover, coverAlt, tracks }) {
  const [open, setOpen] = useState(false);
  const { current, playing, toggle } = usePlayer();

  return (
    <article className={"album" + (open ? " open" : "")} id={id}>
      <button
        type="button"
        className="sleeve"
        aria-expanded={open ? "true" : "false"}
        aria-controls={"trk-" + id}
        onClick={() => setOpen(!open)}
      >
        <span className="disc" aria-hidden="true"></span>
        <img src={cover} alt={coverAlt} loading="lazy" />
      </button>
      <h3>{title}</h3>
      <p className="meta">{meta}</p>
      <div className="trkpanel" id={"trk-" + id} hidden={!open}>
        <ol className="trklist">
          {tracks.map((track) => {
            const isCurrent = current && current.src === track.src;
            const isCurrentAndPlaying = isCurrent && playing;
            return (
              <li key={track.src}>
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
      </div>
    </article>
  );
}
