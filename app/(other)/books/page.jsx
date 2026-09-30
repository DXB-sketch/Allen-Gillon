import Link from "next/link";
import SectionComment from "../../../components/SectionComment";
import PurchaseLink from "../../../components/PurchaseLink";
import ShelfPlank from "../../../components/illustrations/ShelfPlank";
import ShelfChimes from "../../../components/illustrations/ShelfChimes";
import ShelfCurtain from "../../../components/illustrations/ShelfCurtain";
import ShelfInkwell from "../../../components/illustrations/ShelfInkwell";
import { stripePaymentLink } from "../../../lib/storefront.mjs";
import { buildShelves, priceLabel, textbookPdf } from "./shelf-data.mjs";
import { pageMetadata } from "../../../lib/seo.mjs";
import { book as bookSchema, collectionPage, jsonLdProps } from "../../../lib/schema.mjs";
// Workers have no runtime filesystem: the book list and manifests are
// imported so they are bundled at build time.
import bookIndex from "../../../public/books/index.json";
import breakoutManifest from "../../../public/books/breakout/manifest.json";
import funnyFahManifest from "../../../public/books/funny-fah-learns-when-to-stop/manifest.json";
import imaginativeMeeManifest from "../../../public/books/imaginative-little-mee/manifest.json";
import hiDohManifest from "../../../public/books/little-hi-doh/manifest.json";
import littleRayManifest from "../../../public/books/little-ray/manifest.json";
import meltingPotManifest from "../../../public/books/melting-pot/manifest.json";
import otherMansGrassManifest from "../../../public/books/the-other-mans-grass/manifest.json";
import sherwoodManifest from "../../../public/books/three-heroes-of-sherwood/manifest.json";
import calamityJaneManifest from "../../../public/books/tribute-to-calamity-jane/manifest.json";
import "./books.css";

export const metadata = pageMetadata("other", "/books");

/* Every title with pages to read here gets a Book node: stories and
   textbooks are free (status "free", with the PDF), plays are previews
   (status "preview") with the A$1 offer. A title that cannot be read here
   (the old closed textbook shape, or no pages shown) gets none. */
const readable = (b) =>
  (b.status === undefined || b.status === "free" || b.status === "preview") && b.shownPages !== 0;

/* The shelves as one collection, then a Book for each readable title. Audio
   stays on each /read page, which owns the audiobooks and the play previews.
   Images are b.cover: p001.webp once a book has page images, the scan until
   then. */
function booksJsonLd({ stories, plays, textbooks }) {
  const all = [...stories, ...plays, ...textbooks];
  return [
    collectionPage(
      all.map((b) => ({ url: `/read/${b.slug}`, name: b.title, image: b.cover })),
      { url: "/books", name: "Stories, plays and textbooks", site: "other" },
    ),
    ...all.filter(readable).map((b) =>
      bookSchema({
        slug: b.slug,
        title: b.title,
        section: b.section,
        blurb: b.blurb,
        cover: b.cover,
        pageCount: b.section === "plays" ? b.fullPages : b.pageCount || undefined,
        // Stories and textbooks only, by the same rule as the shelf's PDF link.
        downloadUrl: b.section === "plays" ? undefined : textbookPdf(b) || undefined,
      }),
    ),
  ];
}

/* One book standing on the shelf. The cover is a second, mouse-only way into
   the same place as the book's action link, so it is hidden from the keyboard
   and screen readers (the title and the link say it all). The plank under
   each book joins its neighbours into one drawn shelf. */
function Book({ book, index, href, ground, children }) {
  return (
    <li className="book">
      <Link prefetch={false} className="book-cover" href={href} tabIndex={-1} aria-hidden="true">
        <img src={book.cover} width={book.aspect[0]} height={book.aspect[1]} loading="lazy" decoding="async" alt="" />
      </Link>
      <ShelfPlank className="shelf-plank" grain={index} ground={ground} draw delay={index * 90} />
      <h3>{book.title}</h3>
      {children}
    </li>
  );
}

const manifests = {
  breakout: breakoutManifest,
  "funny-fah-learns-when-to-stop": funnyFahManifest,
  "imaginative-little-mee": imaginativeMeeManifest,
  "little-hi-doh": hiDohManifest,
  "little-ray": littleRayManifest,
  "melting-pot": meltingPotManifest,
  "the-other-mans-grass": otherMansGrassManifest,
  "three-heroes-of-sherwood": sherwoodManifest,
  "tribute-to-calamity-jane": calamityJaneManifest,
};

