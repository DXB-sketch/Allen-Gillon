import Link from "next/link";

export const metadata = {
  title: "Bookings · Allen Gillon",
  description:
    "Book Allen Gillon, restaurant guitarist, for dining rooms, functions and events around Bribie Island and Queensland.",
};

export default function HirePage() {
  return (
    <>
      <style>{`
  .hireGrid{display:grid;grid-template-columns:1fr 380px;gap:44px;align-items:start;padding:16px 0;}
  .hireGrid .gx-hero{border:3px solid var(--ink);border-radius:3px;aspect-ratio:3/4;}
  .offer{margin:26px 0 0;}
  .offer li{padding:16px 0;display:flex;flex-direction:column;gap:2px;}
  .offer .what{font-size:1.3rem;font-weight:700;}
  .offer .how{color:var(--soft);font-size:1.05rem;max-width:52ch;}
  .offer .ytlinks{display:flex;flex-direction:column;gap:6px;margin-top:4px;}
  .offer .ytlinks a{font-size:1.1rem;}
  .book{margin-top:8px;background:var(--ink);color:var(--on);border-radius:3px;}
  .book .pad{padding:32px 30px 34px;}
  .book h2{margin:0 0 8px;}
  .book p{margin:0 0 12px;font-size:1.1rem;max-width:52ch;}
  .book a{color:var(--on);}
  .phones{display:flex;gap:14px;flex-wrap:wrap;margin-top:16px;}
  .phones a{font-size:1.25rem;font-weight:700;text-decoration:none;border:2px solid var(--on);border-radius:3px;padding:12px 20px;min-height:48px;display:inline-flex;align-items:center;}
  .phones a:hover{background:var(--red);border-color:var(--red);}
  @media (max-width:860px){.hireGrid{grid-template-columns:1fr;}.hireGrid .gx-hero{max-width:340px;}}
  @media (max-width:640px){
    .pagehead .plain{padding-left:12px;padding-right:4px;}
    .offer li{padding-left:12px;padding-right:4px;}
    .offer .how{max-width:34ch;}
    .hireGrid .gx-hero{max-width:min(300px,78vw);margin:0 auto;}
    .book .pad{padding:26px 22px 28px;}
  }
`}</style>
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">Bookings</h1>
            <p className="plain">Live jazz guitar for rooms where people are eating, talking, drinking and enjoying themselves. Allen has been doing exactly this since 1967, and he still loves a full diary.</p>
          </div>
        </header>

        <section aria-label="Bookings">
          <div className="wrap">
            <div className="book">
              <div className="pad">
                <h2 className="script">Book a <span style={{ color: "var(--red)" }}>date</span></h2>
                <p>Speak with Allen directly. Tell him the venue, the date and the sort of night you have in mind. You can also reach Allen on Facebook.</p>
                <div className="phones">
                  <a href="sms:+61438747882">Text 0438 747 882</a>
                  <a href="https://www.facebook.com/people/Allen-Gillon/100011388424486/" target="_blank" rel="noopener">Allen on Facebook</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap hireGrid">
            <div>
              <ul className="ruled offer">
                <li>
                  <span className="what">Restaurant guitarist</span>
                  <span className="how">Solo jazz guitar on the Trini Lopez Gibson he bought in Parramatta in 1967. Standards, bossa and easy listening, at dinner volume. Allen chooses from more than 300 memorised melodies when he plays for customers at restaurants. Many of the backing tracks were written by Allen &mdash; listen to the &ldquo;Desafinado&rdquo; backing track on his album That&rsquo;s The Time. Hear the sound on <Link href="/music">the albums</Link>.</span>
                </li>
                <li>
                  <span className="what">Functions and events</span>
                  <span className="how">Weddings, anniversaries, club nights and private parties around Bribie Island, Brisbane and the Sunshine Coast. Tell him what the occasion needs and he will shape the set to it.</span>
                </li>
                <li>
                  <span className="what">Allen and Ann on youtube</span>
                  <span className="how ytlinks">
                    <a href="https://www.youtube.com/watch?v=MRRzSDKg_hg" target="_blank" rel="noopener">Allen Gillon Cavatina</a>
                    <a href="https://www.youtube.com/watch?v=WKoBhThrn8o" target="_blank" rel="noopener">Allen Gillon Sleep Walk</a>
                    <a href="https://www.youtube.com/watch?v=G7lyKx7fK4s" target="_blank" rel="noopener">Ann Gillon Body and Soul</a>
                    <a href="https://www.youtube.com/watch?v=Bf6CuHArmDw" target="_blank" rel="noopener">Ann Gillon Embraceable You</a>
                  </span>
                </li>
              </ul>
            </div>
            <img className="gx-hero" src="/images/personal/allen-playing-red-gibson-waterfront.jpg" alt="Allen playing his red Gibson on the waterfront" loading="lazy" />
          </div>
        </section>

        <section aria-label="What diners say">
          <div className="wrap">
            <div className="note">
              <p>Heard between courses: &ldquo;Beautiful.&rdquo; &ldquo;Unforgettable.&rdquo; &ldquo;I love Al&rsquo;s light jazz.&rdquo; &ldquo;Pour me another glass.&rdquo;</p>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
