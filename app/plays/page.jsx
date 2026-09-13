import CommentLink from "../../components/CommentLink";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

export const metadata = {
  title: "School Plays · Allen Gillon",
  description:
    "Five school plays written and performed, free of charge and copyright, plus classroom communication textbooks, by Allen Gillon, qualified teacher.",
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
  .texts .ruled li{padding:16px 0;}
  .texts h3{font-size:1.3rem;}
  .texts .ruled p{margin:4px 0 0;color:var(--soft);font-size:1.05rem;max-width:56ch;}
  .plays .btnrow,.texts .btnrow{margin-top:14px;}
  .btnrow{display:flex;gap:12px;flex-wrap:wrap;}
`}</style>
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">School Plays</h1>
            <p className="plain">Five plays written in the 1980s for primary-school end-of-year productions, and all performed on real school stages. Written by a teacher who knows what holds a class and what fills a hall. Allen offers the scripts free of charge and free of copyright.</p>
          </div>
        </header>

        <section aria-label="The five plays">
          <div className="wrap">
            <ol className="ruled plays">
              {plays.map((play, i) => (
                <li key={play.slug}>
                  <span className="pno">{i + 1}</span>
                  <div>
                    <h3>{play.title}</h3>
                    <p>{play.blurb} {play.pageCount} pages. Age band, cast size and running time to be listed here.</p>
                    <div className="btnrow">
                      <CommentLink subject={play.title} returnTo="/plays" returnLabel="School Plays" />
                      <Link className="btn b" href={`/read/${play.slug}`}>Read online</Link>
                      <a className="btn" href={`/books/${play.slug}/${play.slug}.pdf`} download>Download PDF</a>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="note">
              <p>Teachers: Allen gives these scripts away free. Read any play right here, or download the PDF to print and hand out. Age band, cast size, running time and classroom notes will be added as Allen supplies them. For anything else, <Link href="/hire">get in touch</Link>.</p>
            </div>
          </div>
        </section>

        <section className="texts" aria-label="Classroom textbooks">
          <div className="wrap">
            <h2 className="script">Classroom Textbooks</h2>
            <p className="plain" style={{ marginTop: "6px" }}>Alongside the plays, Allen wrote classroom texts used by teachers and pupils across twenty-five years of teaching. These titles were published by educational publishers, so they are listed here rather than offered to read or download.</p>
            <ul className="ruled" aria-label="Published classroom texts">
              {teaching.map((book) => (
                <li key={book.slug}>
                  <h3>{book.title}</h3>
                  <CommentLink subject={book.title} returnTo="/plays" returnLabel="Classroom Textbooks" />
                  <p>{book.blurb} A published title, available to schools through its publisher. <Link href="/hire">Get in touch</Link> for help finding a copy.</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
