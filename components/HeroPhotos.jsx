"use client";

import { useEffect, useState } from "react";

/* The home page hero photo, which slowly cross-fades through Allen's other
   playing photos.

   - The first photo is server-rendered exactly as before, so it stays the
     page's LCP image. The others are added only after the page has loaded,
     so they never compete with it.
   - Each photo shows for SHOW_MS, then fades into the next (CSS transition
     on opacity, app/(main)/home.css).
   - The small button in the corner pauses and restarts it (WCAG 2.2.2:
     content that moves by itself for more than five seconds needs a pause).
   - With reduced motion requested, the first photo stays and nothing moves.
   - Each photo's caption is printed under it, on the mat, and fades with it.
     Captions of hidden photos are aria-hidden, so the page reader and screen
     readers read only the caption of the photo on show. */

const SHOW_MS = 6000;

export default function HeroPhotos({ photos }) {
  const [more, setMore] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (photos.length < 2) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const start = () => setMore(true);
    if (document.readyState === "complete") {
      const timer = setTimeout(start, 1500);
      return () => clearTimeout(timer);
    }
    const onLoad = () => setTimeout(start, 1500);
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, [photos.length]);

  useEffect(() => {
    if (!more || paused) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % photos.length), SHOW_MS);
    return () => clearInterval(timer);
  }, [more, paused, photos.length]);

  const shown = more ? photos : photos.slice(0, 1);
  return (
    <>
      <div className="home-photo-stack">
        {shown.map((photo, i) => (
          <img
            key={photo.src}
            className={i === 0 ? undefined : "home-photo-next"}
            src={photo.src}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            aria-hidden={i === index ? undefined : true}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding={i === 0 ? undefined : "async"}
            data-shown={i === index ? "" : undefined}
            style={photo.position ? { objectPosition: photo.position } : undefined}
          />
        ))}
        {more && (
          <button
            type="button"
            className="home-photo-pause"
            aria-label={paused ? "Play the photos" : "Pause the photos"}
            onClick={() => setPaused((value) => !value)}
          >
            <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
          </button>
        )}
      </div>
      <div className="home-photo-captions">
        {shown.map((photo, i) =>
          photo.caption ? (
            <p
              key={photo.src}
              className="home-photo-caption"
              aria-hidden={i === index ? undefined : true}
              data-shown={i === index ? "" : undefined}
            >
              {photo.caption}
            </p>
          ) : null,
        )}
      </div>
    </>
  );
}
