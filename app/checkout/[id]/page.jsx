import Link from "next/link";
import { notFound } from "next/navigation";
import { findArt,formatPrice } from "../../../lib/art-catalog.mjs";
import { shopConfig } from "../../../lib/shop-config.mjs";
import { stockStates } from "../../../lib/shop-db.mjs";
import PayPalCheckout from "../../../components/PayPalCheckout";
export const dynamic = "force-dynamic";
export const metadata = {title:"Painting checkout · Ann Gillon",robots:{index:false,follow:false}};
export default async function Checkout({params}) {
  const art = findArt((await params).id);
  if (!art) notFound();
  let enabled = shopConfig().enabled && art.availability === "available";
  try {const stock = await stockStates();enabled = enabled && stock[art.id] === "available";} catch {enabled = false;}
  return <main className="wrap checkout-wrap"><p><Link href={`/anns-art#${art.id}`}>Back to Ann's paintings</Link></p><h1 className="script">Your painting</h1>
    <div className="checkout-grid"><img src={art.images[0].src} width={art.images[0].width} height={art.images[0].height} alt={art.title} />
    <div><h2>{art.title}</h2><p>Original painting by Ann Gillon</p>
      <dl className="checkout-totals"><div><dt>Painting</dt><dd>{formatPrice(art.priceCents)}</dd></div><div><dt>Delivery within Australia</dt><dd>Free</dd></div><div><dt>Total</dt><dd>{formatPrice(art.priceCents)}</dd></div></dl>
      <p>One original. Delivery within Australia only.</p>{art.note ? <p>{art.note}</p> : null}
      {enabled && shopConfig().mode === "sandbox" ? <p className="checkout-notice">PayPal sandbox: test payments only.</p> : null}
      <PayPalCheckout productId={art.id} enabled={enabled} /><p className="checkout-help"><Link href="/delivery">Delivery and payment information</Link></p>
    </div></div></main>;
}
