"use client";

import { useEffect, useState } from "react";
import Audiobook from "./Audiobook";
import BookReader from "./BookReader";
import { usePlayer } from "./Player";

export default function SyncedStoryReader({ manifest, audioSrc, pageCues }) {
  const { current, audioRef } = usePlayer();
  const [followPage, setFollowPage] = useState(0);
  const isCurrentStory = current?.src === audioSrc;

  useEffect(() => {
    if (!isCurrentStory) return;
    const audio = audioRef.current;
    if (!audio) return;

    const syncPage = () => {
      let page = 0;
      for (let index = 1; index < pageCues.length; index += 1) {
        if (audio.currentTime < pageCues[index]) break;
        page = index;
      }
      setFollowPage(page);
    };

    syncPage();
    audio.addEventListener("timeupdate", syncPage);
    audio.addEventListener("seeking", syncPage);
    audio.addEventListener("loadedmetadata", syncPage);
    return () => {
      audio.removeEventListener("timeupdate", syncPage);
      audio.removeEventListener("seeking", syncPage);
      audio.removeEventListener("loadedmetadata", syncPage);
    };
  }, [audioRef, isCurrentStory, pageCues]);

  return (
    <>
      <div className="reading-audio">
        <Audiobook title={manifest.title} src={audioSrc} />
        <p className="reading-audio-note" aria-live="polite">
          {isCurrentStory
            ? `Following the narration on page ${followPage + 1}`
            : "The pages will follow the narration."}
        </p>
      </div>
      <BookReader manifest={manifest} followPage={isCurrentStory ? followPage : null} />
    </>
  );
}
