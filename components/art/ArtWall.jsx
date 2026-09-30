"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ArtPicture from "./ArtPicture";
import PaintingDetail from "./PaintingDetail";
import ArtRail from "../illustrations/ArtRail";
import ArtSkirting from "../illustrations/ArtSkirting";
import ArtWire from "../illustrations/ArtWire";
import ArtArrow from "../illustrations/ArtArrow";
import { ART_HALL_CLASS, ROOMS, artHallAllowed, artStatus, artRatio, inRoom } from "../../lib/art-catalog.mjs";

/*
 * Ann's paintings on /anns-art.
 *
 * The server renders the salon-hang index: every painting at its true aspect
 * ratio, each a plain link to its own page /anns-art/[id]. That is the no-JS
 * and search base, and the default under prefers-reduced-motion.
 *
 * With JS and motion allowed, html.art-hall goes on the page before first
 * paint (ART_HALL_SCRIPT inline on a full load, the layout effect below on a
 * client-side visit) and the same list becomes the hallway: one
 * horizontal scroll-snap track under a drawn picture rail, moved only by the
 * 64px arrows, the left and right keys, a mouse drag or a swipe. The vertical
 * wheel is never turned into horizontal movement. "See every painting at
 * once" switches back to the index (and back again).
 *
 * Choosing a painting opens it in a native <dialog> over the wall (focus is
 * held in the dialog, Esc closes, focus returns to the painting). The address
 * becomes /anns-art/[id] with history.pushState, so the back button closes it.
 * The dialog is rendered only while open: the index HTML carries no Buy link.
 */

const HALL_CLASS = ART_HALL_CLASS;
const paintingsWord = (n) => `${n} ${n === 1 ? "painting" : "paintings"}`;

/* Hallway hang: landscapes a little lower than portraits, so the wall reads as
   one line of similar-sized pictures rather than a row of equal heights. */
const hangFactor = (ratio) => Math.max(0.62, Math.min(1, 1 / Math.sqrt(ratio))).toFixed(3);

