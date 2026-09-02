import Link from "next/link";

export const metadata = {
  title: "School Plays · Allen Gillon",
  description:
    "Five school plays written and performed, free of charge and copyright, plus classroom communication textbooks, by Allen Gillon, qualified teacher.",
};

export default function PlaysPage() {
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
              <li><span className="pno">1</span><div><h3>Melting Pot</h3><p>Written for a primary-school end-of-year production, and performed on school stages. Age band, cast size and running time to be listed here.</p></div></li>
              <li><span className="pno">2</span><div><h3>The Other Man&rsquo;s Grass</h3><p>Written for a primary-school end-of-year production, and performed on school stages. Age band, cast size and running time to be listed here.</p></div></li>
              <li><span className="pno">3</span><div><h3>Tribute to Calamity Jane</h3><p>Written for a primary-school end-of-year production, and performed on school stages. Age band, cast size and running time to be listed here.</p></div></li>
              <li><span className="pno">4</span><div><h3>Three Heroes of Sherwood</h3><p>Written for a primary-school end-of-year production, and performed on school stages. Age band, cast size and running time to be listed here.</p></div></li>
              <li><span className="pno">5</span><div><h3>Breakout</h3><p>Written for a primary-school end-of-year production, and performed on school stages. Age band, cast size and running time to be listed here.</p></div></li>
            </ol>

            <div className="note">
              <p>Teachers: Allen gives these scripts away free, in electronic form, to any school that would like to perform them. Age band, cast size, running time and classroom notes will be added here as Allen supplies them. To request a script now, <Link href="/hire">get in touch</Link>.</p>
            </div>
          </div>
        </section>

        <section className="texts" aria-label="Classroom textbooks">
          <div className="wrap">
            <h2 className="script">Classroom Textbooks</h2>
            <p className="plain" style={{ marginTop: "6px" }}>Alongside the plays, Allen wrote classroom texts used by teachers and pupils across twenty-five years of teaching. These titles were published by educational publishers.</p>
            <ul className="ruled" aria-label="Published classroom texts">
              <li>
                <h3>Riddled with Language</h3>
                <p>A comprehension book, published by Modern Teaching Aids.</p>
              </li>
              <li>
                <h3>Practice in Communication, Book 1 and Book 2</h3>
                <p>Classroom discussion, published by Primary Education Publications Pty Ltd.</p>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
