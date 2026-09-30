// A stand-in for components/Player.jsx in tests/reader-dom.test.mjs.
// The test drives the "shared player" through `player` below and reads back
// what the reader asked it to do in `player.calls`.
import { useSyncExternalStore } from "react";

const listeners = new Set();
const audio = new EventTarget();
audio.currentTime = 0;

export const player = {
  track: null,
  status: "idle",
  audio,
  calls: [],
  version: 0,
  set(patch) {
    Object.assign(this, patch);
    this.version += 1;
    listeners.forEach((fn) => fn());
  },
  reset() {
    this.calls = [];
    audio.currentTime = 0;
    this.set({ track: null, status: "idle" });
  },
  /** Moves the playhead and fires the events a real <audio> would. */
  timeTo(seconds) {
    audio.currentTime = seconds;
    audio.dispatchEvent(new Event("seeking"));
    audio.dispatchEvent(new Event("timeupdate"));
  },
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function usePlayer() {
  useSyncExternalStore(subscribe, () => player.version, () => player.version);
  return {
    track: player.track,
    current: player.status === "playing" ? player.track : null,
    status: player.status,
    playing: player.status === "playing",
    audioRef: { current: audio },
    togglePause: () => player.calls.push({ type: "togglePause" }),
    toggle: (track) => player.calls.push({ type: "toggle", src: track.src }),
    seek: (time) => player.calls.push({ type: "seek", time }),
    playAt: (track, time) => player.calls.push({ type: "playAt", src: track.src, time }),
  };
}