export default function BooksPage() {
  const shelves = buildShelves(bookIndex, manifests);
  const { stories, plays, textbooks } = shelves;
  const checkoutOpen = plays.some((book) => stripePaymentLink(`play-${book.slug}`));

  return (
    <div className="writing-page">
      <script {...jsonLdProps(booksJsonLd(shelves))} />
      <header className="writing-head band">
        <h1 className="script">Stories, plays and textbooks</h1>
        <p className="writing-intro">Allen wrote for children, school stages and classrooms. His work is gathered here in one place.</p>
        <nav className="writing-nav" aria-label="Shelves on this page">
          <a href="#stories">Stories</a>
          <a href="#school-plays">Plays</a>
          <a href="#classroom-texts">Textbooks</a>
        </nav>
      </header>

      <section className="shelf-section band" id="stories" aria-labelledby="stories-title">
        <div className="shelf-open stories-open">
          <h2 className="shelf-title" id="stories-title"><span className="shelf-qual">Chinese Chimes</span> <span className="shelf-word">stories</span></h2>
          <p>The characters in these stories are named after the musical scale: Doh, Ray, Mee, Fah, Soh, Lah, Tee, Doh, with an added Hi-Doh and Low-Doh. Here are four of Allen's stories for young readers. Each story contains an important moral, and the name of the Little Chime sometimes highlights it. A teacher or parent can read the eBook online, or watch and listen to the audiobook.</p>
          <ShelfChimes className="shelf-art chimes-art" draw />
        </div>
        <ul className="shelf stories-shelf audiobook-list">
          {stories.map((book, index) => (
            <Book key={book.slug} book={book} index={index} href={`/read/${book.slug}`}>
              <p className="book-blurb">{book.blurb}</p>
              <div className="book-actions">
                <Link prefetch={false} className="book-action" href={`/read/${book.slug}`} aria-label={`Read and listen to ${book.title}`}>Read and listen</Link>
                <Link prefetch={false} className="book-text-link" href={`/read/${book.slug}/text`} aria-label={`Text only version of ${book.title}`}>Text only</Link>
              </div>
            </Book>
          ))}
        </ul>
        <p className="shelf-coda">Doh, Soh, Lah and Tee are still to come.</p>
      </section>

      <section className="shelf-section band" id="school-plays" aria-labelledby="plays-title">
        <div className="shelf-open plays-open">
          <ShelfCurtain className="shelf-art curtain-art" lead="red" draw />
          <h2 className="shelf-title" id="plays-title"><span className="shelf-qual">School</span> <span className="shelf-word">plays</span></h2>
          <p className="plays-lede">Allen wrote these five plays in the 1980s for primary-school end-of-year productions. Each script comes as a PDF.</p>
        </div>
        <ul className="shelf plays-shelf">
          {plays.map((book, index) => {
            const buyHref = stripePaymentLink(`play-${book.slug}`);
            return (
              <Book key={book.slug} book={book} index={index} href={`/read/${book.slug}`}>
                <p className="book-blurb">{book.blurb}</p>
                <p className="book-price"><strong>{priceLabel(book.price)}</strong> <span>script, {book.fullPages} pages</span></p>
                <div className="book-actions">
                  <Link prefetch={false} className="book-action" href={`/read/${book.slug}`} aria-label={`Read a preview of ${book.title}`}>Read a preview</Link>
                  {/* While the storefront gate holds the play links back, the
                      "coming soon" note is said once, in the coda below. */}
                  {buyHref ? <PurchaseLink href={buyHref}>Buy the script<span className="visually-hidden"> of {book.title}</span></PurchaseLink> : null}
                </div>
              </Book>
            );
          })}
        </ul>
        <p className="shelf-coda">
          Read the first pages of any play online before buying it.
          {checkoutOpen
            ? " After checkout, Allen will email the PDF to the address used for payment."
            : " Online checkout is coming soon. After it opens, Allen will email the PDF to the address used for payment."}
        </p>
      </section>

      <section className="shelf-section texts-section band ink" id="classroom-texts" aria-labelledby="texts-title">
        <div className="shelf-open texts-open">
          <h2 className="shelf-title" id="texts-title"><span className="shelf-qual">Classroom</span> <span className="shelf-word">textbooks</span></h2>
          <p>These books come from Allen&rsquo;s twenty-five years of teaching. They were published for use in schools.</p>
          <ShelfInkwell className="shelf-art inkwell-art" ground="ink" draw />
        </div>
        <ul className="shelf texts-shelf">
          {textbooks.map((book, index) => (
            <Book key={book.slug} book={book} index={index} href={`/read/${book.slug}`} ground="ink">
              <p className="book-blurb">{book.blurb}</p>
              <div className="book-actions">
                <Link prefetch={false} className="book-action" href={`/read/${book.slug}`} aria-label={`Read online: ${book.title}`}>Read online</Link>
                {book.pdf ? <a className="book-action" href={book.pdf} download aria-label={`Download PDF of ${book.title}`}>Download PDF</a> : null}
              </div>
            </Book>
          ))}
        </ul>
      </section>

      <div className="band books-comment">
        <SectionComment subject="Stories, plays and textbooks" returnTo="/books" returnLabel="Stories" />
      </div>
    </div>
  );
}
