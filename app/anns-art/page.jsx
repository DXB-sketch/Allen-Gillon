import Link from "next/link";
import ArtGallery from "../../components/ArtGallery";
import { artworks } from "../../lib/art-catalog.mjs";
import { stockStates } from "../../lib/shop-db.mjs";
import { shopConfig } from "../../lib/shop-config.mjs";
export const dynamic = "force-dynamic";
export const metadata = {title:"Ann Gillon's Art · Allen Gillon",description:"Original paintings by Ann Gillon, from Australian landscapes and seascapes to animals and colourful imaginings. AUD $100–$250, with free delivery in Australia."};
export default async function AnnsArtPage() {
  let stock = {};
  let checkoutEnabled = shopConfig().enabled;
  try { stock = await stockStates(); } catch { checkoutEnabled = false; }
  return <main><header className="pagehead"><div className="wrap">
    <h1 className="script">Ann Gillon</h1>
    <p className="plain">When she is not singing, Ann Gillon paints. Explore her originals, from Australian landscapes and the sea to animals, music and colourful imaginings.</p>
    <p className="art-delivery">Original paintings · AUD $100–$250 · Free delivery in Australia</p>
    <p className="art-intro-note">Choose a painting to see it at full size. Some works have more than one view. For questions about a piece, its size or framing, <a href="sms:+61438747882">text Allen on 0438 747 882</a>.</p>
    {!checkoutEnabled ? <p className="art-intro-note">Online payments are coming soon. You can enquire about any painting by texting Allen.</p> : null}
    {checkoutEnabled && shopConfig().mode === "sandbox" ? <p className="checkout-notice">Test checkout only. No real payments are taken.</p> : null}
  </div></header>
  <section aria-label="Paintings by Ann Gillon"><div className="wrap">
    <ArtGallery artworks={artworks} stock={stock} checkoutEnabled={checkoutEnabled} />
    <p className="art-intro-note">Sold and commissioned originals are shown for interest, with a guide price and an enquiry option. <Link href="/delivery">Delivery and payment information</Link>.</p>
  </div></section></main>;
}
