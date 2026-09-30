import Link from "next/link";
import { notFound } from "next/navigation";
import SectionComment from "../../../../../components/SectionComment";
import { breadcrumbs, jsonLdProps } from "../../../../../lib/schema.mjs";
import { generateReadTextMetadata } from "../../../../../lib/seo.mjs";
import { paragraphs } from "../../../../../lib/book-text.mjs";
import { pageHeading } from "../../../../../lib/reader-pages.mjs";
import { manifests, pageTexts, textSlugs } from "../../books-data.mjs";
import "../read.css";

// The words of every page, server-rendered: the text alternative to the flip
// book for stories and textbooks. Plays have no full-text route (paid
// content); their reader shows the words of the preview pages only.

export async function generateStaticParams() {
  return textSlugs.map((slug) => ({ slug }));
}

// Metadata from lib/seo.mjs. Plays have no text route: {} and a 404.
export const generateMetadata = generateReadTextMetadata;

export default async function BookTextPage({ params }) {
  const { slug } = await params;
  const m = manifests[slug];
  if (!m || !textSlugs.includes(slug)) notFound();
  const pages = pageTexts[slug]?.pages || [];
  const crumbs = breadcrumbs(
    [
      { name: "Home", url: "/" },
      { name: "Stories, plays and textbooks", url: "/books" },
      { name: m.title, url: `/read/${slug}` },
      { name: "The words", url: `/read/${slug}/text` },
    ],
    "other"
  );

  return (
    <div className="read-page read-text-route">
      <script {...jsonLdProps(crumbs)} />
      <header className="pagehead band read-head">
        <h1 className="script">{m.title}</h1>
        <p className="plain">
          {m.section === "childrens"
            ? "The words of every page, for reading aloud, large print or a screen reader. Words in speech bubbles are in quotes."
            : "The words of every page, for reading aloud, large print or a screen reader. They were read from the printed pages by computer, so the odd word may be wrong, and the puzzles and word searches are left out."}
        </p>
      </header>

      <div className="band read-text-body">
        <p className="read-text-top">
          <Link prefetch={false} className="back-link" href={`/read/${slug}`}>Read it as a book</Link>
        </p>
        <ol className="read-text-pages">
          {pages.map((text, i) => {
            const paras = paragraphs(text);
            if (!paras.length) return null;
            const heading = pageHeading(m, i);
            return (
              <li key={i} className="read-text-entry" id={`page-${i + 1}`}>
                <h2>{heading}</h2>
                {paras.map((p, k) => (
                  <p key={k}>{p}</p>
                ))}
              </li>
            );
          })}
        </ol>
        <p className="read-text-top">
          <Link prefetch={false} className="back-link" href={`/read/${slug}`}>Read it as a book</Link>
        </p>
        {/* /comments only returns to whitelisted paths (lib/sites.mjs), which include /read/<slug>. */}
        <div className="read-text-comment" data-reader-skip="">
          <SectionComment subject={m.title} returnTo={`/read/${slug}`} returnLabel={m.title} />
        </div>
      </div>
    </div>
  );
}
