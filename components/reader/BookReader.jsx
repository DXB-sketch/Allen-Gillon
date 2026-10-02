"use client";

/* One flip-book reader for every /read/[slug]: stories, plays and textbooks.

   - react-pageflip draws the page turn. The book is sized from a
     ResizeObserver: it uses the width available but never grows taller than
     the window, and is rebuilt (on the same page) when that size changes.
   - Portrait pages show as a two-page spread on wide screens; 16:9 and square
     pages (layout "single"), and every title on narrow screens, turn one page
     at a time.
   - The cover opens once, to the first content page, when the book first
     comes into view (a play preview opens on page 2 when its script starts
     too near the end of the preview: see openIndex). Under reduced motion
     every turn is instant.
   - Keyboard shortcuts (arrows, Home, End, Page Up, Page Down) work only while
     focus is inside the reader's region.
   - Without JavaScript, or before the page-flip code loads, the reader shows
     the current page as a plain image and the buttons still turn pages.
   - Plays show pages 1 to previewPages, then an "end of the preview" page
     with the Buy link and a stage-curtain drawing.
   - The toolbar is as wide as the book (--book-w), so it sits over it.
   - Auto-turn with the narration follows lib/reader-follow.mjs exactly: it is
     always on for a story with signed-off cues, and the book goes to the
     narrated page each time the narration reaches a new page. */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePlayer } from "../Player";
import PurchaseLink from "../PurchaseLink";
import TwoInk from "../illustrations/TwoInk";
import StageCurtain from "./StageCurtain";
import { audiobookTrack } from "../Audiobook";
import { fitBook, visiblePages, numbering, counterText, openIndex, pageHeading, PORTRAIT_RATIO } from "../../lib/reader-pages.mjs";
import { followAvailable, followStep, isFollowing, listenAction, narratedPage, TURN_LEAD } from "../../lib/reader-follow.mjs";
import { paragraphs } from "../../lib/book-text.mjs";
import { pageSrcSet, READER_PAGE_SIZES } from "../../lib/books.mjs";

