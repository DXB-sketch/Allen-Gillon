import Link from "next/link";

export const metadata = {
  title: "School Plays · Allen Gillon",
  description:
    "Five school plays written and performed, plus classroom communication textbooks, by Allen Gillon, qualified teacher.",
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
`}</style>
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">School Plays</h1>
            <p className="plain">Five plays written for primary-school performers, roughly ages ten to thirteen, and performed on real school stages. Written by a teacher who knows what holds a class and what fills a hall.</p>
          </div>
        </header>

        <section aria-label="The five plays">
          <div className="wrap">
            <ol className="ruled plays">
              <li><span className="pno">1</span><div><h3>Play one</h3><p>Title, age band, cast size and running time are being confirmed with Allen and will be listed here, with a sample scene to read.</p></div></li>
              <li><span className="pno">2</span><div><h3>Play two</h3><p>Details to come.</p></div></li>
              <li><span className="pno">3</span><div><h3>Play three</h3><p>Details to come.</p></div></li>
              <li><span className="pno">4</span><div><h3>Play four</h3><p>Details to come.</p></div></li>
              <li><span className="pno">5</span><div><h3>Play five</h3><p>Details to come.</p></div></li>
            </ol>

            <div className="note">
              <p>Teachers: each play will list its age band, cast size, running time and classroom use, with a scene to read before you commit. If you want to stage one sooner, <Link href="/hire">get in touch</Link>.</p>
            </div>
          </div>
        </section>

        <section className="texts" aria-label="Classroom textbooks">
          <div className="wrap">
            <h2 className="script">Classroom Textbooks</h2>
            <p className="plain" style={{ marginTop: "6px" }}>Alongside the plays, Allen has written communication-skills workbooks designed to be taught straight from the page. Titles, year levels and samples will be listed here.</p>
          </div>
        </section>
      </main>
    </>
  );
}
