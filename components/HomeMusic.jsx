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
     reader speaks and fades back up when the reader stops or finishes.
   - Playing an album track (the shared player) fades it out straight away.
   - The Pause/Play music button is the WCAG 1.4.2 control for audio that
     starts by itself. Pausing is remembered on this device, so the music
     does not start again on the next visit until Play music is pressed.

   SRC is a prepared copy of the track (made with ffmpeg from the album
   file): it starts at 0:26, where the higher notes come in, is 12 dB
   quieter and fades in over 3 s. So there is no seek on start, and the
   music is soft even where audio.volume is ignored (iPhone and iPad).
   A plain media element, not Web Audio: Safari could play a Web Audio
   routed element twice, slightly apart, which sounded like two pieces at
   once. Only one copy ever plays (`current` below). */

const SRC = "/audio/home/one-day-i-ll-fly-away-from-26s.mp3";
const VOLUME = 1; // the file itself is already soft
const UNDER_READER = 0.4; // while the page reader speaks
const FADE_IN = 3;
const FADE_OUT = 3;
const PLAYBACK_EVENT = "allen:playback-start";
const READER_SOURCE = "page-reader";
const READER_STOP_EVENT = "allen:reader-stop";
const OFF_KEY = "allen:home-music";

/* The one playing copy: a new mount stops any earlier one first. */
let current = null;

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
    current?.stop();
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = SRC;
    let fadeTimer = 0;
    let disposed = false;
    let readerActive = false;
    let starting = null;

    /* Ramp audio.volume to `target` over `seconds`, then run `done`. Where
       volume is fixed (iOS) the ramp changes nothing and `done` still runs. */
    function fadeTo(target, seconds, done) {
      clearTimeout(fadeTimer);
      const from = audio.volume;
      const steps = Math.max(1, Math.round(seconds * 20));
      let step = 0;
      const tick = () => {
        step += 1;
        audio.volume = Math.min(1, Math.max(0, from + ((target - from) * step) / steps));
        if (step < steps) fadeTimer = setTimeout(tick, 50);
        else if (done) done();
      };
      tick();
    }

    function play() {
      if (disposed) return Promise.resolve(false);
      if (!audio.paused) return Promise.resolve(true);
      if (starting) return starting;
      audio.volume = readerActive ? UNDER_READER : VOLUME;
      // play() is called straight away, inside the tap that allowed it;
      // Safari can refuse it once that tap's moment has passed.
      starting = audio
        .play()
        .then(() => {
          if (disposed) {
            audio.pause();
            return false;
          }
          setPlaying(true);
          return true;
        })
        .catch(() => false)
        .finally(() => {
          starting = null;
        });
      return starting;
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
        if (audio.ended) audio.currentTime = 0;
        play();
      },
      pause: () => {
        remember(true);
        removeGestureListeners();
        fadeOutAndPause(0.6);
      },
    };

    const onEnded = () => setPlaying(false);
    const onPause = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);

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

    /* The reader speaks over it, quieter, and the music comes back up when
       the reader stops or finishes; another player fades it out. */
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
      if (!audio.paused) fadeTo(VOLUME, FADE_IN);
    };
    window.addEventListener(PLAYBACK_EVENT, onPlayback);
    window.addEventListener(READER_STOP_EVENT, onReaderStop);

    function stop() {
      disposed = true;
      clearTimeout(fadeTimer);
      removeGestureListeners();
      window.removeEventListener(PLAYBACK_EVENT, onPlayback);
      window.removeEventListener(READER_STOP_EVENT, onReaderStop);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      sound.current = null;
      if (current?.stop === stop) current = null;
    }
    current = { stop };

    if (!rememberedOff() && !otherAudioPlaying(audio)) {
      play().then((ok) => {
        if (!ok && !disposed) gestureTypes.forEach((type) => window.addEventListener(type, onGesture, true));
      });
    }

    return stop;
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
