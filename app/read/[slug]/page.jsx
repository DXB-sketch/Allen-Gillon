import CommentLink from "../../../components/CommentLink";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookReader from "../../../components/BookReader";

const BOOKS_DIR = path.join(process.cwd(), "public", "books");
const exists = (p) => access(p).then(() => true, () => false);

async function readIndex() {
  try {
    return JSON.parse(await readFile(path.join(BOOKS_DIR, "index.json"), "utf8"));
  } catch {
    return [];
  }
}

async function readManifest(slug) {
  try {
    return JSON.parse(await readFile(path.join(BOOKS_DIR, slug, "manifest.json"), "utf8"));
  } catch {
    return null;
  }
}

// Storybooks that are on YouTube but not yet digitised: keep a plain
// placeholder page for each until their scans arrive.
const placeholders = {
  "funny-fah-learns-when-to-stop": "Funny Fah Learns When to Stop",
  "imaginative-little-mee": "Imaginative Little Mee",
  "little-ray": "Little Ray",
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const index = await readIndex();
  const slugs = new Set([...index.map((b) => b.slug), ...Object.keys(placeholders)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const index = await readIndex();
  const entry = index.find((b) => b.slug === slug);
  if (entry && entry.status === "free") {
    return {
      title: `${entry.title} · Allen Gillon`,
      description: entry.blurb,
      openGraph: {
        title: entry.title,
        description: entry.blurb,
        images: [{ url: `/books/${slug}/p001.webp` }],
      },
    };
  }
  if (entry) {
    return {
      title: `${entry.title} · Allen Gillon`,
      description: `${entry.title}, a published classroom title by Allen Gillon.`,
    };
  }
  if (placeholders[slug]) {
    return {
      title: `${placeholders[slug]} · Allen Gillon`,
      description: `${placeholders[slug]} by Allen Gillon, being digitised for reading on this site.`,
    };
  }
  return {};
}

export default async function ReadPage({ params }) {
  const { slug } = await params;
  const index = await readIndex();
  const entry = index.find((b) => b.slug === slug);

  if (!entry && !placeholders[slug]) notFound();

  // Not yet digitised: plain placeholder, nothing heavy.
  if (!entry) {
    const title = placeholders[slug];
    return (
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">{title}</h1>
            <CommentLink subject={title} returnTo={`/read/${slug}`} returnLabel={title} />
            <p className="plain">
              This storybook is being digitised. When it is ready, the full story will open right here to read along
              with, or without, the narration.
            </p>
          </div>
        </header>
        <section aria-label="Coming soon">
          <div className="wrap">
            <div className="note">
              <p>
                Nothing to read just yet: the pages are on their way from Allen&rsquo;s shelf to this one. If you would
                like a copy in the meantime, <Link href="/hire">get in touch</Link>.
              </p>
            </div>
            <p style={{ marginTop: "24px" }}>
              <Link className="btn b" href="/books">Back to eBooks</Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  // Published elsewhere; web rights not confirmed. Listed only.
  if (entry.status !== "free") {
    return (
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">{entry.title}</h1>
            <CommentLink subject={entry.title} returnTo={`/read/${slug}`} returnLabel={entry.title} />
            <p className="plain">{entry.blurb}</p>
          </div>
        </header>
        <section aria-label="Availability">
          <div className="wrap">
            <div className="note">
              <p>
                {entry.title} is a published title available to schools through its publisher. It is not available to
                read or download on this site. For help finding a copy, <Link href="/hire">get in touch</Link>.
              </p>
            </div>
            <p style={{ marginTop: "24px" }}>
              <Link className="btn b" href="/plays">Back to School Plays</Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  const manifest = await readManifest(slug);
  if (!manifest) notFound();

  let ocrText = null;
  const textPath = path.join(BOOKS_DIR, slug, "text.txt");
  if (await exists(textPath)) {
    ocrText = await readFile(textPath, "utf8");
  }

  const backHref = entry.section === "plays" ? "/plays" : "/books";
  const backLabel = entry.section === "plays" ? "Back to School Plays" : "Back to eBooks";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: manifest.title,
    author: { "@type": "Person", name: "Allen Gillon" },
    bookFormat: "https://schema.org/EBook",
    inLanguage: "en",
    numberOfPages: manifest.pageCount,
    description: manifest.blurb,
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="pagehead">
        <div className="wrap">
          <h1 className="script">{manifest.title}</h1>
            <CommentLink subject={manifest.title} returnTo={`/read/${slug}`} returnLabel={manifest.title} />
          <p className="plain">
            {manifest.blurb} {manifest.pageCount} pages. Read it right here, or download the PDF to keep.
          </p>
        </div>
      </header>
      <section aria-label={`Read ${manifest.title}`}>
        <div className="wrap">
          <BookReader manifest={manifest} />
          {ocrText ? (
            <div className="visually-hidden" aria-label={`Full text of ${manifest.title}`}>
              {ocrText}
            </div>
          ) : null}
          <p style={{ marginTop: "32px" }}>
            <Link className="btn b" href={backHref}>{backLabel}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