const NEAR = 3; /* pages either side of the spread that get a real image */
const TURN_MS = 700;
const pad3 = (n) => String(n).padStart(3, "0");
const pageSrc = (slug, index) => `/books/${slug}/p${pad3(index + 1)}.webp`;
const aud = (cents) => `A$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;
const megabytes = (bytes) => `${Math.max(1, Math.round(bytes / (1024 * 1024)))} MB`;

function Arrow({ dir }) {
  return (
    <TwoInk viewBox="0 0 40 40" className="bkr-arrow" offset={1.6}>
      {dir < 0 ? (
        <>
          <path d="M31 20.5C24 19.6 15.5 20.2 8.5 20" />
          <path d="M16.5 11.5C13.4 14.6 11 17.4 8.5 20C11.2 22.6 13.6 25.4 16.8 28.6" />
        </>
      ) : (
        <>
          <path d="M9 19.5C16 20.4 24.5 19.8 31.5 20" />
          <path d="M23.5 11.5C26.6 14.6 29 17.4 31.5 20C28.8 22.6 26.4 25.4 23.2 28.6" />
        </>
      )}
    </TwoInk>
  );
}

/* Play and pause, drawn (a text glyph would turn into a colour emoji on some phones). */
function ListenIcon({ playing }) {
  return (
    <TwoInk viewBox="0 0 24 24" className="bkr-listen-glyph" offset={1}>
      {playing ? (
        <path d="M8.5 6.5V17.5M15.5 6.5V17.5" />
      ) : (
        <path d="M9 6.2C12.6 8.1 15.4 10 18 12C15.4 14 12.6 15.9 9 17.8C8.8 13.9 8.8 10.1 9 6.2Z" />
      )}
    </TwoInk>
  );
}

export default function BookReader({ book, pagesText = [], cues = null, verified = false, buyHref = "" }) {
  const { slug, title, section, shownPages, aspect, pageCount } = book;
  const isPlay = section === "plays";
  const total = shownPages + (isPlay ? 1 : 0); /* plays get an end-of-preview page */
  const startIndex = openIndex(book);
  const num = useMemo(() => numbering(book), [book]);
  const [w, h] = aspect || [3, 4];

  const regionId = useId();
  const goId = useId();
  const goInputId = useId();
  const wordsId = useId();

  /* ---------- player and follow state ---------- */
  const { track, status, audioRef, togglePause, seek, playAt } = usePlayer();
  const bookTrack = useMemo(
    () => (book.audio ? audiobookTrack({ title, src: book.audio.src, kind: book.audio.kind }).track : null),
    [book.audio, title]
  );
  const isThisBook = Boolean(bookTrack && track && track.src === bookTrack.src);
  const available = followAvailable({ cues, verified });
  const following = isFollowing({ available, isThisBook, status });
  /* The page being narrated as of the last step of following (null before
     the first). Kept through a pause, so a seek while paused still turns. */
  const lastNarratedRef = useRef(null);
  const [narrated, setNarrated] = useState(null);

  /* ---------- page state ---------- */
  const [index, setIndex] = useState(0);
  const [size, setSize] = useState(null);
  const [FlipBook, setFlipBook] = useState(null);
  const [reduced, setReduced] = useState(false);
  const [showWords, setShowWords] = useState(false);
  const [goOpen, setGoOpen] = useState(false);
  const [goValue, setGoValue] = useState("");

  const mode = size?.mode || "single";
  const visible = visiblePages(index, total, mode);

  const stageRef = useRef(null);
  const flipRef = useRef(null);
  const bookElRef = useRef(null);
  const goToggleRef = useRef(null);
  const indexRef = useRef(0);
  const visibleRef = useRef(visible);
  const reducedRef = useRef(false);
  const openedRef = useRef(startIndex === 0);
  visibleRef.current = visible;

  /* Reduced motion, and the page-flip code (client only). */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reducedRef.current = mq.matches;
      setReduced(mq.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    let alive = true;
    import("react-pageflip")
      .then((m) => alive && setFlipBook(() => m.default))
      .catch(() => {
        /* The plain image reader keeps working. */
      });
    return () => {
      alive = false;
      mq.removeEventListener("change", apply);
    };
  }, []);

  /* Size: the stage's width less the two turn buttons (on phones they sit
     under the book), and the window's height less room for the controls. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cs = getComputedStyle(el);
        const beside = cs.display === "flex";
        const gap = parseFloat(cs.columnGap) || 0;
        const width = el.clientWidth - (beside ? 2 * (56 + gap) : 0);
        /* Fit the toolbar, the book and the counter row in one window. */
        const region = el.closest(".bkr-region");
        const above = region ? Math.max(0, el.getBoundingClientRect().top - region.getBoundingClientRect().top) : 60;
        const below = beside ? 76 : 136; /* counter row, plus the turn buttons on phones */
        const height = Math.max(260, window.innerHeight * 0.5, window.innerHeight - above - below - 16);
        const next = fitBook({ aspect: [w, h], layout: book.layout, width, height });
        setSize((prev) =>
          prev && prev.mode === next.mode && Math.abs(prev.pageWidth - next.pageWidth) < 6 ? prev : next
        );
      });
    };
    measure();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [w, h, book.layout]);

  /* Images only near the spread, set directly so the flip book's pages stay
     put (react-pageflip rebuilds itself whenever its children change). The
     observer catches the pages when react-pageflip first inserts them. */
  const loadNear = useCallback(() => {
    const root = bookElRef.current;
    if (!root) return;
    const at = indexRef.current;
    root.querySelectorAll("img[data-page]").forEach((img) => {
      const i = Number(img.dataset.page);
      if (Math.abs(i - at) <= NEAR + 1 && !img.getAttribute("src")) {
        /* The same srcset and sizes as the plain page, so the flip book reuses
           the copy the browser already has instead of fetching another size. */
        if (img.dataset.srcset) {
          img.setAttribute("sizes", READER_PAGE_SIZES);
          img.setAttribute("srcset", img.dataset.srcset);
        }
        img.setAttribute("src", img.dataset.src);
      }
    });
  }, []);
  useEffect(() => {
    loadNear();
  }, [index, size, FlipBook, loadNear]);
  useEffect(() => {
    const root = bookElRef.current;
    if (!root || typeof MutationObserver === "undefined") return;
    const mo = new MutationObserver(loadNear);
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [loadNear]);

  /* ---------- turning pages ---------- */
  const api = () => flipRef.current?.pageFlip?.() || null;

  const goTo = useCallback(
    (target) => {
      const t = Math.min(Math.max(0, target), total - 1);
      if (visiblePages(indexRef.current, total, size?.mode).includes(t) && api()) return;
      const flip = api();
      if (!flip) {
        /* Plain image reader: no animation, same rules. */
        indexRef.current = t;
        setIndex(t);
        return;
      }
      if (reducedRef.current) flip.turnToPage(t);
      else flip.flip(t);
    },
    [total, size?.mode]
  );

  const next = useCallback(() => goTo(visibleRef.current.at(-1) + 1), [goTo]);
  const prev = useCallback(() => goTo(visibleRef.current[0] - 1), [goTo]);

  /* Every page change lands here, whoever made it. */
  const onFlip = useCallback((e) => {
    const i = Number(e.data) || 0;
    indexRef.current = i;
    setIndex(i);
  }, []);

  /* The cover opens once, when the book is first well in view. (react-pageflip
     attaches its init handler too late to rely on, so this waits for the API.) */
  useEffect(() => {
    if (!FlipBook || !size || openedRef.current) return;
    const el = bookElRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        io.disconnect();
        const started = Date.now();
        const open = () => {
          if (openedRef.current) return;
          if (!api()) {
            if (Date.now() - started < 3000) timer = window.setTimeout(open, 100);
            return;
          }
          openedRef.current = true;
          if (indexRef.current === 0) goTo(startIndex);
        };
        timer = window.setTimeout(open, reducedRef.current ? 0 : 450);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [FlipBook, size, goTo, startIndex]);

  /* ---------- following the narration ---------- */
  useEffect(() => {
    if (isThisBook) return;
    lastNarratedRef.current = null;
    setNarrated(null);
  }, [isThisBook]);

  /* The book turns each time the narration reaches a new page, wherever the
     visitor has turned to in the meantime (see lib/reader-follow.mjs). */
  useEffect(() => {
    if (!following) return;
    const audio = audioRef.current;
    if (!audio) return;
    const sync = () => {
      const { page, target } = followStep({
        last: lastNarratedRef.current,
        time: audio.currentTime,
        cues,
        visible: visibleRef.current,
        lead: reducedRef.current ? 0 : TURN_LEAD,
      });
      lastNarratedRef.current = page;
      setNarrated(page);
      if (target !== null) goTo(target);
    };
    sync();
    const types = ["timeupdate", "seeking", "seeked"];
    types.forEach((t) => audio.addEventListener(t, sync));
    return () => types.forEach((t) => audio.removeEventListener(t, sync));
  }, [following, audioRef, cues, goTo]);

  const firstReadable = () => Math.min(visibleRef.current[0], shownPages - 1);

  const onListen = () => {
    if (!bookTrack) return;
    if (isThisBook && (status === "playing" || status === "loading")) {
      togglePause();
      return;
    }
    playFromHere();
  };

  /* Listen, and "Play from this page": the same source rule either way. */
  const playFromHere = () => {
    if (!bookTrack) return;
    const action = listenAction({ isThisBook, page: firstReadable(), cues, available });
    if (action.type === "toggle") togglePause();
    else if (action.type === "seek") seek(action.time);
    else playAt(bookTrack, action.time);
  };

  const backToNarration = () => {
    const audio = audioRef.current;
    if (audio && available) goTo(narratedPage(cues, audio.currentTime));
  };

  /* ---------- keyboard, only inside the region ---------- */
  const onKeyDown = (e) => {
    const tag = e.target?.tagName || "";
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.target?.isContentEditable) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const keys = {
      ArrowRight: next,
      PageDown: next,
      ArrowLeft: prev,
      PageUp: prev,
      Home: () => goTo(0),
      End: () => goTo(total - 1),
    };
    const fn = keys[e.key];
    if (!fn) return;
    e.preventDefault();
    fn();
  };

  const onGo = (e) => {
    e.preventDefault();
    const n = parseInt(goValue, 10);
    if (Number.isNaN(n)) return;
    goTo(isPlay ? n - 1 : num.indexOf(n));
    setGoValue("");
    setGoOpen(false);
    /* The form (and the input that had focus) is now hidden: put focus back on
       the "Go to page" button so the next Tab carries on inside the reader. */
    goToggleRef.current?.focus();
  };

  useEffect(() => {
    if (goOpen) document.getElementById(goInputId)?.focus();
  }, [goOpen, goInputId]);

  /* ---------- the pages ---------- */
  const price = aud(book.price || 100);
  const pendingLabel = `${price} download. Online checkout coming soon`;
  const pages = useMemo(() => {
    const out = [];
    for (let i = 0; i < shownPages; i += 1) {
      out.push(
        <div className="bkr-page" key={i} data-density={i === 0 ? "hard" : "soft"}>
          <img data-page={i} data-src={pageSrc(slug, i)} data-srcset={pageSrcSet(slug, i + 1, w)} alt={`${pageHeading(book, i)} of ${title}`} width={w} height={h} decoding="async" draggable="false" />
        </div>
      );
    }
    if (isPlay) {
      out.push(
        <div className="bkr-page bkr-end" key="end" data-density="hard">
          <div className="bkr-end-inner">
            <StageCurtain className="bkr-end-art" />
            <p className="bkr-end-title script">That&rsquo;s the preview.</p>
            <p className="bkr-end-lead">Buy the full script ({price})</p>
            <p className="bkr-end-note">The full script has {pageCount} pages. After checkout, Allen will email the PDF to the address used for payment.</p>
            <PurchaseLink href={buyHref} pendingLabel={pendingLabel}>Buy the full script</PurchaseLink>
          </div>
        </div>
      );
    }
    return out;
  }, [book, shownPages, slug, title, w, h, isPlay, price, pageCount, buyHref, pendingLabel]);

  const bookKey = size ? `${size.mode}:${size.pageWidth}x${size.pageHeight}` : "none";
  const bookStyle = useMemo(
    () => (size ? { width: size.pageWidth * (size.mode === "spread" ? 2 : 1), height: size.pageHeight } : undefined),
    [size]
  );
  const closed = mode === "spread" && (index === 0 || (visible.length === 1 && index === total - 1 && total % 2 === 0))
    ? index === 0 ? "front" : "back"
    : "";

  /* Plain image reader: before page-flip loads, without JS, or if it fails.
     Before the reader has measured (the server HTML), read.css sizes it with
     the same rule as fitBook, so the page does not shift when the measured
     size and then the flip book arrive. */
  const spreadable = book.layout !== "single" && h / w >= PORTRAIT_RATIO;
  const plainIndex = Math.min(index, total - 1);
  const plain = (
    <div
      className={
        size
          ? "bkr-plain" + (size.mode === "spread" ? " bkr-plain--spread" : "")
          : "bkr-plain bkr-plain--auto" + (spreadable ? " bkr-plain--spreadable" : "")
      }
      style={
        size
          ? { width: size.pageWidth * (size.mode === "spread" ? 2 : 1), height: size.pageHeight }
          : { "--ar": (w / h).toFixed(5), "--ar2": ((2 * w) / h).toFixed(5) }
      }
    >
      {plainIndex >= shownPages ? (
        pages[pages.length - 1]
      ) : (
        /* The page on screen before the flip book loads, and the LCP element
           of /read: a phone gets the 720px copy (app/(other)/read/[slug]
           preloads the same srcset with high priority). */
        <img
          src={pageSrc(slug, plainIndex)}
          srcSet={pageSrcSet(slug, plainIndex + 1, w)}
          sizes={READER_PAGE_SIZES}
          alt={`${pageHeading(book, plainIndex)} of ${title}`}
          width={w}
          height={h}
          fetchPriority={plainIndex === 0 ? "high" : undefined}
          decoding="async"
        />
      )}
    </div>
  );

  const counter = counterText({ visible, book });
  const listenBusy = isThisBook && (status === "playing" || status === "loading");
  const listenLabel = !book.audio
    ? null
    : listenBusy
      ? book.audio.kind === "preview" ? "Pause the preview" : "Pause the audiobook"
      : book.audio.label;
  const wordsFor = visible.filter((p) => p < shownPages);
  const hasFollow = Boolean(book.audio && available && !isPlay);
  const awayFromNarration = following && narrated !== null && !visible.includes(narrated);

  return (
    <div
      className={"bkr" + (reduced ? " bkr-reduced" : "")}
      data-mode={mode}
      data-ready={FlipBook && size ? "" : undefined}
      style={bookStyle ? { "--book-w": `${bookStyle.width}px` } : undefined}
    >
      <div role="region" id={regionId} aria-label={`${title}, the book`} className="bkr-region" onKeyDown={onKeyDown}>
        {/* The toolbar sits over the book, lined up with its left edge. */}
        <div className="bkr-top">
          <div className="bkr-toolbar">
            {book.audio ? (
              <button type="button" className={"bkr-listen" + (listenBusy ? " is-playing" : "")} onClick={onListen}>
                <span className="bkr-listen-icon" aria-hidden="true"><ListenIcon playing={listenBusy} /></span>
                <span>{listenLabel}</span>
              </button>
            ) : null}
            {/* The words beside the audiobook (W7): the plain-text version of
                a story or textbook, as a quiet link next to Listen. A client
                link, so a playing audiobook keeps playing. */}
            {book.textRoute ? (
              <Link prefetch={false} className="bkr-textroute" href={book.textRoute}>
                Read it as plain text
              </Link>
            ) : null}
            {isPlay ? (
              <PurchaseLink href={buyHref} pendingLabel={pendingLabel}>{`Buy the full script (${price})`}</PurchaseLink>
            ) : book.download === "public" && book.pdf ? (
              <a className="bkr-download" href={book.pdf} download>
                Download the PDF{book.pdfBytes ? <span className="bkr-size">({megabytes(book.pdfBytes)})</span> : null}
              </a>
            ) : null}
          </div>

          {/* What following the narration is doing right now, next to Listen. */}
          {hasFollow ? (
            <div className="bkr-follow">
              <div className="bkr-follow-live" aria-live="polite">
                {following && !awayFromNarration ? <p className="bkr-follow-note">Following the narration.</p> : null}
                {awayFromNarration ? (
                  <p className="bkr-follow-actions">
                    <span className="bkr-follow-note">The book goes back to the narration at its next page.</span>
                    <button type="button" className="bkr-textbtn" onClick={playFromHere}>Play from this page</button>
                    <button type="button" className="bkr-textbtn" onClick={backToNarration}>Back to the narration</button>
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="bkr-stage" ref={stageRef}>
          <button type="button" className="bkr-turn bkr-prev" onClick={prev} aria-disabled={visible[0] <= 0 ? "true" : undefined} aria-label="Previous page">
            <Arrow dir={-1} />
          </button>
          <div className="bkr-book-cell">
            {/* The measured height is held while the plain page gives way to the
                flip book, so nothing below the book moves. */}
            <div className="bkr-book" ref={bookElRef} data-closed={closed || undefined} style={size ? { minHeight: size.pageHeight } : undefined}>
              {FlipBook && size ? (
                <FlipBook
                  key={bookKey}
                  ref={flipRef}
                  className="bkr-flip"
                  style={bookStyle}
                  width={size.pageWidth}
                  height={size.pageHeight}
                  size="fixed"
                  autoSize={false}
                  minWidth={size.pageWidth}
                  maxWidth={size.pageWidth}
                  minHeight={size.pageHeight}
                  maxHeight={size.pageHeight}
                  showCover={true}
                  usePortrait={true}
                  drawShadow={!reduced}
                  maxShadowOpacity={0.28}
                  flippingTime={reduced ? 1 : TURN_MS}
                  showPageCorners={!reduced}
                  mobileScrollSupport={true}
                  clickEventForward={true}
                  useMouseEvents={true}
                  swipeDistance={30}
                  startZIndex={0}
                  startPage={indexRef.current}
                  onFlip={onFlip}
                >
                  {pages}
                </FlipBook>
              ) : (
                plain
              )}
            </div>
          </div>
          <button type="button" className="bkr-turn bkr-next" onClick={next} aria-disabled={visible.at(-1) >= total - 1 ? "true" : undefined} aria-label="Next page">
            <Arrow dir={1} />
          </button>
        </div>

        <div className="bkr-controls">
          <p className="bkr-counter" aria-live="polite" aria-atomic="true">{counter}</p>
          <div className="bkr-go">
            <button type="button" ref={goToggleRef} className="bkr-textbtn" aria-expanded={goOpen} aria-controls={goId} onClick={() => setGoOpen((o) => !o)}>
              Go to page
            </button>
            <form id={goId} className="bkr-go-form" onSubmit={onGo} hidden={!goOpen}>
              <label htmlFor={goInputId}>
                Page number <span className="bkr-go-range">({isPlay ? `1 to ${shownPages}` : `${num.first} to ${num.last}`})</span>
              </label>
              <input
                id={goInputId}
                type="number"
                inputMode="numeric"
                min={isPlay ? 1 : num.first}
                max={isPlay ? shownPages : num.last}
                value={goValue}
                onChange={(e) => setGoValue(e.target.value)}
              />
              <button type="submit" className="bkr-go-submit">Go</button>
            </form>
          </div>
          {!isPlay && num.introPages > 1 ? (
            <button type="button" className="bkr-textbtn" onClick={() => goTo(0)}>Introduction</button>
          ) : null}
          <button type="button" className="bkr-textbtn" aria-expanded={showWords} aria-controls={wordsId} onClick={() => setShowWords((s) => !s)}>
            {showWords ? "Hide the words" : "Show the words on this page"}
          </button>
        </div>

        <div id={wordsId} className="bkr-words" hidden={!showWords}>
          {showWords
            ? wordsFor.length
              ? wordsFor.map((p) => {
                  const heading = pageHeading(book, p);
                  const paras = paragraphs(pagesText[p]);
                  return (
                    <section key={p} className="bkr-words-page" aria-label={heading}>
                      <h2 className="bkr-words-head">{heading}</h2>
                      {paras.length ? paras.map((t, k) => <p key={k}>{t}</p>) : <p className="bkr-words-empty">There are no words on this page.</p>}
                    </section>
                  );
                })
              : <p className="bkr-words-empty">That&rsquo;s the end of the preview. The rest of the script comes with the full PDF.</p>
            : null}
        </div>

      </div>
    </div>
  );
}
