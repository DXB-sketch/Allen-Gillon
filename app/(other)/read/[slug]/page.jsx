import Link from "next/link";
import { notFound } from "next/navigation";
import SectionComment from "../../../../components/SectionComment";
import BookReader from "../../../../components/reader/BookReader";
import { stripePaymentLink } from "../../../../lib/storefront.mjs";
import { numbering } from "../../../../lib/reader-pages.mjs";
import { book as bookSchema, breadcrumbs, jsonLdProps } from "../../../../lib/schema.mjs";
import { generateReadMetadata } from "../../../../lib/seo.mjs";
import { cueFiles, manifests, pageTexts, readableSlugs, SECTION_BACK } from "../books-data.mjs";
import "./read.css";

const aud = (cents) => `A$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

export async function generateStaticParams() {
  return readableSlugs.map((slug) => ({ slug }));
}

// Title, description, canonical, Open Graph and twitter card come from
// lib/seo.mjs, the one source for page metadata (docs/SEO-WIRING.md).
export const generateMetadata = generateReadMetadata;

function lede(m) {
  if (m.section === "plays") {
    return `${m.blurb} Read the first ${m.shownPages} pages here. The full script is ${m.pageCount} pages, ${aud(m.price)} as a PDF.`;
  }
  /* The page count the reader's counter uses (the numbers printed on the pages). */
  const pages = numbering(m).last;
  if (m.section === "childrens") return `${m.blurb} ${pages} pages, with the narrated audiobook.`;
  return `${m.blurb} ${pages} pages, free to read here or to download.`;
}

export default async function ReadPage({ params }) {
  const { slug } = await params;
  const m = manifests[slug];
  if (!m || !readableSlugs.includes(slug)) notFound();

  const cueFile = cueFiles[slug];
  const cues = cueFile ? cueFile.cues.map((c) => c.start) : null;
  const back = SECTION_BACK[m.section] || SECTION_BACK.childrens;
  const buyHref = m.section === "plays" ? stripePaymentLink(`play-${slug}`) : "";
  const schema = [
    bookSchema({
      ...m,
      downloadUrl: m.pdf,
      audio: m.audio ? { src: m.audio.src, preview: m.audio.kind === "preview" } : undefined,
    }),
    breadcrumbs(
      [
        { name: "Home", url: "/" },
        { name: "Stories, plays and textbooks", url: "/books" },
        { name: m.title, url: `/read/${slug}` },
      ],
      "other"
    ),
  ];

  return (
    <div className="read-page">
      <script {...jsonLdProps(schema)} />
      <header className="pagehead band read-head">
        <h1 className="script">{m.title}</h1>
        <p className="plain">{lede(m)}</p>
      </header>

      <section className="read-body band" aria-label={`Read ${m.title}`}>
        <div className="read-reader">
          <BookReader
            book={m}
            pagesText={pageTexts[slug]?.pages || []}
            cues={cues}
            verified={cueFile?.verified === true}
            buyHref={buyHref}
          />
        </div>
      </section>

      <section className="read-foot band" aria-label="More about this book">
        <div className="read-links">
          <p>
            <Link prefetch={false} className="back-link" href={back.href}>{back.label}</Link>
          </p>
        </div>
        {/* The page reader ("Listen to this page") reads the book, not the comment link. */}
        <div data-reader-skip="">
          <SectionComment subject={m.title} returnTo={`/read/${slug}`} returnLabel={m.title} />
        </div>
      </section>
    </div>
  );
}
