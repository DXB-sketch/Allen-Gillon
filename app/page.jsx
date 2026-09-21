import Link from "next/link";

export const metadata = {
  title: "Allen Gillon",
  description:
    "Allen Gillon is a guitarist from Bribie Island, Queensland. Listen to his albums or book him for a venue.",
};

export default function Page() {
  return (
    <>
      <style>{String.raw`
  .hero{padding:28px 0 24px;}
  .hero h1{text-align:center;margin:0 0 30px;color:var(--blue);text-shadow:none;}
  .heroGrid{display:grid;grid-template-columns:1.05fr 1fr;gap:44px;align-items:start;}
  .heroPhotos{position:relative;min-height:570px;margin-bottom:18px;}
  .heroPhotos .mainPhoto{width:82%;border:3px solid var(--ink);border-radius:3px;aspect-ratio:1/1;object-fit:cover;display:block;}
  .heroPhotos .smallPhoto{position:absolute;width:38%;aspect-ratio:4/5;object-fit:cover;border:3px solid var(--ink);border-radius:3px;background:var(--paper);box-shadow:5px 6px 0 oklch(0.22 0.02 300 / .16);}
  .heroPhotos .photoTwo{right:0;top:12%;transform:rotate(4deg);}
  .heroPhotos .photoThree{right:8%;bottom:0;transform:rotate(-5deg);}
  .heroIntro{font-size:1.1rem;margin:24px 0 0;max-width:48ch;}
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
    .heroPhotos{min-height:0;padding-bottom:18%;}
    .heroPhotos .mainPhoto{width:78%;}
    .heroPhotos .smallPhoto{width:34%;}
    ol.idx a{font-size:1.18rem;min-height:64px;}
    .idx-art,.idx-empty{width:68px;height:68px;}
  }
`}</style>
      <main>
        <header className="hero">
          <div className="wrap">
            <h1 className="script">Allen Gillon</h1>
            <div className="heroGrid">
              <div className="heroPhotos" data-reader-skip>
                <img
                  className="mainPhoto"
                  src="/images/personal/allen-playing-red-gibson-waterfront.jpg"
                  alt="Allen playing his red Gibson on the Bribie Island waterfront"
                />
                <img className="smallPhoto photoTwo" src="/images/personal/allen-playing-chandler-theatre.jpg" alt="Allen playing guitar at Chandler Theatre" />
                <img className="smallPhoto photoThree" src="/images/personal/current-allen-and-ann-bribie-cap.jpg" alt="Allen and Ann wearing sunglasses at Bribie Island" />
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
                      Bookings{" "}
                      <small>
                        Solo guitar for restaurants and private bookings
                      </small>
                    </Link>
                  </li>
                </ol>
                <p className="heroIntro">
                  Allen plays smooth guitar in restaurants around Bribie Island. There is no microphone and no fuss, just his Gibson at a comfortable dinner volume. Diners have called the music &ldquo;beautiful&rdquo; and &ldquo;unforgettable&rdquo;.
                </p>
              </div>
            </div>
          </div>
        </header>
      </main>
    </>
  );
}
