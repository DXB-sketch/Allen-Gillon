import PurchaseLink from "../PurchaseLink";
import PaintingViews from "./PaintingViews";
import { artDetails, artNote, artStatus, paintingAction } from "../../lib/art-catalog.mjs";

/*
 * One painting, large: its photographs, then the words a buyer needs.
 * Used by the painting route /anns-art/[id] (heading h1) and by the dialog
 * that opens over the wall on /anns-art (heading h2).
 * Medium and size appear only when known. Then the price (or "Sold"), ONE
 * action (Buy this painting through PurchaseLink, or Enquire) and the
 * delivery link.
 */
export default function PaintingDetail({ art, checkoutUrl, Heading = "h2", headingId, priority = false, keyScope }) {
  const status = artStatus(art);
  const details = artDetails(art);
  const note = artNote(art);
  const action = paintingAction(art, checkoutUrl);
  const forSale = status.state === "for-sale";
  return (
    <div className={`painting painting--${status.state}`}>
      <PaintingViews
        art={art}
        priority={priority}
        keyScope={keyScope}
        sizes="(max-width: 1023px) 92vw, 62vw"
      />
      <div className="painting-text">
        <Heading id={headingId} className="script painting-title">{art.title}</Heading>
        {details ? <p className="painting-details">{details}</p> : null}
        <p className="painting-price">{status.label}</p>
        {note ? <p className="painting-note">{note}</p> : null}
        <p className="painting-action">
          {action.kind === "buy"
            ? <PurchaseLink href={action.href}>{action.label}</PurchaseLink>
            : <a className="btn b" href={action.href}>{action.label}</a>}
        </p>
        {action.kind === "enquire" ? <p className="painting-sms">By text message to Allen on 0438 747 882.</p> : null}
        <p className="painting-delivery">
          {forSale ? "Free delivery in Australia. " : null}
          <a href="/delivery">Delivery and payment</a>
        </p>
      </div>
    </div>
  );
}
