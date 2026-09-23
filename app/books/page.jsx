import CommentLink from "../../components/CommentLink";
import Audiobook from "../../components/Audiobook";
import PurchaseLink from "../../components/PurchaseLink";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { formatAud, playPrice, stripePaymentLink } from "../../lib/storefront.mjs";

export const metadata = {
  title: "Stories, Plays and Textbooks · Allen Gillon",
  description: "Read Allen Gillon's Chinese Chimes stories, school plays and published classroom textbooks.",
};

const stories = [
  { video: "OAu1PmILqeA", title: "Funny Fah Learns When to Stop", readSlug: "funny-fah-learns-when-to-stop", audio: "/audio/chinese-chimes-audiobooks/funny-fah-learns-when-to-stop.mp3" },
  { video: "ZwzVEIQp3Cw", title: "Imaginative Little Mee", readSlug: "imaginative-little-mee", audio: "/audio/chinese-chimes-audiobooks/imaginative-little-mee.mp3" },
  { video: "Ynu-5Rt7Vyw", title: "Hi Doh", readSlug: "little-hi-doh", audio: "/audio/chinese-chimes-audiobooks/hi-doh.mp3" },
  { video: "cEuPWVPPN0o", title: "Little Ray", readSlug: "little-ray", audio: "/audio/chinese-chimes-audiobooks/little-ray.mp3" },
];

const playOrder = ["melting-pot", "the-other-mans-grass", "tribute-to-calamity-jane", "three-heroes-of-sherwood", "breakout"];

const teachingCovers = {
  "practice-in-communication-book-1": "/images/books/practice-in-communication-book-1.webp",
  "practice-in-communication-book-2": "/images/books/practice-in-communication-book-2.webp",
  "riddled-with-language": "/images/books/riddled-with-language.webp",
};

async function readIndex() {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "public", "books", "index.json"), "utf8"));
  } catch {
    return [];
  }
}

export default async function BooksPage() {
  const index = await readIndex();
  const bySlug = Object.fromEntries(index.map((book) => [book.slug, book]));
  const plays = playOrder.map((slug) => bySlug[slug]).filter(Boolean);
  const teaching = index.filter((book) => book.section === "teaching");

  return (
    <main className="writing-page">
      <header className="writing-head">
        <div className="wrap">
          <h1 className="visually-hidden">Allen Gillon&rsquo;s stories, plays and textbooks</h1>
          <nav className="writing-nav" aria-label="Writing sections">
            <Link className="script" href="#stories">Stories</Link>
            <Link className="script" href="#school-plays">Plays</Link>
            <Link className="script" href="#classroom-texts">Textbooks</Link>
          </nav>
          <p className="writing-intro">Allen wrote for children, school stages and classrooms. His work is gathered here in one place.</p>
        </div>
      </header>

      <section className="writing-section" id="stories" aria-labelledby="stories-title">
        <div className="wrap">
          <div className="section-heading">
            <h2 className="script" id="stories-title">Chinese Chimes stories</h2>
            <p>Four stories for young readers, each with a moral. Listen to the audiobooks here or read them online.</p>
          </div>
          <ol className="audiobook-list">
            {stories.map((story, storyIndex) => {
              const book = bySlug[story.readSlug];
              const readable = book && book.status === "free";
              return (
                <li key={story.video}>
                  <span className="audiobook-number" aria-hidden="true">{storyIndex + 1}</span>
                  <div className="audiobook-copy">
                    <h3>{story.title}</h3>
                    <p>Narrated Chinese Chimes audiobook</p>
                    <Audiobook title={story.title} src={story.audio} />
                  </div>
                  <div className="audiobook-actions">
                    <Link className="story-read-link" href={`/read/${story.readSlug}`}>Read the book</Link>
                    <details className="more-menu">
                      <summary aria-label={`More options for ${story.title}`}><span aria-hidden="true">⋯</span></summary>
                      <div className="more-popover">
                        {readable ? <a href={`/books/${story.readSlug}/${story.readSlug}.pdf`} download>Download PDF</a> : null}
                        <a href={`https://www.youtube.com/watch?v=${story.video}`} target="_blank" rel="noreferrer">Original YouTube narration</a>
                        <CommentLink subject={story.title} returnTo="/books#stories" returnLabel="Stories">Comment</CommentLink>
                      </div>
                    </details>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="upcoming-books">
            <h3>More Chinese Chimes stories</h3>
            <p>Doh, Soh, Lah and Tee are still to come.</p>
          </div>
        </div>
      </section>

      <section className="writing-section" id="school-plays" aria-labelledby="plays-title">
        <div className="wrap">
          <div className="section-heading">
            <h2 className="script" id="plays-title">School plays</h2>
            <p>Allen wrote these five plays in the 1980s for primary-school end-of-year productions. Each script costs {formatAud(playPrice)} as a PDF.</p>
          </div>
          <ol className="ruled plays">
            {plays.map((play, indexNumber) => (
              <li key={play.slug}>
                <span className="pno">{indexNumber + 1}</span>
                <div>
                  <h3>{play.title}</h3>
                  <p>{play.blurb} {play.pageCount} pages.</p>
                  <div className="item-actions">
                    <Link className="item-primary-link" href={`/read/${play.slug}`}>Read online</Link>
                    <details className="more-menu">
                      <summary aria-label={`More options for ${play.title}`}><span aria-hidden="true">⋯</span></summary>
                      <div className="more-popover">
                        <PurchaseLink href={stripePaymentLink(`play-${play.slug}`)} pendingLabel={`${formatAud(playPrice)} download. Stripe checkout coming soon`}>Buy the {formatAud(playPrice)} download</PurchaseLink>
                        <CommentLink subject={play.title} returnTo="/books#school-plays" returnLabel="School Plays">Comment</CommentLink>
                      </div>
                    </details>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="note"><p>Read a play online before buying it. After checkout, Allen will email the PDF to the address used for payment.</p></div>
        </div>
      </section>

      <section className="writing-section" id="classroom-texts" aria-labelledby="texts-title">
        <div className="wrap">
          <div className="section-heading">
            <h2 className="script" id="texts-title">Classroom texts</h2>
            <p>These books come from Allen&rsquo;s twenty-five years of teaching. They were published for use in schools.</p>
          </div>
          <ul className="ruled texts-list" aria-label="Published classroom texts">
            {teaching.map((book) => (
              <li key={book.slug}>
                <a className="cover-link" href={teachingCovers[book.slug]} target="_blank" rel="noreferrer" aria-label={`View the front cover of ${book.title} at full size`}>
                  <img className="text-cover" src={teachingCovers[book.slug]} width="1000" height="1414" loading="lazy" alt={`Original front cover of ${book.title}`} />
                </a>
                <div>
                  <h3>{book.title}</h3>
                  <p>{book.blurb} Contact Allen if you would like help finding a copy.</p>
                  <div className="item-actions">
                    <Link className="item-primary-link" href={`/read/${book.slug}`}>View details</Link>
                    <details className="more-menu">
                      <summary aria-label={`More options for ${book.title}`}><span aria-hidden="true">⋯</span></summary>
                      <div className="more-popover">
                        <CommentLink subject={book.title} returnTo="/books#classroom-texts" returnLabel="Classroom Texts">Comment</CommentLink>
                      </div>
                    </details>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
