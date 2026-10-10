"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/* Background music on the main site's home page, as Allen asked: "One Day
   I'll Fly Away" (That's The Time, track 11) plays softly from where the
   higher notes come in and runs on to the song's own ending.

   - Browsers only allow sound after the visitor has touched the page, so it
     tries to start at once and otherwise starts on the first tap, click or
     key press anywhere.
   - The page reader can still read over it: the music drops lower while the
     reader speaks and fades out when the reader stops or finishes.
   - Playing an album track (the shared player) fades it out straight away.
   - The Pause/Play music button is the WCAG 1.4.2 control for audio that
     starts by itself. Pausing is remembered on this device, so the music
     does not start again on the next visit until Play music is pressed.

   Volume runs through a Web Audio gain node, because iOS ignores
   audio.volume; audio.volume is the fallback where Web Audio is missing. */

const SRC = "/audio/thats-the-time/11-one-day-i-ll-fly-away.mp3";
const START_AT = 26; // seconds: the higher notes come in here
const VOLUME = 0.25; // "lightly playing"
const UNDER_READER = 0.1; // while the page reader speaks
const FADE_IN = 3;
const FADE_OUT = 3;
const PLAYBACK_EVENT = "allen:playback-start";
const READER_SOURCE = "page-reader";
const READER_STOP_EVENT = "allen:reader-stop";
const OFF_KEY = "allen:home-music";

function rememberedOff() {
  try {
    return window.localStorage.getItem(OFF_KEY) === "off";
  } catch {
    return false;
  }
}

function remember(off) {
  try {
    if (off) window.localStorage.setItem(OFF_KEY, "off");
    else window.localStorage.removeItem(OFF_KEY);
  } catch {
    /* Private mode or blocked storage: just don't remember. */
  }
}

/* True while any other <audio> on the page (the album player) is playing. */
function otherAudioPlaying(own) {
  return [...document.querySelectorAll("audio")].some((el) => el !== own && !el.paused && !el.ended);
}

export default function HomeMusic({ site }) {
  const pathname = usePathname();
  const onHome = site === "main" && pathname === "/";
  return onHome ? <Music /> : null;
}

function Music() {
  const [playing, setPlaying] = useState(false);
  const button = useRef(null);
  const sound = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = SRC;
    let ctx = null;
    let gain = null;
    let fadeTimer = 0;
    let disposed = false;
    let started = false;
    let readerActive = false;

    function setupGraph() {
      if (ctx || !(window.AudioContext || window.webkitAudioContext)) return;
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        gain = ctx.createGain();
        gain.gain.value = 0;
        ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
      } catch {
        ctx = null;
        gain = null;
      }
    }

    /* Ramp the volume to `target` over `seconds`, then run `done`. */
    function fadeTo(target, seconds, done) {
      clearTimeout(fadeTimer);
      if (gain && ctx) {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(target, now + seconds);
      } else {
        const from = audio.volume;
        const steps = Math.max(1, Math.round(seconds * 20));
        let step = 0;
        const tick = () => {
          step += 1;
          audio.volume = Math.min(1, Math.max(0, from + ((target - from) * step) / steps));
          if (step < steps) fadeTimer = setTimeout(tick, 50);
        };
        tick();
      }
      if (done) fadeTimer = setTimeout(done, seconds * 1000 + 50);
    }

    function play() {
      if (disposed) return Promise.resolve(false);
      setupGraph();
      if (!gain) audio.volume = 0;
      if (!started && audio.currentTime < START_AT) {
        try {
          audio.currentTime = START_AT;
        } catch {
          /* Not seekable yet: loadedmetadata below moves it. */
        }
      }
      // play() is called straight away, inside the tap that allowed it;
      // Safari can refuse it once that tap's moment has passed.
      const playing = audio.play();
      const resumed = ctx && ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
      return Promise.all([playing, resumed])
        .then(() => {
          // An element that plays into a still-suspended context is silent.
          if (ctx && ctx.state !== "running") throw new Error("audio context suspended");
          started = true;
          setPlaying(true);
          fadeTo(readerActive ? UNDER_READER : VOLUME, FADE_IN);
          return true;
        })
        .catch(() => {
          audio.pause();
          return false;
        });
    }

    function fadeOutAndPause(seconds = FADE_OUT) {
      if (audio.paused) return;
      fadeTo(0, seconds, () => {
        audio.pause();
        setPlaying(false);
      });
    }

    sound.current = {
      play: () => {
        remember(false);
        removeGestureListeners();
        play();
      },
      pause: () => {
        remember(true);
        removeGestureListeners();
        fadeOutAndPause(0.6);
      },
    };

    const onMetadata = () => {
      if (!started && audio.currentTime < START_AT) audio.currentTime = START_AT;
    };
    const onEnded = () => setPlaying(false);
    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("ended", onEnded);

    /* First touch anywhere starts it (but not a press on the music button,
       which handles itself). */
    const gestureTypes = ["pointerdown", "keydown", "touchstart"];
    const onGesture = (event) => {
      if (button.current && button.current.contains(event.target)) return;
      if (otherAudioPlaying(audio)) {
        removeGestureListeners();
        return;
      }
      play().then((ok) => ok && removeGestureListeners());
    };
    function removeGestureListeners() {
      gestureTypes.forEach((type) => window.removeEventListener(type, onGesture, true));
    }

    /* The reader speaks over it, quieter; another player fades it out. */
    const onPlayback = (event) => {
      if (event.detail?.source === READER_SOURCE) {
        readerActive = true;
        if (!audio.paused) fadeTo(UNDER_READER, 1);
      } else {
        removeGestureListeners();
        fadeOutAndPause(1);
      }
    };
    const onReaderStop = () => {
      if (!readerActive) return;
      readerActive = false;
      removeGestureListeners();
      fadeOutAndPause();
    };
    window.addEventListener(PLAYBACK_EVENT, onPlayback);
    window.addEventListener(READER_STOP_EVENT, onReaderStop);

    if (!rememberedOff() && !otherAudioPlaying(audio)) {
      play().then((ok) => {
        if (!ok && !disposed) gestureTypes.forEach((type) => window.addEventListener(type, onGesture, true));
      });
    }

    return () => {
      disposed = true;
      clearTimeout(fadeTimer);
      removeGestureListeners();
      window.removeEventListener(PLAYBACK_EVENT, onPlayback);
      window.removeEventListener(READER_STOP_EVENT, onReaderStop);
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      ctx?.close?.().catch(() => {});
      sound.current = null;
    };
  }, []);

  return (
    <div className="page-reader home-music" role="group" aria-label="Background music">
      <button
        ref={button}
        type="button"
        onClick={() => (playing ? sound.current?.pause() : sound.current?.play())}
      >
        {playing ? "Pause music" : "Play music"}
      </button>
    </div>
  );
}
