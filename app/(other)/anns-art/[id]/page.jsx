import Link from "next/link";
import { notFound } from "next/navigation";
import PaintingDetail from "../../../../components/art/PaintingDetail";
import { artworks, findArt } from "../../../../lib/art-catalog.mjs";
import { stripePaymentLink } from "../../../../lib/storefront.mjs";
import { generateArtworkMetadata } from "../../../../lib/seo.mjs";
import { artwork, breadcrumbs, jsonLdProps } from "../../../../lib/schema.mjs";
import "../anns-art.css";

// One page per painting, from the catalogue (content/artworks.mjs, a static
// import: the Worker has no filesystem at request time). The same painting
// also opens as a dialog over the wall on /anns-art, with this address.
export async function generateStaticParams() {
  return artworks.map((art) => ({ id: art.id }));
}

// Title, description, canonical, the painting's own Open Graph image and the
// twitter card come from lib/seo.mjs, the one source for page metadata.
export const generateMetadata = generateArtworkMetadata;

export default async function PaintingPage({ params }) {
  const { id } = await params;
  const art = findArt(id);
  if (!art) notFound();
  const jsonLd = [
    artwork(art),
    breadcrumbs([{ name: "Home", url: "/" }, { name: "Ann Gillon", url: "/anns-art" }, { name: art.title }], "other"),
  ];
  return (
    <main>
      <script {...jsonLdProps(jsonLd)} />
      <div className="band painting-page">
        <p className="painting-back"><Link className="back-link" href="/anns-art">All of Ann&rsquo;s paintings</Link></p>
        <PaintingDetail art={art} checkoutUrl={stripePaymentLink(`art-${art.id}`)} Heading="h1" priority />
      </div>
    </main>
  );
}
