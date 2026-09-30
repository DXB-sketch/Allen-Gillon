"use client";

import { createContext, useContext, useEffect, useState } from "react";

/* Lets a section's layout choose the page reader's narrator without the
   reader matching pathnames. The root layout wraps the site in
   <ReaderVoiceProvider>; a nested layout renders <ReaderVoice voice="female" />
   and the choice lasts while that layout is mounted.

   Interim until W2 adds the (main) and (other) route-group layouts, which can
   pass the voice to <PageReader voice="..."> directly. */

const ReaderVoiceContext = createContext(null);

export function ReaderVoiceProvider({ children }) {
  const [voice, setVoice] = useState(null);
  return <ReaderVoiceContext.Provider value={{ voice, setVoice }}>{children}</ReaderVoiceContext.Provider>;
}

/* The voice a nested layout asked for, or null. */
export function useReaderVoiceOverride() {
  return useContext(ReaderVoiceContext)?.voice || null;
}

export function ReaderVoice({ voice }) {
  const setVoice = useContext(ReaderVoiceContext)?.setVoice;
  useEffect(() => {
    if (!setVoice) return undefined;
    setVoice(voice);
    return () => setVoice(null);
  }, [setVoice, voice]);
  return null;
}
