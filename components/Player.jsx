"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* React port of player.js: one shared <audio>, play buttons on each track row,
   and a sticky now-playing bar with a seek control. No accounts, no autoplay. */

const PlayerContext = createContext(null);

function fmt(s) {
  if (!isFinite(s)) return "0:00";
  var m = Math.floor(s / 60),
    r = Math.floor(s % 60);
  return m + ":" + (r < 10 ? "0" : "") + r;
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const currentRef = useRef(null); /* {src, name} | null */
  const playlistRef = useRef(null); /* [{src, name, time}] | null */
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.addEventListener("play", () => setPlaying(true));
      audio.addEventListener("pause", () => setPlaying(false));
      audio.addEventListener("ended", () => {
        /* step to the next track in the same list, if there is one */
        const cur = currentRef.current;
        const list = playlistRef.current;
        if (!cur || !list) return;
        for (var i = 0; i < list.length; i++) {
          if (list[i].src === cur.src && list[i + 1]) {
            const next = list[i + 1];
            currentRef.current = { src: next.src, name: next.name };
            setCurrent(currentRef.current);
            audio.src = next.src;
            audio.play();
            return;
          }
        }
      });
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const toggle = useCallback(
    (track, playlist) => {
      const audio = getAudio();
      if (currentRef.current && currentRef.current.src === track.src) {
        if (audio.paused) audio.play();
        else audio.pause();
        return;
      }
      playlistRef.current = playlist;
      currentRef.current = { src: track.src, name: track.name };
      setCurrent(currentRef.current);
      audio.src = track.src;
      audio.play();
    },
    [getAudio]
  );

  const togglePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentRef.current) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }, []);

  return (
    <PlayerContext.Provider value={{ current, playing, toggle, togglePause, audioRef }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}

export function NowBar() {
  const { current, playing, togglePause, audioRef } = usePlayer();
  const [pos, setPos] = useState(0);
  const [timeText, setTimeText] = useState("0:00 / 0:00");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    function onTimeUpdate() {
      if (audio.duration) setPos((audio.currentTime / audio.duration) * 1000);
      setTimeText(fmt(audio.currentTime) + " / " + fmt(audio.duration));
    }
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [audioRef, current]);

  function onSeek(e) {
    const value = Number(e.target.value);
    setPos(value);
    const audio = audioRef.current;
    if (audio && audio.duration) audio.currentTime = (value / 1000) * audio.duration;
  }

  return (
    <div className={"nowbar" + (current ? " on" : "")} id="nowbar">
      <div className="wrap">
        <button
          type="button"
          id="nowplay"
          aria-label={playing ? "Pause" : "Play"}
          onClick={togglePause}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <span className="nowname" id="nowname">
          {current ? current.name : ""}
        </span>
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
          {timeText}
        </span>
      </div>
    </div>
  );
}
