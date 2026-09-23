"use client";

import CommentLink from "./CommentLink";
import { useState } from "react";
import { usePlayer } from "./Player";

export default function Album({ id, title, meta, cover, coverAlt, tracks }) {
  const [open, setOpen] = useState(false);
  const [downloadState, setDownloadState] = useState("idle");
  const { current, playing, toggle } = usePlayer();

  async function downloadAlbum() {
    if (downloadState === "preparing") return;
    setDownloadState("preparing");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      await Promise.all(tracks.map(async (track, index) => {
        const response = await fetch(track.src);
        if (!response.ok) throw new Error(`Could not download ${track.name}`);
        const blob = await response.blob();
        const number = String(index + 1).padStart(2, "0");
        const safeName = track.name.replace(/[\\/:*?"<>|]/g, "");
        zip.file(`${number} - ${safeName}.mp3`, blob);
      }));
      const archive = await zip.generateAsync({ type: "blob", compression: "STORE" });
      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/[\\/:*?"<>|]/g, "")} - Allen Gillon.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDownloadState("idle");
    } catch {
      setDownloadState("error");
    }
  }

  return (
    <article className={"album" + (open ? " open" : "")} id={id}>
      <button
        type="button"
        className="sleeve"
        aria-expanded={open ? "true" : "false"}
        aria-controls={"trk-" + id}
        onClick={() => setOpen(!open)}
      >
        <span className="disc" aria-hidden="true"></span>
        <img src={cover} alt={coverAlt} loading="lazy" />
      </button>
      <h3>{title}</h3>
      <p className="meta">{meta}</p>
      <button
        type="button"
        className="btn album-download-button"
        onClick={downloadAlbum}
        disabled={downloadState === "preparing"}
      >
        {downloadState === "preparing" ? "Preparing album…" : downloadState === "error" ? "Try album download again" : "Download album free"}
      </button>
      <button type="button" className="tracklist-toggle" aria-expanded={open ? "true" : "false"} aria-controls={"trk-" + id} onClick={() => setOpen(!open)}>
        {open ? "Hide tracks" : "View tracks"}
      </button>
      <div className="trkpanel" id={"trk-" + id} hidden={!open}>
        <ol className="trklist">
          {tracks.map((track) => {
            const isCurrent = current && current.src === track.src;
            const isCurrentAndPlaying = isCurrent && playing;
            return (
              <li key={track.src}>
                <button
                  type="button"
                  className={"tplay" + (isCurrentAndPlaying ? " playing" : "")}
                  onClick={() => toggle(track, tracks)}
                  aria-label={(isCurrentAndPlaying ? "Pause " : "Play ") + track.name}
                >
                  {isCurrentAndPlaying ? "❚❚" : "▶"}
                </button>
                <span className="tname">{track.name}</span>
                <span className="ttime">{track.time}</span>
                <details className="more-menu track-more">
                  <summary aria-label={`More options for ${track.name}`}><span aria-hidden="true">⋯</span></summary>
                  <div className="more-popover">
                    <a href={track.src} download>Download song</a>
                    <CommentLink subject={`${track.name} (${title})`} returnTo={`/music#${id}`} returnLabel={title}>Comment</CommentLink>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </div>
    </article>
  );
}
