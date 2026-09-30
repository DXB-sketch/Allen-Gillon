"use client";

import { useEffect, useRef, useState } from "react";

/* A lite YouTube facade: a self-hosted poster and a play mark. Nothing loads
   from YouTube until the visitor asks for the video; then the facade is
   swapped for a youtube-nocookie iframe that starts playing.

   It is a real link to the video on YouTube, so it still works without JS
   (and opens in a new page there). With JS the click is kept on the page. */
export default function LiteYouTube({ id, title, poster }) {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    if (playing) frameRef.current?.focus();
  }, [playing]);

  if (playing) {
    return (
      <iframe
        ref={frameRef}
        className="lite-yt-frame"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      ></iframe>
    );
  }

  return (
    <a
      className="lite-yt"
      href={`https://www.youtube.com/watch?v=${id}`}
      aria-label={`Play video: ${title}`}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
        event.preventDefault();
        setPlaying(true);
      }}
    >
      <img src={poster} alt="" width="640" height="360" loading="lazy" decoding="async" />
      <svg className="lite-yt-mark" viewBox="0 0 80 80" aria-hidden="true" focusable="false">
        <circle cx="40" cy="40" r="34" />
        <path d="M32.5 25.8C31.3 25 30 25.8 30 27.2L30.4 52.9C30.4 54.3 31.8 55.1 33 54.3L53.6 41.6C54.8 40.9 54.8 39.3 53.6 38.5Z" />
      </svg>
    </a>
  );
}
