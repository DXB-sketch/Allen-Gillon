export default function PurchaseLink({ href, children, pendingLabel = "Stripe checkout coming soon" }) {
  if (!href) {
    return <span className="purchase-pending" aria-label={pendingLabel}>{pendingLabel}</span>;
  }

  return <a className="btn" href={href} rel="noopener">{children}</a>;
}
