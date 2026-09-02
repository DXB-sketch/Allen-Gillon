import Link from "next/link";

export const metadata = {
  title: "His Story · Allen Gillon",
  description:
    "The story of Allen and Ann Gillon: The New Breed, Vietnam tours, Page One Revue, television in Bangkok, the Matthew Allen 5, and sixty years of music together.",
};

export default function BiographyPage() {
  return (
    <>
      <style>{String.raw`
  .bio{display:grid;grid-template-columns:1fr 340px;gap:48px;align-items:start;padding:16px 0;}
  .bio aside{display:flex;flex-direction:column;gap:20px;position:sticky;top:20px;}
  .bio aside .gx-hero{border:3px solid var(--ink);border-radius:3px;aspect-ratio:4/3;}
  .bio aside figcaption{font-size:.98rem;color:var(--soft);margin-top:6px;}
  .era{font-family:"Dynalight","Times New Roman",cursive;font-size:2.1rem;color:var(--blue);margin:38px 0 8px;line-height:1.1;}
  .era:first-of-type{margin-top:6px;}
  .era.red{color:var(--red);}
  @media (max-width:900px){.bio{grid-template-columns:1fr;}.bio aside{position:static;flex-direction:row;flex-wrap:wrap;}.bio aside figure{flex:1 1 260px;margin:0;}}
  .bio aside figure{margin:0;}
  /* On phones the photo column disappears and each photo sits inline,
     directly under the era title it belongs to. */
  .bio figure.inline{display:none;}
  @media (max-width:640px){
    .pagehead .plain{padding-left:12px;padding-right:4px;}
    .prose{padding-left:12px;padding-right:4px;}
    .prose p{max-width:34ch;}
    .bio aside{display:none;}
    .bio figure.inline{display:block;margin:14px auto 6px;max-width:min(280px,78vw);}
    .bio figure.inline .gx-hero{border:3px solid var(--ink);border-radius:3px;aspect-ratio:4/3;}
    .bio figure.inline figcaption{font-size:.95rem;color:var(--soft);margin-top:6px;text-align:center;}
  }
`}</style>
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">A Timeless Story</h1>
            <p className="plain">Allen met Ann in 1967, when his band The New Breed was playing Parramatta. From that night on, their lives merged into one long tour of music, singing, travel and family.</p>
          </div>
        </header>

        <section>
          <div className="wrap bio">
            <div className="prose">
              <h2 className="era">The New Breed</h2>
              <figure className="inline">
                <img className="gx-hero" src="/images/personal/current-portrait-allen-2026.jpg" alt="Allen Gillon at Bribie Island" loading="lazy" />
                <figcaption>Allen today, Bribie Island.</figcaption>
              </figure>
              <p>Allen was a qualified teacher and Ann a psychiatric nurse, but music became the love of their lives. New management soon had The New Breed playing venues in Sydney, Mount Isa and Melbourne, then took them to Vietnam for an exciting and dangerous six-month tour of the war. While Allen was away, Ann sang with The Fugitives in Sydney hotels.</p>
              <p>After that tour, Allen and Ann were married in Parramatta in 1968. Management sent The New Breed straight back out: three more months through Vietnam, Guam, Okinawa, South Korea, Taiwan and the Philippines.</p>
              <p>Allen trained at the Sydney Conservatorium of Music in the 1970s, passing orchestral musical arrangement, and became a member of the Musical Arrangers Guild of Australia. In the club and hotel bands of the day, every musician on stage needed a written chart, and Allen wrote them.</p>

              <h2 className="era">Page One Revue</h2>
              <p>A new band followed, Page One Revue. They played the Gold Coast, Melbourne hotels, nine months at the Whiskey Au-Go-Go and a run at The Lido in Melbourne. Then came an eighteen-month tour of Asia: six months at the Siam Intercontinental in Bangkok, then Singapore, Guam, Okinawa, South Korea, Saipan and three months playing private clubs in Japan.</p>
              <p>In Bangkok, Page One Revue had their own weekly half-hour Countdown television show. Ann did voice-overs, radio and newspaper spreads for Ford, and played an English doctor in a Thai film in 1971.</p>

              <h2 className="era">Ann and Allen Ray</h2>
              <figure className="inline">
                <img className="gx-hero" src="/images/personal/performance-ann-and-allen-onstage.jpg" alt="Ann and Allen performing on stage" loading="lazy" />
                <figcaption>Ann and Allen on stage.</figcaption>
              </figure>
              <p>Back home, they left band work and became a duet, Ann and Allen Ray, playing all the big Sydney clubs alongside the top acts of the day. By invitation, they performed on stage at the Chicago Theatre for a convention of three thousand delegates.</p>
              <p>Through the seventies and eighties they set aside time for their family of four beautiful children, and Allen combined the duet with his first occupation, teaching school.</p>

              <h2 className="era red">The Matthew Allen 5</h2>
              <figure className="inline">
                <img className="gx-hero" src="/images/personal/matthew-allen-5-band-photo.jpg" alt="The Matthew Allen 5 band" loading="lazy" />
                <figcaption>The Matthew Allen 5.</figcaption>
              </figure>
              <p>The family moved to the Gold Coast in 1990 when their son Matthew became sick. Matthew, their beautiful fifteen-year-old, died of cancer in February 1991. In his honour the family formed a band called The Matthew Allen 5, later known as the MA 5. Through the nineties this first-class band worked the corporate venues and clubs of the Gold Coast, Brisbane and the Sunshine Coast.</p>

              <h2 className="era">Timeless</h2>
              <figure className="inline">
                <img className="gx-hero" src="/images/personal/allen-playing-red-gibson-waterfront.jpg" alt="Allen playing his red Gibson on the waterfront" loading="lazy" />
                <figcaption>Allen and the Gibson, on the water.</figcaption>
              </figure>
              <p>Allen and Ann remain close to their three now-married children. Allen still plays the Trini Lopez Gibson he bought in Parramatta in 1967. Ann still sings lead, and plays alto sax and flute. As the duet Timeless, they especially love entertaining diners in restaurants around Bribie Island, which is exactly where you can <Link href="/hire">book them</Link>.</p>
            </div>

            <aside aria-label="Photographs">
              <figure>
                <img className="gx-hero" src="/images/personal/current-portrait-allen-2026.jpg" alt="Allen Gillon at Bribie Island" loading="lazy" />
                <figcaption>Allen today, Bribie Island.</figcaption>
              </figure>
              <figure>
                <img className="gx-hero" src="/images/personal/matthew-allen-5-band-photo.jpg" alt="The Matthew Allen 5 band" loading="lazy" />
                <figcaption>The Matthew Allen 5.</figcaption>
              </figure>
              <figure>
                <img className="gx-hero" src="/images/personal/performance-ann-and-allen-onstage.jpg" alt="Ann and Allen performing on stage" loading="lazy" />
                <figcaption>Ann and Allen on stage.</figcaption>
              </figure>
              <figure>
                <img className="gx-hero" src="/images/personal/allen-playing-red-gibson-waterfront.jpg" alt="Allen playing his red Gibson on the waterfront" loading="lazy" />
                <figcaption>Allen and the Gibson, on the water.</figcaption>
              </figure>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
