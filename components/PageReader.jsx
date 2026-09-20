"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

function pageText() {
  const main = document.querySelector("main");
  if (!main) return [];
  return [...main.querySelectorAll("h1,h2,h3,h4,p,li")]
    .filter((node) => !node.closest("nav,button,form,[aria-hidden='true'],[data-reader-skip],.bkr,.trklist,.artgrid") &&
      ![...node.children].some((child) => child.matches?.("h1,h2,h3,h4,p,li")))
    .map((node) => node.innerText.trim())
    .filter(Boolean);
}

function preferredVoice(voices) {
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const score = (voice) =>
    (/natural|neural|enhanced|premium|online/i.test(voice.name) ? 10 : 0) +
    (/en-AU/i.test(voice.lang) ? 3 : 0) +
    (/google|microsoft|apple/i.test(voice.name) ? 1 : 0);
  return english.sort((a, b) => score(b) - score(a))[0] || voices[0];
}

export default function PageReader() {
  const pathname = usePathname();
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState("idle");
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const run = useRef(0);

  useEffect(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setSupported(false);
      return;
    }
    const refresh = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available.filter((voice) => voice.lang.toLowerCase().startsWith("en")));
      setVoiceName((current) => current || preferredVoice(available)?.name || "");
    };
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", refresh);
  }, []);

  useEffect(() => {
    run.current += 1;
    window.speechSynthesis?.cancel();
    setStatus("idle");
    return () => { run.current += 1; window.speechSynthesis?.cancel(); };
  }, [pathname]);

  function stop() {
    run.current += 1;
    window.speechSynthesis.cancel();
    setStatus("idle");
  }

  function start() {
    const chunks = pageText();
    if (!chunks.length) return;
    stop();
    const currentRun = run.current;
    const voice = voices.find((item) => item.name === voiceName);
    let index = 0;
    setStatus("playing");
    const next = () => {
      if (currentRun !== run.current) return;
      if (index >= chunks.length) { setStatus("idle"); return; }
      const utterance = new SpeechSynthesisUtterance(chunks[index++]);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || "en-AU";
      utterance.rate = 0.95;
      utterance.onend = next;
      utterance.onerror = () => setStatus("idle");
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

  if (!supported) return null;
  return <div className="page-reader" aria-label="Page reader">
    <button type="button" onClick={start}>Read this page aloud</button>
    {status !== "idle" && <>
      <button type="button" onClick={togglePause}>{status === "paused" ? "Resume" : "Pause"}</button>
      <button type="button" onClick={stop}>Stop</button>
    </>}
    {voices.length > 1 && <label>Voice <select value={voiceName} onChange={(event) => setVoiceName(event.target.value)}>
      {voices.map((voice) => <option key={`${voice.name}-${voice.lang}`} value={voice.name}>{voice.name} ({voice.lang})</option>)}
    </select></label>}
  </div>;
}
