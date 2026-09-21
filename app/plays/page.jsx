import CommentLink from "../../components/CommentLink";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import PurchaseLink from "../../components/PurchaseLink";
import { formatAud, playPrice, stripePaymentLink } from "../../lib/storefront.mjs";

const teachingCovers = {
  "practice-in-communication-book-1": "/images/books/practice-in-communication-book-1.svg",
  "practice-in-communication-book-2": "/images/books/practice-in-communication-book-2.svg",
  "riddled-with-language": "/images/books/riddled-with-language.svg",
};

export const metadata = {
  title: "School Plays · Allen Gillon",
  description:
    "Five school plays by Allen Gillon, available as $50 AUD file downloads, plus his classroom communication textbooks.",
};

// The order the plays appear on the page (index.json keeps config order).
const playOrder = [
  "melting-pot",
  "the-other-mans-grass",
  "tribute-to-calamity-jane",
  "three-heroes-of-sherwood",
  "breakout",
];

async function readIndex() {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "public", "books", "index.json"), "utf8"));
  } catch {
    return [];
  }
}

export default async function PlaysPage() {
  const index = await readIndex();
  const bySlug = Object.fromEntries(index.map((b) => [b.slug, b]));
  const plays = playOrder.map((slug) => bySlug[slug]).filter(Boolean);
  const teaching = index.filter((b) => b.section === "teaching");

  return (
    <>
      <style>{`
  .plays{margin-top:20px;counter-reset:play;}
  .plays li{display:flex;gap:20px;align-items:baseline;padding:20px 0;}
  .plays .pno{font-family:"Dynalight","Times New Roman",cursive;font-size:2rem;color:var(--red);min-width:1.4ch;text-align:right;line-height:1;}
  .plays h3{font-size:1.4rem;}
  .plays p{margin:6px 0 0;color:var(--soft);font-size:1.05rem;max-width:56ch;}
  .texts{margin-top:64px;}
  .texts .ruled li{display:grid;grid-template-columns:150px 1fr;gap:24px;align-items:start;padding:24px 0;}
  .text-cover{display:block;width:150px;aspect-ratio:2/3;object-fit:cover;border:1px solid var(--ink);box-shadow:4px 5px 0 oklch(0.22 0.02 300 / .14);}
  .texts h3{font-size:1.3rem;}
  .texts .ruled p{margin:4px 0 0;color:var(--soft);font-size:1.05rem;max-width:56ch;}
  .plays .btnrow,.texts .btnrow{margin-top:14px;}
  .btnrow{display:flex;gap:12px;flex-wrap:wrap;}
  @media(max-width:520px){.texts .ruled li{grid-template-columns:100px 1fr;gap:16px}.text-cover{width:100px}}
`}</style>
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">School Plays</h1>
            <p className="plain">Allen wrote these five plays in the 1980s for primary-school end-of-year productions. Each one was performed on a school stage. You can read them online. Each PDF costs {formatAud(playPrice)}.</p>
          </div>
        </header>

        <section id="school-plays" aria-label="The five plays">
          <div className="wrap">
            <ol className="ruled plays">
              {plays.map((play, i) => (
                <li key={play.slug}>
                  <span className="pno">{i + 1}</span>
                  <div>
                    <h3>{play.title}</h3>
                    <p>{play.blurb} {play.pageCount} pages.</p>
                    <div className="btnrow">
                      <CommentLink subject={play.title} returnTo="/plays" returnLabel="School Plays" />
                      <Link className="btn b" href={`/read/${play.slug}`}>Read online</Link>
                      <PurchaseLink href={stripePaymentLink(`play-${play.slug}`)} pendingLabel={`${formatAud(playPrice)} download. Stripe checkout coming soon`}>Buy the {formatAud(playPrice)} download</PurchaseLink>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="note">
              <p>Teachers can read each play online before buying the file. Allen will email the PDF to the address used at checkout. It can be printed for rehearsals and performances. Allen will add age bands, cast sizes, running times and classroom notes when those details are ready. For anything else, <Link href="/hire">get in touch</Link>.</p>
            </div>
          </div>
        </section>

        <section className="texts" id="classroom-texts" aria-label="Classroom texts">
          <div className="wrap">
            <h2 className="script">Classroom Texts</h2>
            <p className="plain" style={{ marginTop: "6px" }}>Allen wrote classroom texts used by teachers and pupils across twenty-five years of teaching. These titles were published by education publishers, so they are listed here rather than offered to read or download.</p>
            <ul className="ruled" aria-label="Published classroom texts">
              {teaching.map((book) => (
                <li key={book.slug}>
                  <img className="text-cover" src={teachingCovers[book.slug]} alt={`Front cover for ${book.title}`} />
                  <div>
                    <h3>{book.title}</h3>
                    <CommentLink subject={book.title} returnTo="/plays" returnLabel="Classroom Texts" />
                    <p>{book.blurb} A published title, available to schools through its publisher. <Link href="/hire">Get in touch</Link> for help finding a copy.</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
