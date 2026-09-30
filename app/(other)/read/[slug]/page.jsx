import Link from "next/link";
import { notFound } from "next/navigation";
import SectionComment from "../../../../components/SectionComment";
import BookReader from "../../../../components/reader/BookReader";
import { stripePaymentLink } from "../../../../lib/storefront.mjs";
import { numbering } from "../../../../lib/reader-pages.mjs";
import { book as bookSchema, breadcrumbs, jsonLdProps } from "../../../../lib/schema.mjs";
import { ogImages } from "../../../../lib/og.mjs";
import { cueFiles, manifests, pageTexts, readableSlugs, SECTION_BACK } from "../books-data.mjs";
import "./read.css";

const ORIGIN = "https://other.allengillon.com";
const aud = (cents) => `A$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

export const dynamicParams = false;

export async function generateStaticParams() {
  return readableSlugs.map((slug) => ({ slug }));
}

function describe(m) {
  if (m.section === "plays") {
    return `Preview the first ${m.shownPages} pages of ${m.title}, a school play by Allen Gillon for primary-school performers. The full ${m.pageCount}-page script is ${aud(m.price)}.`;
  }
  if (m.section === "childrens") {
    return `Read ${m.title}, a Chinese Chimes story by Allen Gillon, as a page-turning book. Listen to the narrated audiobook, show the words, or download the free PDF.`;
  }
  return `Read ${m.title} by A. R. Gillon online, page by page, or download the free PDF. ${m.blurb} From Allen's years as a primary teacher.`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = manifests[slug];
  if (!m) return {};
  const route = `/read/${slug}`;
  const images = ogImages("other", route);
  return {
    title: m.section === "plays" ? `${m.title}, a school play` : m.title,
    description: describe(m),
    alternates: { canonical: `${ORIGIN}${route}` },
    openGraph: { title: m.title, description: describe(m), url: `${ORIGIN}${route}`, type: "book", images },
    twitter: { card: "summary_large_image", title: m.title, description: describe(m), images },
  };
}

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
        { name: "Stories, plays and textbooks", url: "/books" },
        { name: m.title, url: `/read/${slug}` },
      ],
      "other"
    ),
  ];

  return (
    <main className="read-page">
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
          {m.textRoute ? (
            <p>
              <Link className="read-textlink" href={m.textRoute}>
                Read every page as plain text
              </Link>
            </p>
          ) : null}
          <p>
            <Link className="back-link" href={back.href}>{back.label}</Link>
          </p>
        </div>
        {/* The page reader ("Listen to this page") reads the book, not the comment link. */}
        <div data-reader-skip="">
          <SectionComment subject={m.title} returnTo={`/read/${slug}`} returnLabel={m.title} />
        </div>
      </section>
    </main>
  );
}
