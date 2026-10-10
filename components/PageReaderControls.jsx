"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { pageText } from "../lib/page-text.mjs";
import { friendlyVoiceLabel, normaliseForSpeech, readerVoices } from "../lib/speech.mjs";

const PLAYBACK_EVENT = "allen:playback-start";
const READER_SOURCE = "page-reader";

/* The best woman's voice on this device (lib/speech.mjs readerVoices), or
   undefined, which leaves the device's default voice. */
function preferredVoice(voices) {
  return readerVoices(voices)[0];
}

/* "Listen to this page": reads the page aloud with the browser's own voices.

   Loaded on the first press of the button (components/PageReader.jsx), so
   it stays out of every page's first-load JavaScript. It then mounts with
   autoStart and starts reading straight away.

   Props:
     autoStart  start reading on mount (the press that loaded this module).

   Allen asked for the reader to only ever use a woman's voice, on both
   sites. The Voice list offers only the women's voices on the device. */
export default function PageReaderControls({ autoStart = false }) {
  const pathname = usePathname();
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState("idle");
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const run = useRef(0);
  const position = useRef(0);
  const group = useRef(null);
  const keepFocus = useRef(false);

  useEffect(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setSupported(false);
      return;
    }
    const refresh = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(readerVoices(available));
      setVoiceName(preferredVoice(available)?.name || "");
    };
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", refresh);
  }, []);

  const stop = useCallback(() => {
    run.current += 1;
    position.current = 0;
    window.speechSynthesis?.cancel();
    setStatus("idle");
  }, []);

  /* A new page stops the old page's reading. */
  useEffect(() => {
    stop();
    return () => { run.current += 1; window.speechSynthesis?.cancel(); };
  }, [pathname, stop]);

  useEffect(() => {
    const stopForAnotherReader = (event) => {
      if (event.detail?.source !== READER_SOURCE) stop();
    };
    window.addEventListener(PLAYBACK_EVENT, stopForAnotherReader);
    return () => window.removeEventListener(PLAYBACK_EVENT, stopForAnotherReader);
  }, [stop]);

  function speakFrom(startIndex, name = voiceName) {
    const chunks = pageText(document.querySelector("main"));
    if (!chunks.length) return;
    run.current += 1;
    window.speechSynthesis.cancel();
    window.dispatchEvent(new CustomEvent(PLAYBACK_EVENT, { detail: { source: READER_SOURCE } }));
    const currentRun = run.current;
    // Voices can still be loading on the very first press (autoStart).
    const pool = voices.length ? voices : readerVoices(window.speechSynthesis.getVoices());
    const chosen = pool.find((item) => item.name === name);
    let index = Math.min(startIndex, chunks.length - 1);
    setStatus("playing");
    const next = () => {
      if (currentRun !== run.current) return;
      if (index >= chunks.length) { position.current = 0; setStatus("idle"); return; }
      position.current = index;
      const utterance = new SpeechSynthesisUtterance(normaliseForSpeech(chunks[index++]));
      if (chosen) utterance.voice = chosen;
      utterance.lang = chosen?.lang || "en-AU";
      utterance.rate = 0.95;
      utterance.onend = next;
      utterance.onerror = () => { if (currentRun === run.current) setStatus("idle"); };
      window.speechSynthesis.speak(utterance);
    };
    next();
  }

  function togglePause() {
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
    } else {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  }

  function changeVoice(name) {
    setVoiceName(name);
    /* Carry on from the same block in the new voice. */
    if (status !== "idle") speakFrom(position.current, name);
  }

  const active = status !== "idle";

  /* Tell the page the reader has stopped or finished (the home page music
     fades out on it: components/HomeMusic.jsx). */
  const wasActive = useRef(false);
  useEffect(() => {
    if (wasActive.current && !active) window.dispatchEvent(new CustomEvent("allen:reader-stop"));
    wasActive.current = active;
  }, [active]);

  /* The pressed button is swapped for another set of controls, so keep focus
     inside the reader rather than dropping it on the page body. */
  useEffect(() => {
    if (!keepFocus.current) return;
    keepFocus.current = false;
    group.current?.querySelector("button")?.focus();
  }, [active]);

  /* The press that loaded this module: start reading now. Declared after
     the pathname effect (whose stop() also runs on mount) and the focus
     effect (so focus moves to Pause once reading starts). */
  useEffect(() => {
    if (!autoStart || !("speechSynthesis" in window)) return;
    keepFocus.current = true;
    speakFrom(0, preferredVoice(window.speechSynthesis.getVoices())?.name || "");
    // Once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!supported) return null;
  const seen = new Map();
  const voiceLabels = voices.map((item) => {
    const label = friendlyVoiceLabel(item);
    const count = (seen.get(label) || 0) + 1;
    seen.set(label, count);
    return count > 1 ? `${label} ${count}` : label;
  });
  return <div ref={group} className={"page-reader" + (active ? " active" : "")} role="group" aria-label="Page reader">
    {active ? <>
      <button type="button" onClick={togglePause}>{status === "paused" ? "Resume" : "Pause"}</button>
      <button type="button" onClick={() => { keepFocus.current = true; stop(); }}>Stop</button>
      {voices.length > 1 && <label>Voice <select value={voiceName} onChange={(event) => changeVoice(event.target.value)}>
        {voices.map((item, index) => <option key={`${item.name}-${item.lang}`} value={item.name}>{voiceLabels[index]}</option>)}
      </select></label>}
    </> : <button type="button" className="page-reader-listen" onClick={() => { keepFocus.current = true; speakFrom(0); }}>Listen to this page</button>}
  </div>;
}
