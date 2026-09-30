"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  PREVIEW_LABEL,
  isPreviewTrack,
  nextTrackAfterEnd,
  nowBarLabel,
  statusForAudioEvent,
  timeText,
} from "../lib/player-state.mjs";

/* One shared <audio>, play buttons on each track row, and a sticky
   now-playing bar that says in words what is happening. No autoplay.

   status: idle | loading | playing | paused | ended | error, driven by the
   audio element's own events. `track` is the track loaded in the player;
   `current` is set only once its playback has actually started. */

const PlayerContext = createContext(null);
const PLAYBACK_EVENT = "allen:playback-start";
const PLAYER_SOURCE = "shared-audio-player";

function announceAudioPlayback() {
  window.dispatchEvent(new CustomEvent(PLAYBACK_EVENT, { detail: { source: PLAYER_SOURCE } }));
}

function setMediaSession(track, status) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  try {
    if (track && typeof window.MediaMetadata === "function") {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.name,
        artist: track.artist || "Allen Gillon",
        album: track.album || (isPreviewTrack(track) ? PREVIEW_LABEL : ""),
        artwork: track.artwork ? [{ src: track.artwork }] : [],
      });
    } else if (!track) {
      navigator.mediaSession.metadata = null;
    }
    navigator.mediaSession.playbackState = status === "playing" ? "playing" : track ? "paused" : "none";
  } catch {
    /* Media Session is a nicety; ignore browsers that reject it. */
  }
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const trackRef = useRef(null); /* the track loaded in the audio element */
  const playlistRef = useRef(null); /* the list the listener chose it from */
  const requestRef = useRef(0); /* bumps on every new play request */
  const pendingRef = useRef(false); /* true while a play() promise is unsettled */
  const statusRef = useRef("idle");
  const [track, setTrack] = useState(null);
  const [current, setCurrent] = useState(null);
  const [status, setStatusState] = useState("idle");
  const [announcement, setAnnouncement] = useState("");

  const setStatus = useCallback((next) => {
    statusRef.current = next;
    setStatusState(next);
    setMediaSession(trackRef.current, next);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !trackRef.current) return;
    const request = ++requestRef.current;
    announceAudioPlayback();
    pendingRef.current = true;
    if (statusRef.current !== "playing") setStatus("loading");
    try {
      await audio.play();
      if (request !== requestRef.current) return;
      pendingRef.current = false;
      setCurrent(trackRef.current);
      setStatus("playing");
    } catch (error) {
      if (request !== requestRef.current) return;
      pendingRef.current = false;
      /* pause() before play() settled (for example the page reader started) */
      if (error?.name === "AbortError" && audio.getAttribute("src")) setStatus(audio.ended ? "ended" : "paused");
      else setStatus("error");
    }
  }, [setStatus]);

  const load = useCallback(
    (nextTrack, playlist, { startAt = 0 } = {}) => {
      const audio = audioRef.current;
      if (!audio) return;
      playlistRef.current = playlist && playlist.length ? playlist : [nextTrack];
      trackRef.current = nextTrack;
      setTrack(nextTrack);
      setCurrent(null);
      setStatus("loading");
      /* A start time (the book reader's Listen on a later page) rides on a
         media fragment, and is applied again once metadata is known in case
         the browser ignored the fragment. */
      const start = Number.isFinite(startAt) && startAt > 0 ? startAt : 0;
      audio.src = start ? `${nextTrack.src}#t=${start.toFixed(2)}` : nextTrack.src;
      if (start) {
        const applyStart = () => {
          if (Math.abs(audio.currentTime - start) > 0.3) audio.currentTime = start;
        };
        audio.addEventListener("loadedmetadata", applyStart, { once: true });
      }
      play();
    },
    [play, setStatus]
  );

  /* Book reader: move within the loaded track, and play it if it was paused. */
  const seek = useCallback(
    (time, { andPlay = true } = {}) => {
      const audio = audioRef.current;
      if (!audio || !trackRef.current || !Number.isFinite(time)) return;
      setAnnouncement("");
      if (audio.readyState >= 1) audio.currentTime = Math.max(0, time);
      else audio.addEventListener("loadedmetadata", () => (audio.currentTime = Math.max(0, time)), { once: true });
      if (andPlay && statusRef.current !== "playing") {
        if (statusRef.current === "error") audio.load();
        play();
      }
    },
    [play]
  );

  /* Book reader: play `nextTrack` from `time`. Seeks only when that track is
     already the loaded source; anything else (an album track) is replaced by
     loading this track, never seeked. */
  const playAt = useCallback(
    (nextTrack, time = 0) => {
      setAnnouncement("");
      if (trackRef.current && trackRef.current.src === nextTrack.src) seek(time);
      else load(nextTrack, [nextTrack], { startAt: time });
    },
    [load, seek]
  );

  const togglePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !trackRef.current) return;
    setAnnouncement("");
    const now = statusRef.current;
    if (now === "playing" || now === "loading") {
      audio.pause();
      return;
    }
    if (now === "ended") audio.currentTime = 0;
    if (now === "error") audio.load();
    play();
  }, [play]);

  const toggle = useCallback(
    (nextTrack, playlist) => {
      setAnnouncement("");
      if (trackRef.current && trackRef.current.src === nextTrack.src) {
        togglePause();
        return;
      }
      load(nextTrack, playlist);
    },
    [load, togglePause]
  );

  const close = useCallback(() => {
    const audio = audioRef.current;
    requestRef.current += 1;
    pendingRef.current = false;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    trackRef.current = null;
    playlistRef.current = null;
    setTrack(null);
    setCurrent(null);
    setAnnouncement("");
    setStatus("idle");
  }, [setStatus]);

  /* Audio element events drive the status. */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEvent = (event) => {
      if (!trackRef.current || !audio.getAttribute("src")) return;
      if (event.type === "pause" && pendingRef.current && !audio.ended) return;
      if (event.type === "playing") setCurrent(trackRef.current);
      setStatus(statusForAudioEvent(event.type, audio, statusRef.current));
      if (event.type === "error") setAnnouncement(nowBarLabel("error", trackRef.current));
      if (event.type !== "ended") return;
      const finished = trackRef.current;
      const next = nextTrackAfterEnd(finished, playlistRef.current);
      if (!next) {
        setAnnouncement(nowBarLabel("ended", finished));
        return;
      }
      /* Moving on through the list the listener chose: say so out loud. */
      setAnnouncement(`Finished ${finished.name}. Now playing the next track, ${next.name}.`);
      load({ album: finished.album, artwork: finished.artwork, ...next }, playlistRef.current);
    };
    const types = ["playing", "pause", "ended", "error"];
    types.forEach((type) => audio.addEventListener(type, onEvent));
    return () => types.forEach((type) => audio.removeEventListener(type, onEvent));
  }, [load, setStatus]);

  /* Another reader (the page reader) started: pause the music. */
  useEffect(() => {
    const stopForAnotherReader = (event) => {
      if (event.detail?.source === PLAYER_SOURCE) return;
      audioRef.current?.pause();
    };
    window.addEventListener(PLAYBACK_EVENT, stopForAnotherReader);
    return () => window.removeEventListener(PLAYBACK_EVENT, stopForAnotherReader);
  }, []);

  /* Lock-screen and headset play and pause buttons. */
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler("play", () => statusRef.current !== "playing" && togglePause());
      navigator.mediaSession.setActionHandler("pause", () => statusRef.current === "playing" && togglePause());
    } catch {
      /* unsupported action */
    }
  }, [togglePause]);

  const playing = status === "playing";

  return (
    <PlayerContext.Provider value={{ track, current, status, playing, announcement, toggle, togglePause, close, audioRef, seek, playAt }}>
      {children}
      <audio ref={audioRef} preload="none" hidden data-shared-player="" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}

