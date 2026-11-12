"use client";

import { useEffect, useRef } from "react";

/* The "Videos" band on the main home page (app/(main)/page.jsx).

   Plain <video> elements with the browser's own controls. Allen asked for
   the home page music to make way for them:

   - When a video starts it announces itself on the shared playback event,
     so the home page music fades out (components/HomeMusic.jsx) and the
     page reader and album player stop too. Starting one video pauses any
     other.
   - When no video is playing any more (paused by the visitor, or run to its
     end) it says so on VIDEO_STOP_EVENT and the music comes back, unless
     the visitor had turned the music off.

   A pause is only reported after a short wait: dragging the seek bar fires
   pause then play, and that should not bring the music up for a moment. */

const PLAYBACK_EVENT = "allen:playback-start";
const VIDEO_SOURCE = "home-video";
export const VIDEO_STOP_EVENT = "allen:video-stop";
const STOP_DELAY_MS = 450;

export default function HomeVideos({ videos }) {
  const list = useRef(null);

  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const all = () => [...root.querySelectorAll("video")];
    let stopTimer = 0;
    let announced = false;

    const onPlay = (event) => {
      clearTimeout(stopTimer);
      all().forEach((video) => video !== event.target && video.pause());
      announced = true;
      window.dispatchEvent(new CustomEvent(PLAYBACK_EVENT, { detail: { source: VIDEO_SOURCE } }));
    };
    const onStop = () => {
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        if (!announced || all().some((video) => !video.paused && !video.ended)) return;
        announced = false;
        window.dispatchEvent(new CustomEvent(VIDEO_STOP_EVENT));
      }, STOP_DELAY_MS);
    };
    /* The page reader or an album track started: stop the video, and leave
       the music to whatever started. */
    const onOtherPlayback = (event) => {
      if (event.detail?.source === VIDEO_SOURCE) return;
      clearTimeout(stopTimer);
      announced = false;
      all().forEach((video) => video.pause());
    };

    const videoEls = all();
    videoEls.forEach((video) => {
      video.addEventListener("play", onPlay);
      video.addEventListener("pause", onStop);
      video.addEventListener("ended", onStop);
    });
    window.addEventListener(PLAYBACK_EVENT, onOtherPlayback);
    return () => {
      clearTimeout(stopTimer);
      videoEls.forEach((video) => {
        video.removeEventListener("play", onPlay);
        video.removeEventListener("pause", onStop);
        video.removeEventListener("ended", onStop);
      });
      window.removeEventListener(PLAYBACK_EVENT, onOtherPlayback);
    };
  }, []);

  return (
    <div className="home-videos-list" ref={list} data-count={videos.length}>
      {videos.map((video) => (
        <figure className="home-video" key={video.src}>
          <video
            controls
            playsInline
            preload="none"
            poster={video.poster}
            width={video.width}
            height={video.height}
            aria-label={video.label}
          >
            <source src={video.src} type="video/mp4" />
            {video.captions ? (
              <track kind="captions" src={video.captions} srcLang="en" label="English" default />
            ) : null}
          </video>
          <figcaption>
            {video.title} {video.credit ? <small>{video.credit}</small> : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
