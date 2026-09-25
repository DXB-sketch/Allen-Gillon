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
  .heroPhotos{margin-bottom:18px;}
  .photoCollage{position:relative;aspect-ratio:.88/1;}
  .heroPhotos .mainPhoto{width:78%;border:1px solid var(--ink);aspect-ratio:1/1;object-fit:cover;display:block;box-shadow:7px 8px 0 oklch(0.22 0.02 300 / .1);}
  .heroPhotos .smallPhoto{position:absolute;width:38%;aspect-ratio:4/5;object-fit:cover;border:1px solid var(--ink);background:var(--paper);box-shadow:5px 6px 0 oklch(0.22 0.02 300 / .16);}
  .heroPhotos .photoTwo{right:0;top:8%;transform:rotate(4deg);}
  .heroPhotos .photoThree{right:0;bottom:6%;width:47%;aspect-ratio:1/1;object-position:center;transform:rotate(-5deg);z-index:3;}
  .venueCollage{position:absolute;left:0;bottom:0;width:50%;height:29%;display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(6,1fr);align-items:center;gap:2px 9px;
    line-height:1.05;pointer-events:none;}
  .venueCollage span{font-weight:600;white-space:nowrap;justify-self:start;transform:none;}
  .venueCollage span:nth-child(1){grid-column:1/3;grid-row:1;color:oklch(.49 .12 190);font-family:"Dynalight","Times New Roman",cursive;font-size:1.4rem;}
  .venueCollage span:nth-child(2){grid-column:1/3;grid-row:2;color:oklch(.52 .15 326);font-style:italic;font-size:.78rem;}
  .venueCollage span:nth-child(3){grid-column:1;grid-row:3;color:var(--red);font-family:"Dynalight","Times New Roman",cursive;font-size:1.3rem;}
  .venueCollage span:nth-child(4){grid-column:2;grid-row:3;color:var(--blue);font-size:.66rem;letter-spacing:.035em;text-transform:uppercase;}
  .venueCollage span:nth-child(5){grid-column:1/3;grid-row:4;color:oklch(.52 .13 62);font-style:italic;font-size:.76rem;}
  .venueCollage span:nth-child(6){grid-column:1;grid-row:5;color:var(--red);font-family:"Dynalight","Times New Roman",cursive;font-size:1.15rem;}
  .venueCollage span:nth-child(7){grid-column:2;grid-row:5;color:var(--blue);font-size:.66rem;letter-spacing:.03em;text-transform:uppercase;}
  .venueCollage span:nth-child(8){grid-column:1/3;grid-row:6;color:oklch(.47 .13 145);font-family:"Dynalight","Times New Roman",cursive;font-size:1.2rem;}
  .heroIntro{font-size:1.1rem;margin:24px 0 0;max-width:48ch;}
  .hero .say{font-size:1.25rem;max-width:48ch;margin:16px 0 0;font-style:italic;color:var(--soft);}
  .homeTestimonial{display:grid;grid-template-columns:170px minmax(0,1fr);gap:30px;margin:54px auto 12px;padding-top:30px;border-top:var(--rule);max-width:900px;}
  .testimonialLabel{margin:0;color:var(--blue);font-size:.76rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;}
  .homeTestimonial blockquote{position:relative;margin:0;padding-left:38px;max-width:690px;}
  .homeTestimonial blockquote::before{content:"“";position:absolute;left:0;top:-20px;color:var(--red);font-family:Georgia,serif;font-size:4.3rem;line-height:1;}
  .homeTestimonial blockquote p{margin:0;font-size:1.08rem;line-height:1.65;}
  .homeTestimonial cite{display:block;margin-top:12px;color:var(--soft);font-size:.95rem;font-style:normal;font-weight:700;}
  .reviewsLink{display:inline-flex;align-items:center;gap:9px;margin-top:18px;color:var(--blue);font-weight:700;
    text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px;}
  .reviewsLink span{transition:transform .18s ease;}
  .reviewsLink:hover span,.reviewsLink:focus-visible span{transform:translateX(4px);}

  ol.idx{list-style:none;margin:0;padding:0;border-bottom:var(--rule);}
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
    .photoCollage{aspect-ratio:.88/1;max-width:680px;margin:0 auto;}
    .heroPhotos .mainPhoto{width:76%;}
    .heroPhotos .smallPhoto{width:36%;}
    .heroPhotos .photoThree{right:0;bottom:6%;width:48%;}
    ol.idx a{font-size:1.18rem;min-height:64px;}
    .idx-art,.idx-empty{width:68px;height:68px;}
    .venueCollage{width:49%;height:30%;}
    .homeTestimonial{grid-template-columns:140px minmax(0,1fr);gap:22px;margin-top:46px;}
  }
  @media (max-width:520px){
    .photoCollage{aspect-ratio:.77/1;}
    .heroPhotos .mainPhoto{width:82%;}
    .heroPhotos .photoTwo{width:38%;right:0;top:7%;}
    .heroPhotos .photoThree{width:53%;right:0;bottom:7%;object-position:center;}
    .venueCollage{width:46%;height:33%;gap:2px 6px;}
    .venueCollage span:nth-child(1){font-size:1.15rem;}
    .venueCollage span:nth-child(2),.venueCollage span:nth-child(5){font-size:.62rem;}
    .venueCollage span:nth-child(3){font-size:1.05rem;}
    .venueCollage span:nth-child(4),.venueCollage span:nth-child(7){font-size:.54rem;letter-spacing:.015em;}
    .venueCollage span:nth-child(6){font-size:.98rem;}
    .venueCollage span:nth-child(8){font-size:1rem;}
    .homeTestimonial{grid-template-columns:1fr;gap:12px;margin-top:38px;padding-top:24px;}
    .homeTestimonial blockquote{padding-left:30px;}
    .homeTestimonial blockquote p{font-size:1rem;}
  }
