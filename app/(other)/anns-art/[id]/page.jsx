import Link from "next/link";
import { notFound } from "next/navigation";
import PaintingDetail from "../../../../components/art/PaintingDetail";
import { artDetails, artStatus, artworks, findArt } from "../../../../lib/art-catalog.mjs";
import { stripePaymentLink } from "../../../../lib/storefront.mjs";
import { ogImages } from "../../../../lib/og.mjs";
import { artwork, breadcrumbs, jsonLdProps } from "../../../../lib/schema.mjs";
import "../anns-art.css";

// One page per painting, from the catalogue (content/artworks.mjs, a static
// import: the Worker has no filesystem at request time). The same painting
// also opens as a dialog over the wall on /anns-art, with this address.
export async function generateStaticParams() {
  return artworks.map((art) => ({ id: art.id }));
}

function describe(art) {
  const status = artStatus(art);
  const parts = [`${art.title}, an original painting by Ann Gillon.`];
  const details = artDetails(art);
  if (details) parts.push(`${details}.`);
  parts.push(status.state === "for-sale" ? `${status.label}, free delivery in Australia.` : `${status.label}.`);
  return parts.join(" ");
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const art = findArt(id);
  if (!art) return {};
  const path = `/anns-art/${art.id}`;
  const description = describe(art);
  return {
    title: `${art.title}, by Ann Gillon`,
    description,
    alternates: { canonical: path },
    openGraph: { title: art.title, description, url: path, images: ogImages("other", path) },
    twitter: { card: "summary_large_image", images: ogImages("other", path) },
  };
}

export default async function PaintingPage({ params }) {
  const { id } = await params;
  const art = findArt(id);
  if (!art) notFound();
  const jsonLd = [
    artwork(art),
    breadcrumbs([{ name: "Ann Gillon's art", url: "/anns-art" }, { name: art.title }], "other"),
  ];
  return (
    <main>
      <div className="band painting-page">
        <p className="painting-back"><Link className="back-link" href="/anns-art">All of Ann&rsquo;s paintings</Link></p>
        <PaintingDetail art={art} checkoutUrl={stripePaymentLink(`art-${art.id}`)} Heading="h1" priority />
      </div>
      <script {...jsonLdProps(jsonLd)} />
    </main>
  );
}
