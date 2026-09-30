import ArtWall from "../../../components/art/ArtWall";
import ArtHallScript from "../../../components/art/ArtHallScript";
import ArtEasel from "../../../components/illustrations/ArtEasel";
import { artworks } from "../../../lib/art-catalog.mjs";
import { stripePaymentLink } from "../../../lib/storefront.mjs";
import { pageMetadata } from "../../../lib/seo.mjs";
import { collectionPage, jsonLdProps } from "../../../lib/schema.mjs";
import "./anns-art.css";

// Title, description, canonical, Open Graph and twitter card: lib/seo.mjs.
export const metadata = pageMetadata("other", "/anns-art");

const JSON_LD = collectionPage(
  artworks.map((art) => ({ url: `/anns-art/${art.id}`, name: art.title, image: art.images[0]?.src })),
  { url: "/anns-art", name: "Ann Gillon's paintings", site: "other" },
);

export default function AnnsArtPage() {
  // Resolved on the server: the client gets only the finished Stripe URLs.
  const checkoutLinks = Object.fromEntries(artworks.map((art) => [art.id, stripePaymentLink(`art-${art.id}`)]));
  return (
    <main>
      <script {...jsonLdProps(JSON_LD)} />
      <header className="pagehead band art-head">
        <h1 className="script">Ann Gillon</h1>
        <p className="plain">Ann is an experienced stage and restaurant singer. She also plays piano and flute. Ann also plays solo gigs with piano and headphones. When she is not making music, she paints.</p>
        <p className="art-terms">Originals, A$100-250, free delivery in Australia</p>
        <ArtEasel className="art-easel" draw />
      </header>
      <section className="wall band" aria-labelledby="paintings-heading">
        <h2 id="paintings-heading" className="visually-hidden">Paintings</h2>
        {/* Lays the wall out as the hallway before first paint on a full load (JS on, motion allowed). */}
        <ArtHallScript />
        <ArtWall artworks={artworks} checkoutLinks={checkoutLinks} />
      </section>
    </main>
  );
}
