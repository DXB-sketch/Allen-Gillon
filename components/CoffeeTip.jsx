import ReviewsCup from "./illustrations/ReviewsCup";

/* "Buy me a coffee" on /music: a thank-you for the free albums.

   - CoffeeCard sits in every open album panel. From 1024px it stands in the
     panel's last column, to the right of the track list; below that it
     follows the track list.
   - There is no popup. An earlier version opened this card in a dialog on
     phones the first time an album was opened; Allen found it took over the
     screen and made the coffee feel compulsory, so it was removed.
   - The link opens Stripe in a new tab so the album keeps playing here.
   - It is a secondary action, so it is an outlined button: the one filled
     button in the panel stays "Download album free" (DESIGN.md, Layout). */

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
