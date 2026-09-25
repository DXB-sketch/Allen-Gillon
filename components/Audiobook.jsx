"use client";

import { usePlayer } from "./Player";

export default function Audiobook({ title, src, kind = "audiobook" }) {
  const { current, playing, toggle } = usePlayer();
  const isCurrent = current && current.src === src;
  const isPlaying = isCurrent && playing;
  const track = { src, name: `${title} ${kind}` };
  const action = isPlaying ? `Pause ${kind}` : `Listen to ${kind}`;

  return (
    <button
      type="button"
      className={"audiobook-play" + (isPlaying ? " playing" : "")}
      onClick={() => toggle(track, [track])}
      aria-label={`${isPlaying ? "Pause" : "Play"} ${title} ${kind}`}
    >
      <span className="audiobook-play-icon" aria-hidden="true">{isPlaying ? "❚❚" : "▶"}</span>
      <span>{action}</span>
    </button>
  );
}
