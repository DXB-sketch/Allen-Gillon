export default function PurchaseLink({ href, children, pendingLabel = "Stripe checkout coming soon" }) {
  if (!href) {
    /* Plain text, no aria-label: a span has no role, so a label on it is
       prohibited (axe aria-prohibited-attr) and the words already say it. */
    return <span className="purchase-pending">{pendingLabel}</span>;
  }

  return <a className="btn" href={href} rel="noopener">{children}</a>;
}