export function NowBar() {
  const { track, status, announcement, togglePause, close, audioRef } = usePlayer();
  const [pos, setPos] = useState(0);
  const [time, setTime] = useState(timeText(0, NaN));
  const src = track?.src;
  const fallbackDuration = track?.time;

  useEffect(() => {
    /* A new source starts from zero, with the listed duration until the real one loads. */
    setPos(0);
    setTime(timeText(0, NaN, fallbackDuration));
    const audio = audioRef.current;
    if (!audio || !src) return;
    function onTimeUpdate() {
      setPos(audio.duration ? (audio.currentTime / audio.duration) * 1000 : 0);
      setTime(timeText(audio.currentTime, audio.duration, fallbackDuration));
    }
    const types = ["timeupdate", "durationchange", "loadedmetadata", "seeked"];
    types.forEach((type) => audio.addEventListener(type, onTimeUpdate));
    return () => types.forEach((type) => audio.removeEventListener(type, onTimeUpdate));
  }, [audioRef, src, fallbackDuration]);

  function onSeek(e) {
    const value = Number(e.target.value);
    setPos(value);
    const audio = audioRef.current;
    if (audio && audio.duration) audio.currentTime = (value / 1000) * audio.duration;
  }

  const on = Boolean(track) && status !== "idle";
  const busy = status === "playing" || status === "loading";
  const buttonLabel = busy ? "Pause" : status === "error" ? "Try again" : "Play";

  return (
    <>
      <p className="visually-hidden" aria-live="polite" id="nowannounce">
        {announcement}
      </p>
      <div className={"nowbar" + (on ? " on" : "")} id="nowbar" data-status={status}>
        <div className="nowbar-inner">
          <button type="button" id="nowplay" aria-label={buttonLabel} onClick={togglePause}>
            {busy ? "❚❚" : "▶"}
          </button>
          <span className="nowname" id="nowname">
            {on ? nowBarLabel(status, track) : ""}
          </span>
          {on && (track.previewLabel || isPreviewTrack(track)) ? (
            <span className="nowpreview">{track.previewLabel || PREVIEW_LABEL}</span>
          ) : null}
          <input
            type="range"
            id="nowseek"
            min="0"
            max="1000"
            value={pos}
            onChange={onSeek}
            aria-label="Seek within track"
          />
          <span className="nowtime" id="nowtime">
            {time}
          </span>
          <button
            type="button"
            className="nowclose"
            aria-label="Close player"
            title="Close player"
            onClick={close}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
