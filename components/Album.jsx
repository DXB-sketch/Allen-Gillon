"use client";

import { Fragment, useEffect, useState } from "react";
import { usePlayer } from "./Player";
import { PREVIEW_LABEL, isPreviewTrack } from "../lib/player-state.mjs";

/* The albums shelf on /music (W5).

   - The sleeve is the only toggle: a <button> named "Show tracks for <album>"
     with aria-expanded and aria-controls. One album is open at a time, like
     pulling one record off the shelf.
   - The open panel holds the album's one primary action, "Download album
     free", and the track rows: play, title, time and a download link.
     Albums are free: no Payment Link is ever rendered here.
   - The record slides out while the album is open or its track is loaded,
     and turns only while that album's status is "playing" (paused keeps it
     still where it stopped).

   Layout (app/(main)/music/music.css): from 1024px each album wrapper is
   display:contents inside a grid (so the fragment id lives on the sleeve), so its sleeve, title and meta sit in its
   own column (--col) and the open panel spans the whole shelf underneath.
   Below that, the panel follows its own album. */

const OPEN_STATUSES = new Set(["loading", "playing", "paused"]);

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="ticon ticon-play">
      <path d="M8.6 5.4C8.1 5.1 7.5 5.5 7.5 6.1L7.7 18C7.7 18.6 8.3 18.9 8.8 18.6L18.3 12.7C18.8 12.4 18.8 11.7 18.3 11.4Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="ticon ticon-pause">
      <path d="M8.9 6.1C9 10 9.1 14 9.2 17.9M15.1 6C15 10 14.9 14 14.9 18" />
    </svg>
  );
}

/* Hand-drawn: an arrow dropping into an open tray. */
function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="ticon ticon-download">
      <path d="M12.2 3.4C12 7.2 12.1 10.8 11.9 14.7" />
      <path d="M7.4 10.3C9.1 11.9 10.5 13.3 11.9 14.9C13.4 13.3 14.8 11.8 16.7 10.1" />
      <path d="M4.1 14.4C4.3 16.4 4.2 18.3 4.5 20.1C9.6 20.4 14.4 20.3 19.6 19.9C19.8 18.1 19.7 16.3 19.9 14.3" />
    </svg>
  );
}

function runningTime(tracks) {
  const seconds = tracks.reduce((sum, t) => {
    const [m, s] = String(t.time).split(":").map(Number);
    return sum + (m || 0) * 60 + (s || 0);
  }, 0);
  return `${Math.round(seconds / 60)} min`;
}

