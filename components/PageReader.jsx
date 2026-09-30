"use client";

import { useEffect, useState } from "react";

/* "Listen to this page", first-load part. It renders the same button the
   reader shows when idle and loads the real reader (PageReaderControls, with
   the text extraction and voice handling) only when the button is pressed,
   so none of that is in any page's first-load JavaScript (docs/PERFORMANCE.md).

   Props:
     voice  "male" | "female": the preferred narrator for the site (set by
            components/SiteChrome.jsx: main "male", other "female"). */
export default function PageReader({ voice = "female" }) {
  const [supported, setSupported] = useState(true);
  const [Controls, setControls] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) setSupported(false);
  }, []);

  if (!supported) return null;
  if (Controls) return <Controls voice={voice} autoStart />;

  function load() {
    if (loading) return;
    setLoading(true);
    import("./PageReaderControls")
      .then((mod) => setControls(() => mod.default))
      .catch(() => setLoading(false));
  }

  return (
    <div className="page-reader" role="group" aria-label="Page reader">
      <button type="button" className="page-reader-listen" onClick={load} aria-busy={loading ? "true" : undefined}>
        Listen to this page
      </button>
    </div>
  );
}
