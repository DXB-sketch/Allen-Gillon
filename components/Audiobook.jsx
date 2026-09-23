"use client";

import { usePlayer } from "./Player";

export default function Audiobook({ title, src }) {
  const { current, playing, toggle } = usePlayer();
  const isCurrent = current && current.src === src;
  const isPlaying = isCurrent && playing;
  const track = { src, name: `${title} audiobook` };

  return (
    <button
      type="button"
      className={"audiobook-play" + (isPlaying ? " playing" : "")}
      onClick={() => toggle(track, [track])}
      aria-label={`${isPlaying ? "Pause" : "Play"} ${title} audiobook`}
    >
      <span className="audiobook-play-icon" aria-hidden="true">{isPlaying ? "❚❚" : "▶"}</span>
      <span>{isPlaying ? "Pause audiobook" : "Listen to audiobook"}</span>
    </button>
  );
}