`}</style>
      <main>
        <header className="hero">
          <div className="wrap">
            <h1 className="script">Allen Gillon</h1>
            <div className="heroGrid">
              <div className="heroVisual">
                <div className="heroPhotos" data-reader-skip>
                  <div className="photoCollage">
                    <img
                      className="mainPhoto"
                      src="/images/personal/allen-playing-red-gibson-waterfront.jpg"
                      alt="Allen playing his red Gibson on the Bribie Island waterfront"
                    />
                    <img className="smallPhoto photoTwo" src="/images/personal/allen-playing-chandler-theatre.jpg" alt="Allen playing guitar at Chandler Theatre" />
                    <img className="smallPhoto photoThree" src="/images/personal/current-allen-and-ann-bribie-cap.jpg" alt="Allen and Ann wearing sunglasses at Bribie Island" />
                    <div className="venueCollage" aria-label="Venues where Allen has played">
                      <span>Serenity Cafe</span>
                      <span>Sunset Pier Cafe</span>
                      <span>Cafe 191</span>
                      <span>Coffee Club</span>
                      <span>Steakout Restaurant</span>
                      <span>The Jetty</span>
                      <span>Bowls Club</span>
                      <span>Sandstone Tavern</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <ol className="idx">
                  <li>
                    <span className="no">1</span>
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
                  <li>
                    <span className="no">2</span>
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
                </ol>
                <p className="heroIntro">
                  Allen plays smooth guitar in restaurants around Bribie Island. There is no microphone and no fuss, just his Gibson at a comfortable dinner volume. Diners have called the music &ldquo;beautiful&rdquo; and &ldquo;unforgettable&rdquo;.
                </p>
              </div>
            </div>
            <section className="homeTestimonial" aria-labelledby="testimonial-title">
              <p className="testimonialLabel" id="testimonial-title">From the audience</p>
              <blockquote>
                <p>Popped into the Banksia Beach Art Centre Cafe last Tuesday for their delicious coffee and cakes. Not only did I get that, but was also entertained by solo guitarist Allen Gillon, playing some terrific instrumental music, oldies but goodies. Thoroughly enjoyed it all.</p>
                <cite>Jan Hanson</cite>
                <Link className="reviewsLink" href="/reviews">
                  See Friendly reviews <span aria-hidden="true">&#8594;</span>
                </Link>
              </blockquote>
            </section>
          </div>
        </header>
      </main>
    </>
  );
}
