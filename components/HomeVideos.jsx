"use client";

import { useEffect, useRef, useState } from "react";

/* The "Videos" band on the main home page (app/(main)/page.jsx).

   One plain <video> with the browser's own controls, playing the clips in
   order: when one ends the next starts in the same place, as Allen asked
   (Take Five, then Satin Doll). After the last clip the player goes back to
   the first one's poster, ready to play the set again.

   Allen asked for the home page music to make way for the videos:

   - When a clip starts it announces itself on the shared playback event,
     so the home page music fades out (components/HomeMusic.jsx) and the
     page reader and album player stop too.
   - When the visitor pauses, or the last clip ends, it says so on
     VIDEO_STOP_EVENT and the music comes back, unless the visitor had
     turned the music off. Moving on to the next clip is not a stop.

   A pause is only reported after a short wait: dragging the seek bar fires
   pause then play, and that should not bring the music up for a moment. */

const PLAYBACK_EVENT = "allen:playback-start";
const VIDEO_SOURCE = "home-video";
export const VIDEO_STOP_EVENT = "allen:video-stop";
const STOP_DELAY_MS = 450;

export default function HomeVideos({ videos }) {
  const player = useRef(null);
  const [index, setIndex] = useState(0);
  const current = useRef(0);
  current.current = index;
  const playNext = useRef(false);
  const video = videos[index];
  const next = videos[index + 1];

  /* A new clip was loaded because the previous one ended: play it. If the
     browser refuses, the set has stopped, so the music may come back. */
  useEffect(() => {
    if (!playNext.current) return;
    playNext.current = false;
    player.current?.play().catch(() => window.dispatchEvent(new CustomEvent(VIDEO_STOP_EVENT)));
  }, [index]);

  useEffect(() => {
    const el = player.current;
    if (!el) return;
    let stopTimer = 0;
    let announced = false;

    const reportStop = (delay) => {
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        if (!announced || (!el.paused && !el.ended)) return;
        announced = false;
        window.dispatchEvent(new CustomEvent(VIDEO_STOP_EVENT));
      }, delay);
    };
    const onPlay = () => {
      clearTimeout(stopTimer);
      announced = true;
      window.dispatchEvent(new CustomEvent(PLAYBACK_EVENT, { detail: { source: VIDEO_SOURCE } }));
    };
    /* A clip that runs to its end also fires pause in some browsers; the
       ended handler decides, so a pause at the very end is ignored here. */
    const onPause = () => {
      if (!el.ended) reportStop(STOP_DELAY_MS);
    };
    const onEnded = () => {
      clearTimeout(stopTimer);
      if (current.current + 1 < videos.length) {
        playNext.current = true;
        setIndex(current.current + 1);
      } else {
        reportStop(0);
        setIndex(0);
      }
    };
    /* The page reader or an album track started: stop the video, and leave
       the music to whatever started. */
    const onOtherPlayback = (event) => {
      if (event.detail?.source === VIDEO_SOURCE) return;
      clearTimeout(stopTimer);
      announced = false;
      playNext.current = false;
      el.pause();
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    window.addEventListener(PLAYBACK_EVENT, onOtherPlayback);
    return () => {
      clearTimeout(stopTimer);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      window.removeEventListener(PLAYBACK_EVENT, onOtherPlayback);
    };
  }, [videos.length]);

  return (
    <div className="home-videos-list">
      <figure className="home-video">
        {/* src on the element itself, so a new clip loads when it changes. */}
        <video
          ref={player}
          controls
          playsInline
          preload="none"
          src={video.src}
          poster={video.poster}
          width={video.width}
          height={video.height}
          aria-label={video.label}
        >
          {video.captions ? (
            <track key={video.captions} kind="captions" src={video.captions} srcLang="en" label="English" default />
          ) : null}
        </video>
        <figcaption>
          {video.title} {video.credit ? <small>{video.credit}</small> : null}
          {next ? <small className="home-video-next">Next: {next.title}</small> : null}
        </figcaption>
      </figure>
    </div>
  );
}
