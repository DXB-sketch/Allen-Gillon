import Link from "next/link";
import { notFound } from "next/navigation";
import SectionComment from "../../../../../components/SectionComment";
import { breadcrumbs, jsonLdProps } from "../../../../../lib/schema.mjs";
import { ogImages } from "../../../../../lib/og.mjs";
import { paragraphs } from "../../../../../lib/book-text.mjs";
import { numbering } from "../../../../../lib/reader-pages.mjs";
import { manifests, pageTexts, textSlugs } from "../../books-data.mjs";
import "../read.css";

// The words of every page, server-rendered: the text alternative to the flip
// book for stories and textbooks. Plays have no full-text route (paid
// content); their reader shows the words of the preview pages only.

const ORIGIN = "https://other.allengillon.com";

export const dynamicParams = false;

export async function generateStaticParams() {
  return textSlugs.map((slug) => ({ slug }));
}

function describe(m) {
  return m.section === "childrens"
    ? `The words of every page of ${m.title}, a Chinese Chimes story by Allen Gillon, as plain text for reading aloud, large print or a screen reader.`
    : `The words of every page of ${m.title} by A. R. Gillon, as plain text for reading aloud, large print or a screen reader. Page numbers match the book.`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = manifests[slug];
  if (!m || !textSlugs.includes(slug)) return {};
  const route = `/read/${slug}/text`;
  const images = ogImages("other", route);
  return {
    title: `${m.title}: the words`,
    description: describe(m),
    alternates: { canonical: `${ORIGIN}${route}` },
    openGraph: { title: `${m.title}: the words`, description: describe(m), url: `${ORIGIN}${route}`, images },
    twitter: { card: "summary_large_image", title: `${m.title}: the words`, description: describe(m), images },
  };
}

export default async function BookTextPage({ params }) {
  const { slug } = await params;
  const m = manifests[slug];
  if (!m || !textSlugs.includes(slug)) notFound();
  const pages = pageTexts[slug]?.pages || [];
  const num = numbering(m);
  const crumbs = breadcrumbs(
    [
      { name: "Stories, plays and textbooks", url: "/books" },
      { name: m.title, url: `/read/${slug}` },
      { name: "The words", url: `/read/${slug}/text` },
    ],
    "other"
  );

  return (
    <main className="read-page read-text-page">
      <script {...jsonLdProps(crumbs)} />
      <header className="pagehead band read-head">
        <h1 className="script">{m.title}</h1>
        <p className="plain">
          The words of every page, for reading aloud, large print or a screen reader. They were read from the printed
          pages by computer, so the odd word may be wrong.
        </p>
      </header>

      <div className="band read-text-body">
        <p className="read-text-top">
          <Link className="back-link" href={`/read/${slug}`}>Read it as a book</Link>
        </p>
        <ol className="read-text-pages">
          {pages.map((text, i) => {
            const paras = paragraphs(text);
            if (!paras.length) return null;
            const lab = num.label(i);
            const heading = lab.kind === "intro" ? `Introduction, page ${lab.n}` : `Page ${lab.n}`;
            return (
              <li key={i} className="read-text-page" id={`page-${i + 1}`}>
                <h2>{heading}</h2>
                {paras.map((p, k) => (
                  <p key={k}>{p}</p>
                ))}
              </li>
            );
          })}
        </ol>
        <p className="read-text-top">
          <Link className="back-link" href={`/read/${slug}`}>Read it as a book</Link>
        </p>
        {/* /comments only returns to whitelisted paths (lib/sites.mjs), which include /read/<slug>. */}
        <div className="read-text-comment" data-reader-skip="">
          <SectionComment subject={m.title} returnTo={`/read/${slug}`} returnLabel={m.title} />
        </div>
      </div>
    </main>
  );
}
