import Link from "next/link";

export const metadata = {
  title: "Allen Gillon",
  description:
    "Allen Gillon: guitarist, songwriter, author and playwright from Bribie Island, Queensland. Hear his albums free, hire him for a gig, and read his story.",
};

export default function Page() {
  return (
    <>
      <style>{String.raw`
  .hero{padding:28px 0 24px;}
  .hero h1{text-align:center;margin:0 0 30px;}
  .heroGrid{display:grid;grid-template-columns:1.05fr 1fr;gap:44px;align-items:start;}
  .heroGrid .gx-hero{border:3px solid var(--ink);border-radius:3px;aspect-ratio:1/1;}
  .heroIntro{font-size:1.1rem;margin:14px 0 0;max-width:52ch;}
  .hero .say{font-size:1.25rem;max-width:48ch;margin:16px 0 0;font-style:italic;color:var(--soft);}
  .hero .click{font-size:1.1rem;font-style:italic;color:var(--soft);margin:0 0 4px;}

  ol.idx{list-style:none;margin:0;padding:0;border-top:var(--rule);border-bottom:var(--rule);}
  ol.idx li{display:flex;align-items:center;gap:18px;}
  ol.idx .no{font-family:"Dynalight","Times New Roman",cursive;font-size:2rem;color:var(--red);min-width:1.4ch;text-align:right;line-height:1;}
  ol.idx a{flex:1;display:flex;flex-direction:column;justify-content:center;gap:2px;
    text-decoration:none;min-height:72px;padding:12px 0;font-size:1.3rem;line-height:1.25;}
  ol.idx a:hover{color:var(--red);}
  ol.idx a small{font-size:1rem;color:var(--soft);}
  .idx-art{width:84px;height:84px;flex:0 0 auto;margin:8px 0;}
  .idx-art img{width:100%;height:100%;object-fit:cover;display:block;border:2px solid var(--ink);border-radius:2px;}
  .idx-empty{width:84px;height:84px;flex:0 0 auto;margin:8px 0;border:2px solid var(--ink);border-radius:2px;
    background:oklch(0.94 0.030 33 / 0.6);}
  li:nth-child(even) .idx-empty{background:oklch(0.94 0.028 262 / 0.55);}

  ol.idx li:nth-child(even) .no{color:var(--blue);}

  @media (max-width:860px){
    .heroGrid{grid-template-columns:1fr;gap:28px;}
    ol.idx a{font-size:1.18rem;min-height:64px;}
    .idx-art,.idx-empty{width:68px;height:68px;}
  }
`}</style>
      <main>
        <header className="hero">
          <div className="wrap">
            <h1 className="script">Allen Gillon</h1>
            <div className="heroGrid">
              <div>
                <img
                  className="gx-hero"
                  src="/images/personal/allen-playing-red-gibson-waterfront.jpg"
                  alt="Allen playing his red Gibson on the Bribie Island waterfront"
                />
                <p className="say">
                  Guitarist, songwriter, author and playwright. Sixty years of
                  making things, gathered on one page. The music comes free.
                </p>
                <p className="heroIntro">
                  Allen is a popular guitarist, providing upmarket restaurants
                  and their visiting diners with smooth guitar memories. No
                  microphones needed, just listen to the professional solo
                  Gibson guitar. Client&rsquo;s comments include,
                  &ldquo;Beautiful!&rdquo;, &ldquo;Unforgettable!&rdquo;,
                  &ldquo;I love Al&rsquo;s light jazz&rdquo;, &ldquo;Pour me
                  another glass!&rdquo;.
                </p>
                <p className="heroIntro">
                  Read Allen and Ann&rsquo;s life story on the{" "}
                  <Link href="/biography">Timeline</Link>.
                </p>
              </div>
              <div>
                <p className="click">Click on your interest.</p>
                <ol className="idx">
                  <li>
                    <span className="no">1</span>
                    <span className="idx-art">
                      <img
                        src="/images/albums/album-thats-the-time.jpg"
                        alt="That's The Time album cover"
                      />
                    </span>
                    <Link href="/music">
                      Listen Free{" "}
                      <small>
                        Four albums to hear free, and his original songs
                      </small>
                    </Link>
                  </li>
                  <li>
                    <span className="no">2</span>
                    <span className="idx-art">
                      <img
                        src="/images/personal/promo-allen-gillon-guitarist-gibson.jpg"
                        alt=""
                      />
                    </span>
                    <Link href="/hire">
                      Shows{" "}
                      <small>
                        Restaurant guitarist, jazz for dining rooms, functions
                        and events
                      </small>
                    </Link>
                  </li>
                  <li>
                    <span className="no">3</span>
                    <span className="idx-empty" aria-hidden="true"></span>
                    <Link href="/books">
                      Children's Books{" "}
                      <small>
                        Storybooks written by Allen, read-along recordings on
                        the way
                      </small>
                    </Link>
                  </li>
                  <li>
                    <span className="no">4</span>
                    <span className="idx-empty" aria-hidden="true"></span>
                    <Link href="/plays">
                      School Plays{" "}
                      <small>
                        Five plays written and performed, plus classroom
                        textbooks
                      </small>
                    </Link>
                  </li>
                  <li>
                    <span className="no">5</span>
                    <span className="idx-art">
                      <img
                        src="/images/personal/matthew-allen-5-band-photo.jpg"
                        alt=""
                      />
                    </span>
                    <Link href="/biography">
                      A Timeless Story{" "}
                      <small>
                        Bandleader, Vietnam tours, television in Bangkok, and
                        family
                      </small>
                    </Link>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </header>
      </main>
    </>
  );
}
