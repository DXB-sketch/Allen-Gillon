"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { pageText } from "../lib/page-text.mjs";
import { friendlyVoiceLabel, normaliseForSpeech } from "../lib/speech.mjs";

const maleNames = /\b(james|david|mark|george|guy|ryan|william|daniel|thomas|liam|michael|alex|duncan|male)\b/i;
const femaleNames = /\b(catherine|zira|susan|hazel|samantha|karen|natasha|jenny|aria|sara|michelle|sonia|libby|female)\b/i;
const PLAYBACK_EVENT = "allen:playback-start";
const READER_SOURCE = "page-reader";

function preferredVoice(voices, gender) {
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const score = (voice) =>
    (gender === "male" && maleNames.test(voice.name) ? 20 : 0) +
    (gender === "female" && femaleNames.test(voice.name) ? 20 : 0) +
    (/natural|neural|enhanced|premium|online/i.test(voice.name) ? 10 : 0) +
    (/en-AU/i.test(voice.lang) ? 3 : 0) +
    (/google|microsoft|apple/i.test(voice.name) ? 1 : 0);
  return [...english].sort((a, b) => score(b) - score(a))[0] || voices[0];
}

/* "Listen to this page": reads the page aloud with the browser's own voices.

   Props:
     voice  "male" | "female" (default "female"). The preferred narrator for
            the site the page belongs to. Each site's layout sets it: the
            music and bookings site (allengillon.com) passes "male", the
            stories, Timeless and Ann's art site passes "female". The listener
            can still pick another voice once playback starts. */
export default function PageReader({ voice: preferredGender = "female" }) {
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
      setVoices(available.filter((item) => item.lang.toLowerCase().startsWith("en")));
      setVoiceName(preferredVoice(available, preferredGender)?.name || "");
    };
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", refresh);
  }, [preferredGender]);

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
    const chosen = voices.find((item) => item.name === name);
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

  /* The pressed button is swapped for another set of controls, so keep focus
     inside the reader rather than dropping it on the page body. */
  useEffect(() => {
    if (!keepFocus.current) return;
    keepFocus.current = false;
    group.current?.querySelector("button")?.focus();
  }, [active]);

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