export default function ArtWall({ artworks, checkoutLinks }) {
  const [room, setRoom] = useState("All");
  const [mode, setMode] = useState("index");
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [announced, setAnnounced] = useState(0);
  const [openId, setOpenId] = useState(null);

  const trackRef = useRef(null);
  const dialogRef = useRef(null);
  const linkRefs = useRef(new Map());
  const pushed = useRef(false);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const currentRef = useRef(0);
  // While go() scrolls smoothly to a painting, the scroll listener must not
  // hand "current" (the counter and the one tab stop) to the paintings it
  // passes on the way. pinnedRef holds the target until the scroll arrives.
  const pinnedRef = useRef(null);
  const pinTimer = useRef(0);

  const works = useMemo(() => artworks.filter((art) => inRoom(art, room)), [artworks, room]);
  const openArt = openId ? artworks.find((art) => art.id === openId) : null;
  const hall = mode === "hall";

  // Pick up the mode the inline script chose before paint. On a client-side
  // visit that script never ran, so make the same choice here (a layout
  // effect runs before the browser paints the new page).
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains(HALL_CLASS) && artHallAllowed()) root.classList.add(HALL_CLASS);
    setMounted(true);
    if (root.classList.contains(HALL_CLASS)) setMode("hall");
    return () => root.classList.remove(HALL_CLASS);
  }, []);

  useEffect(() => {
    currentRef.current = current;
    const timer = setTimeout(() => setAnnounced(current), 250);
    return () => clearTimeout(timer);
  }, [current]);

  const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slideAt = (i) => trackRef.current?.children[i] || null;

  const centreOf = (i) => {
    const track = trackRef.current;
    const slide = slideAt(i);
    if (!track || !slide) return 0;
    return slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2;
  };

  const nearest = () => {
    const track = trackRef.current;
    if (!track) return 0;
    // At either end of the hall the end painting is the current one, even
    // when a wide screen shows several paintings from the middle outwards.
    if (track.scrollLeft <= 2) return 0;
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) return track.children.length - 1;
    const middle = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDistance = Infinity;
    [...track.children].forEach((slide, i) => {
      const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - middle);
      if (distance < bestDistance) { best = i; bestDistance = distance; }
    });
    return best;
  };

  const go = useCallback((i, { focus = false, instant = false } = {}) => {
    const track = trackRef.current;
    const count = track?.children.length || 0;
    if (!count) return;
    const target = Math.max(0, Math.min(count - 1, i));
    // A long jump (Home, End) moves at once: a smooth scroll across the whole
    // hall takes seconds, and the counter should say where focus already is.
    const smooth = !instant && !reduceMotion() && Math.abs(target - currentRef.current) <= 3;
    clearTimeout(pinTimer.current);
    pinnedRef.current = smooth ? target : null;
    if (smooth) pinTimer.current = setTimeout(() => { pinnedRef.current = null; }, 2000);
    track.scrollTo({ left: centreOf(target), behavior: smooth ? "smooth" : "auto" });
    setCurrent(target);
    currentRef.current = target;
    if (focus) slideAt(target)?.querySelector("a")?.focus({ preventScroll: true });
  }, []);

  // Entering the hallway (or changing room in it): start at the first painting.
  useEffect(() => {
    if (!hall) return;
    setCurrent(0);
    requestAnimationFrame(() => go(0, { instant: true }));
  }, [hall, room, go]);

  // Follow the track as it scrolls (swipe, trackpad, drag, snap).
  useEffect(() => {
    const track = trackRef.current;
    if (!hall || !track) return undefined;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const i = nearest();
        if (pinnedRef.current !== null) {
          if (i !== pinnedRef.current) return;
          pinnedRef.current = null;
        }
        if (i !== currentRef.current) { currentRef.current = i; setCurrent(i); }
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => { track.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [hall]);

  const setHall = (on) => {
    document.documentElement.classList.toggle(HALL_CLASS, on);
    setMode(on ? "hall" : "index");
  };

  // ---- Keys and drag on the hallway track ----
  const onTrackKey = (event) => {
    if (!hall || event.altKey || event.ctrlKey || event.metaKey) return;
    const moves = { ArrowRight: currentRef.current + 1, ArrowLeft: currentRef.current - 1, Home: 0, End: works.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    go(moves[event.key], { focus: true });
  };

  const onPointerDown = (event) => {
    if (!hall || event.pointerType !== "mouse" || event.button !== 0) return;
    pinnedRef.current = null;
    drag.current = { x: event.clientX, left: trackRef.current.scrollLeft, id: event.pointerId, moved: false };
  };
  const onPointerMove = (event) => {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    const track = trackRef.current;
    if (!d.moved) {
      d.moved = true;
      track.classList.add("is-dragging");
      track.setPointerCapture?.(d.id);
    }
    track.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved) return;
    const track = trackRef.current;
    track.classList.remove("is-dragging");
    track.releasePointerCapture?.(d.id);
    suppressClick.current = true;
    setTimeout(() => { suppressClick.current = false; }, 0);
    go(nearest());
  };
  const onClickCapture = (event) => {
    if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); }
  };

  // ---- The painting dialog ----
  const open = (event, art, i) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (typeof HTMLDialogElement === "undefined" || !dialogRef.current?.showModal) return;
    event.preventDefault();
    if (hall) { setCurrent(i); currentRef.current = i; }
    try {
      history.pushState({ annArt: art.id }, "", `/anns-art/${art.id}`);
      pushed.current = true;
    } catch { pushed.current = false; }
    setOpenId(art.id);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (openId && dialog && !dialog.open) dialog.showModal();
  }, [openId]);

  const onDialogClose = () => {
    const id = openId;
    setOpenId(null);
    if (pushed.current) {
      pushed.current = false;
      history.back();
    }
    // Focus returns to the painting that opened the dialog.
    const link = id ? linkRefs.current.get(id) : null;
    if (link) requestAnimationFrame(() => link.focus({ preventScroll: hall }));
  };

  // The back button closes the dialog; the forward button opens it again, so
  // the address and what is on screen always agree.
  useEffect(() => {
    const onPop = () => {
      const dialog = dialogRef.current;
      const wanted = history.state?.annArt;
      if (dialog?.open && wanted !== openId) {
        pushed.current = false;
        dialog.close();
      } else if (!dialog?.open && wanted && artworks.some((art) => art.id === wanted)) {
        pushed.current = true;
        const i = works.findIndex((art) => art.id === wanted);
        if (hall && i >= 0) go(i, { instant: true });
        setOpenId(wanted);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [openId, artworks, works, hall, go]);

  // showModal() makes the page behind inert, but Tab from the last control
  // would still leave for the browser's own toolbar. Wrap it instead, so focus
  // goes from the last control to the first (and Shift+Tab the other way).
  const onDialogKeyDown = (event) => {
    if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0 && !el.closest("[inert]"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  };

  // A click on the backdrop (outside the dialog box) closes it too.
  const onDialogClick = (event) => {
    if (event.target === dialogRef.current) dialogRef.current.close();
  };

  const total = works.length;

  return (
    <>
      <div className="wall-tools">
        <div className="rooms" role="group" aria-label="Show paintings by subject">
          {ROOMS.map((name) => (
            <button key={name} type="button" className="room" aria-pressed={name === room} onClick={() => setRoom(name)}>
              {name === "All" ? "All paintings" : name}
            </button>
          ))}
        </div>
        {mounted ? (
          <button type="button" className="wall-toggle" onClick={() => setHall(!hall)}>
            {hall ? "See every painting at once" : "Walk along the wall"}
          </button>
        ) : null}
      </div>
      <p className="visually-hidden" role="status">
        {paintingsWord(total)}{room !== "All" ? ` in ${room.toLowerCase()}` : ""}
      </p>

      <div className="hall" data-reader-skip>
        <ArtRail className="hall-rail" />
        <ul
          className="artgrid"
          ref={trackRef}
          aria-label={hall ? "The hallway: use the arrow keys to walk along the wall" : "Paintings"}
          onKeyDown={onTrackKey}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          {works.map((art, i) => {
            const ratio = artRatio(art);
            const status = artStatus(art);
            return (
              <li key={art.id} className="work" style={{ "--ar": ratio.toFixed(4), "--hf": hangFactor(ratio) }}>
                <a
                  href={`/anns-art/${art.id}`}
                  className="work-link"
                  ref={(el) => { if (el) linkRefs.current.set(art.id, el); else linkRefs.current.delete(art.id); }}
                  tabIndex={hall && i !== current ? -1 : undefined}
                  onClick={(event) => open(event, art, i)}
                >
                  <ArtWire className="work-wire" />
                  <span className="work-frame">
                    {/* The page's LCP is the lede above the wall. Low priority keeps
                        these photographs from competing with the CSS and the text
                        for the first paint. */}
                    <ArtPicture
                      image={art.images[0]}
                      alt=""
                      sizes="(max-width: 700px) 80vw, 34vw"
                      loading={i < 4 ? "eager" : "lazy"}
                      fetchPriority="low"
                    />
                  </span>
                  <span className="work-label">
                    <span className="work-title">{art.title}</span>
                    {art.medium ? <span className="work-medium">{art.medium}</span> : null}
                    <span className={`work-price work-price--${status.state}`}>{status.label}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <ArtSkirting className="hall-skirting" />
        <div className="hall-controls">
          <button
            type="button"
            className="hall-arrow"
            aria-label="Previous painting"
            aria-disabled={current <= 0 ? "true" : undefined}
            onClick={() => go(current - 1)}
          >
            <ArtArrow className="arrow-glyph arrow-back" />
          </button>
          <p className="hall-count" aria-live="polite">{Math.min(announced, total - 1) + 1} of {total}</p>
          <button
            type="button"
            className="hall-arrow"
            aria-label="Next painting"
            aria-disabled={current >= total - 1 ? "true" : undefined}
            onClick={() => go(current + 1)}
          >
            <ArtArrow className="arrow-glyph" />
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="painting-dialog"
        aria-labelledby={openArt ? "painting-dialog-title" : undefined}
        onClose={onDialogClose}
        onClick={onDialogClick}
        onKeyDown={onDialogKeyDown}
      >
        {openArt ? (
          <div className="painting-dialog-inner">
            <form method="dialog" className="painting-dialog-close">
              <button type="submit" className="dialog-close">Close</button>
            </form>
            <PaintingDetail
              key={openArt.id}
              art={openArt}
              checkoutUrl={checkoutLinks[openArt.id]}
              Heading="h2"
              headingId="painting-dialog-title"
              priority
              keyScope={dialogRef}
            />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
