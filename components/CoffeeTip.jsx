"use client";

import { useCallback, useEffect, useRef } from "react";
import ReviewsCup from "./illustrations/ReviewsCup";

/* "Buy me a coffee" on /music: a thank-you for the free albums.

   - CoffeeCard sits in every open album panel. From 1024px it stands in the
     panel's last column, to the right of the track list; below that it
     follows the track list.
   - CoffeePopup is the same card in a native <dialog>, centred, for phones
     and tablets (below 1024px, where there is no right-hand side). It opens
     a moment after the first album is opened, once per visit
     (sessionStorage), and never on laptops. Esc, Close or a tap on the
     backdrop closes it, Tab stays inside it (DESIGN.md, Dialogs), and the
     music keeps playing behind it.
   - The link opens Stripe in a new tab so the album keeps playing here.
   - It is a secondary action, so it is an outlined button: the one filled
     button in the panel stays "Download album free" (DESIGN.md, Layout). */

const SEEN_KEY = "coffee-popup-seen";
const POPUP_QUERY = "(max-width: 1023px)";
const POPUP_DELAY_MS = 900;

function CoffeeLink({ href }) {
  return (
    <a className="coffee-btn" href={href} target="_blank" rel="noopener">
      Buy me a coffee<span className="visually-hidden"> (opens Stripe checkout in a new tab)</span>
    </a>
  );
}

export function CoffeeCard({ href, headingId, Heading = "h3" }) {
  if (!href) return null;
  return (
    <aside className="coffee-tip" aria-labelledby={headingId} data-reader-skip>
      <ReviewsCup className="coffee-art" />
      <Heading className="coffee-title" id={headingId}>Enjoying the music?</Heading>
      <p className="coffee-text">These albums are free to play and download. If they've brightened your day, you can buy me a coffee.</p>
      <CoffeeLink href={href} />
      <p className="coffee-small">Any amount from A$2. Secure checkout by Stripe.</p>
    </aside>
  );
}

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* Private mode: the popup may show again next visit, which is fine. */
  }
}

/* `trigger` is the open album's id (null while every album is closed). */
export function CoffeePopup({ href, trigger }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!href || !trigger) return;
    const dialog = dialogRef.current;
    if (!dialog?.showModal || dialog.open || alreadySeen()) return;
    if (!matchMedia(POPUP_QUERY).matches) return;
    const timer = setTimeout(() => {
      if (dialog.open || alreadySeen() || !matchMedia(POPUP_QUERY).matches) return;
      markSeen();
      dialog.showModal();
    }, POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [href, trigger]);

  // Tab and Shift+Tab wrap inside the dialog, as on the painting dialog.
  const onKeyDown = useCallback((event) => {
    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = [...dialog.querySelectorAll("a[href], button:not([disabled])")].filter(
      (el) => el.getClientRects().length > 0,
    );
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
  }, []);

  // A tap on the backdrop (outside the box) closes it.
  const onClick = useCallback((event) => {
    if (event.target === dialogRef.current) dialogRef.current.close();
  }, []);

  if (!href) return null;
  return (
    <dialog
      ref={dialogRef}
      className="coffee-dialog"
      aria-labelledby="coffee-dialog-title"
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      <div className="coffee-dialog-inner">
        <form method="dialog" className="coffee-dialog-close">
          <button type="submit" className="coffee-close">
            Close<span className="visually-hidden"> and keep listening</span>
          </button>
        </form>
        <CoffeeCard href={href} headingId="coffee-dialog-title" Heading="h2" />
      </div>
    </dialog>
  );
}
