"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

// How many pages either side of the current one get a real <img>.
const WINDOW = 2;

export default function BookReader({ manifest }) {
  const {
    slug,
    pageCount,
    aspect,
    hasDownload,
    title,
    contentStartPage = 1,
    largePages = false,
    sharedCover = null,
  } = manifest;
  const [w, h] = aspect;
  const contentStartIndex = Math.min(Math.max(contentStartPage - 1, 0), pageCount - 1);
  const readablePageCount = pageCount - contentStartIndex;
  const bookRef = useRef(null);
  const [current, setCurrent] = useState(contentStartIndex);
  const [mounted, setMounted] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [jump, setJump] = useState("");

  useEffect(() => {
    setMounted(true);
    const narrow = window.matchMedia("(max-width: 820px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onNarrow = () => setPortrait(narrow.matches);
    const onMotion = () => setReduceMotion(motion.matches);
    onNarrow();
    onMotion();
    narrow.addEventListener("change", onNarrow);
    motion.addEventListener("change", onMotion);
    return () => {
      narrow.removeEventListener("change", onNarrow);
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  // Prefetch the pages just outside the mounted window as the reader turns.
  useEffect(() => {
    if (!mounted) return;
    for (let i = current - WINDOW - 1; i <= current + WINDOW + 1; i++) {
      if (i >= 0 && i < pageCount) {
        const img = new window.Image();
        img.src = `/books/${slug}/p${String(i + 1).padStart(3, "0")}.webp`;
      }
    }
  }, [mounted, current, pageCount, slug]);

  const flip = useCallback((dir) => {
    if (largePages) {
      setCurrent((page) => Math.min(Math.max(page + dir, 0), pageCount - 1));
      return;
    }
    const api = bookRef.current?.pageFlip?.();
    if (!api) return;
    if (dir > 0) api.flipNext();
    else api.flipPrev();
  }, [largePages, pageCount]);

  const openPhysicalPage = useCallback((page) => {
    const target = Math.min(Math.max(page, 0), pageCount - 1);
    if (largePages) setCurrent(target);
    else {
      const api = bookRef.current?.pageFlip?.();
      if (api) api.flip(target);
    }
  }, [largePages, pageCount]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); flip(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); flip(-1); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [flip]);

  const onFlip = useCallback((e) => setCurrent(e.data), []);

  const goToPage = useCallback((e) => {
    e.preventDefault();
    const n = parseInt(jump, 10);
    if (Number.isNaN(n)) return;
    const target = contentStartIndex + Math.min(Math.max(n, 1), readablePageCount) - 1;
    openPhysicalPage(target);
    setJump("");
  }, [contentStartIndex, jump, openPhysicalPage, readablePageCount]);

  // Pages: cover plus anything near the current spread get a real image;
  // everything else is a paper-coloured placeholder at the same aspect.
  const pages = useMemo(() => {
    const out = [];
    for (let i = 0; i < pageCount; i++) {
      const near = i === 0 || Math.abs(i - current) <= WINDOW;
      const n = String(i + 1).padStart(3, "0");
      out.push(
        <div className="bkr-page" key={i}>
          {near ? (
            <img
              src={`/books/${slug}/p${n}.webp`}
              alt={`Page ${i + 1} of ${title}`}
              width={w}
              height={h}
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
            />
          ) : null}
        </div>
      );
    }
    return out;
  }, [pageCount, current, slug, title, w, h]);

  const imageNumber = String(current + 1).padStart(3, "0");
  const counter = current < contentStartIndex
    ? `Introduction ${current + 1} / ${contentStartIndex}`
    : `Page ${current - contentStartIndex + 1} / ${readablePageCount}`;

  return (
    <div className={"bkr" + (largePages ? " bkr-large-pages" : "")}>
      {sharedCover ? (
        <figure className="bkr-shared-cover">
          <img src={sharedCover} width="1080" height="607" alt="The Chinese Chimes together" />
          <figcaption>The Chinese Chimes</figcaption>
        </figure>
      ) : null}
      <div className="bkr-stage">
        {mounted && largePages ? (
          <div className="bkr-single-page" style={{ aspectRatio: `${w} / ${h}` }}>
            <img
              src={`/books/${slug}/p${imageNumber}.webp`}
              alt={`Page ${current + 1} of ${title}`}
              width={w}
              height={h}
              decoding="async"
            />
          </div>
        ) : mounted ? (
          <HTMLFlipBook
            key={portrait ? "portrait" : "spread"}
            ref={bookRef}
            width={w}
            height={h}
            size="stretch"
            minWidth={260}
            maxWidth={620}
            minHeight={Math.round((260 * h) / w)}
            maxHeight={Math.round((620 * h) / w)}
            showCover={true}
            usePortrait={true}
            mobileScrollSupport={true}
            flippingTime={reduceMotion ? 1 : 650}
            drawShadow={!reduceMotion}
            maxShadowOpacity={0.35}
            startPage={current}
            onFlip={onFlip}
            className="bkr-book"
          >
            {pages}
          </HTMLFlipBook>
        ) : (
          <div className="bkr-cover-wait" style={{ aspectRatio: `${w} / ${h}` }}>
            <img
              src={`/books/${slug}/p${String(contentStartIndex + 1).padStart(3, "0")}.webp`}
              alt={`Opening page of ${title}`}
              width={w}
              height={h}
              decoding="async"
            />
          </div>
        )}
      </div>

      <div className="bkr-controls">
        <button type="button" className="bkr-btn" onClick={() => flip(-1)} aria-label="Previous page">
          <span aria-hidden="true">&#8592;</span>
        </button>
        <span className="bkr-counter" aria-live="polite">
          {counter}
        </span>
        <button type="button" className="bkr-btn" onClick={() => flip(1)} aria-label="Next page">
          <span aria-hidden="true">&#8594;</span>
        </button>
        <form className="bkr-jump" onSubmit={goToPage} aria-label="Go to page">
          <label className="visually-hidden" htmlFor="bkr-jump-input">Page number</label>
          <input
            id="bkr-jump-input"
            type="number"
            inputMode="numeric"
            min="1"
            max={readablePageCount}
            placeholder="Page"
            value={jump}
            onChange={(e) => setJump(e.target.value)}
          />
          <button type="submit" aria-label="Open page">
            <span aria-hidden="true">&#8629;</span>
          </button>
        </form>
        {contentStartIndex > 0 ? (
          <button type="button" className="bkr-introduction" onClick={() => openPhysicalPage(0)}>
            Introduction
          </button>
        ) : null}
        {hasDownload ? (
          <a className="btn b bkr-download" href={`/books/${slug}/${slug}.pdf`} download>
            Download PDF
          </a>
        ) : null}
      </div>
    </div>
  );
}