function safeName(text) {
  return text.replace(/[\\/:*?"<>|]/g, "");
}

function Album({ index, id, title, meta, cover, shelfCover, note, tracks, open, onToggle }) {
  const [downloadState, setDownloadState] = useState("idle");
  const { track, status, toggle } = usePlayer();
  const holdsTrack = Boolean(track) && tracks.some((t) => t.src === track.src);
  const albumStatus = holdsTrack ? status : "idle";

  async function downloadAlbum() {
    if (downloadState === "preparing") return;
    setDownloadState("preparing");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      await Promise.all(
        tracks.map(async (t, i) => {
          const response = await fetch(t.src);
          if (!response.ok) throw new Error(`Could not download ${t.name}`);
          const blob = await response.blob();
          zip.file(`${String(i + 1).padStart(2, "0")} - ${safeName(t.name)}.mp3`, blob);
        })
      );
      const archive = await zip.generateAsync({ type: "blob", compression: "STORE" });
      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeName(title)} - Allen Gillon.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDownloadState("done");
    } catch {
      setDownloadState("error");
    }
  }

  const classes = ["album"];
  if (open) classes.push("open");
  if (OPEN_STATUSES.has(albumStatus)) classes.push("is-loaded");
  if (albumStatus === "playing") classes.push("is-playing");

  const downloadLabel =
    downloadState === "preparing"
      ? "Preparing the album…"
      : downloadState === "error"
        ? "Try the album download again"
        : "Download album free";
  const downloadStatus =
    downloadState === "preparing"
      ? `Preparing ${title}. This can take a minute.`
      : downloadState === "error"
        ? `Couldn't prepare ${title}. Please try again.`
        : downloadState === "done"
          ? `${title} is downloading.`
          : "";

  return (
    <div className={classes.join(" ")} style={{ "--col": index + 1 }}>
      <h2 className="album-title" id={`title-${id}`}>
        {title}
      </h2>
      <p className="meta">
        {[...meta.split(" · "), runningTime(tracks)].map((part) => (
          <Fragment key={part}>
            <span className="meta-part">{part} ·</span>{" "}
          </Fragment>
        ))}
        <span className="meta-part meta-free">Free</span>
      </p>
      {/* The fragment id (/music#misty) is on the sleeve, not the wrapper:
          from 1024px the wrapper is display:contents and has no box to
          scroll to. */}
      <button
        type="button"
        id={id}
        className="sleeve"
        aria-expanded={open ? "true" : "false"}
        aria-controls={`trk-${id}`}
        onClick={onToggle}
      >
        <span className="disc" aria-hidden="true"></span>
        {/* The first sleeve is the page's LCP image (preloaded by the page);
            the other sleeves load lazily. */}
        <img
          src={shelfCover || cover}
          alt=""
          width="720"
          height="720"
          decoding="async"
          loading={index === 0 ? undefined : "lazy"}
          fetchPriority={index === 0 ? "high" : undefined}
        />
        <span className="visually-hidden">Show tracks for {title}</span>
      </button>
      <section className="trkpanel" id={`trk-${id}`} hidden={!open} aria-labelledby={`title-${id}`}>
        <div className="trkpanel-lead">
          {/* A visual echo of the open album's name for the wide shelf, where
              the panel sits under all four sleeves. The heading above names
              the panel for assistive tech, so this copy is hidden from it. */}
          <p className="trkpanel-name script" aria-hidden="true">
            {title}
          </p>
          <button
            type="button"
            className="btn album-download-button"
            onClick={downloadAlbum}
            aria-disabled={downloadState === "preparing" ? "true" : undefined}
          >
            {downloadLabel}
          </button>
          <p className="album-download-status" role="status">
            {downloadStatus}
          </p>
          {note ? <p className="album-note">{note}</p> : null}
        </div>
        <ol className="trklist">
          {tracks.map((t) => {
            const isThis = Boolean(track) && track.src === t.src;
            const busy = isThis && (status === "playing" || status === "loading");
            const preview = isPreviewTrack(t);
            return (
              <li key={t.src} className={isThis ? "is-current" : undefined}>
                <button
                  type="button"
                  className={"tplay" + (busy ? " playing" : "")}
                  onClick={() => toggle({ album: title, artwork: cover, ...t }, tracks)}
                  aria-label={(busy ? "Pause " : "Play ") + t.name + (preview ? `, ${PREVIEW_LABEL}` : "")}
                >
                  {busy ? <PauseIcon /> : <PlayIcon />}
                </button>
                <span className="tname">{t.name}</span>
                <span className="ttime">
                  {preview ? <span className="tpreview">{PREVIEW_LABEL}</span> : null}
                  {t.time}
                </span>
                <a className="track-download" href={t.src} download aria-label={`Download ${t.name}`} title="Download this song">
                  <DownloadIcon />
                </a>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

export default function AlbumShelf({ albums }) {
  const [openId, setOpenId] = useState(null);
  // A link to /music#<album> (the Timeless "Misty" link, schema and share
  // URLs) opens that album as well as scrolling to its sleeve.
  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (albums.some((a) => a.id === id)) setOpenId(id);
    };
    openFromHash();
    addEventListener("hashchange", openFromHash);
    return () => removeEventListener("hashchange", openFromHash);
  }, [albums]);
  return (
    <div className="albums" style={{ "--count": albums.length }}>
      {albums.map((album, index) => (
        <Album
          key={album.id}
          index={index}
          {...album}
          open={openId === album.id}
          onToggle={() => setOpenId((prev) => (prev === album.id ? null : album.id))}
        />
      ))}
    </div>
  );
}
