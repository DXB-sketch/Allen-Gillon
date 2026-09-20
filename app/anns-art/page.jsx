import Link from "next/link";
import ArtGallery from "../../components/ArtGallery";
import { artworks } from "../../lib/art-catalog.mjs";
import { stripePaymentLink } from "../../lib/storefront.mjs";
export const metadata = {title:"Ann Gillon's Art · Allen Gillon",description:"See original paintings by Ann Gillon. Prices range from AUD $100 to $250, with free delivery in Australia."};
export default function AnnsArtPage() {
  const checkoutLinks = Object.fromEntries(artworks.map((art) => [art.id, stripePaymentLink(`art-${art.id}`)]));
  const checkoutEnabled = Object.values(checkoutLinks).some(Boolean);
  return <main><header className="pagehead"><div className="wrap">
    <h1 className="script">Ann Gillon</h1>
    <p className="plain">Ann is an experienced stage and restaurant singer. She also plays piano and flute. Ann also plays solo gigs with piano and headphones. When she is not making music, she paints.</p>
    <p className="art-delivery">Original paintings · AUD $100–$250 · Free delivery in Australia</p>
    <p className="art-intro-note">Choose a painting to see it at full size. Some works have more than one view. For questions about a piece, its size or framing, <a href="sms:+61438747882">text Allen on 0438 747 882</a>.</p>
    {!checkoutEnabled ? <p className="art-intro-note">Online payments are coming soon. You can enquire about any painting by texting Allen.</p> : null}
  </div></header>
  <section aria-label="Paintings by Ann Gillon"><div className="wrap">
    <ArtGallery artworks={artworks} checkoutLinks={checkoutLinks} checkoutEnabled={checkoutEnabled} />
    <p className="art-intro-note">Sold and commissioned originals are shown for interest, with a guide price and an enquiry option. <Link href="/delivery">Delivery and payment information</Link>.</p>
  </div></section></main>;
}
