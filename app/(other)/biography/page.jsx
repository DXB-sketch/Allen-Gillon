import Link from "next/link";
import CrossSiteLink from "../../../components/CrossSiteLink";
import TimelessCurtain from "../../../components/illustrations/TimelessCurtain";
import TimelessGibson from "../../../components/illustrations/TimelessGibson";
import TimelessMics from "../../../components/illustrations/TimelessMics";
import TimelessCorner from "../../../components/illustrations/TimelessCorner";
import "./biography.css";

export const metadata = {
  title: "Timeless",
  description:
    "Allen and Ann Gillon have made music together for many years. This is their story.",
};

// Timeless (/biography) on other.allengillon.com. The eras are laid out as
// scenes: a large Dynalight year in the outer margin, the text at the
// measure, and photos held by scrapbook corners that bleed off alternating
// sides. Every photo and the video render once. The Matthew Allen 5 scene
// stays quiet: no year, no drawing, no corners, no bleed.

const CORNERS = { left: ["tl", "bl"], right: ["tr", "br"], all: ["tl", "tr", "br", "bl"] };

/** A photo in the scrapbook: corners on the given side (the side on the page). */
function Snap({ src, alt, width, height, caption, corners, className = "", eager = false }) {
  return (
    <figure className={`snap ${className}`.trim()}>
      <span className="snap-print">
        <img src={src} alt={alt} width={width} height={height} loading={eager ? "eager" : "lazy"} decoding="async" />
        {corners && CORNERS[corners].map((c) => <TimelessCorner key={c} className={`snap-corner snap-corner--${c}`} />)}
      </span>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default function BiographyPage() {
  return (
    <main className="timeless">
      <header className="pagehead band timeless-head">
        <TimelessCurtain className="bleed" />
        <h1 className="script">Timeless</h1>
        <p className="plain">Allen met Ann in 1967 while his band, The New Breed, was playing in Parramatta. They have shared a life in music ever since.</p>
      </header>

      <div className="bio">
        <section className="scene band scene--r" aria-labelledby="era-new-breed">
          <div className="prose">
            <p className="scene-year">1967</p>
            <div className="scene-text">
              <h2 id="era-new-breed">The New Breed</h2>
              <p>Allen was a qualified teacher and Ann a psychiatric nurse, but music became the love of their lives. New management soon had The New Breed playing venues in Sydney, Mount Isa and Melbourne, then took them to Vietnam for an exciting and dangerous six-month tour of the war. While Allen was away, Ann sang with The Fugitives in Sydney hotels.</p>
              <p>After that tour, Allen and Ann were married in Parramatta in 1968. Management sent The New Breed straight back out: three more months through Vietnam, Guam, Okinawa, South Korea, Taiwan and the Philippines.</p>
              <p>While living in NSW in the 1970&rsquo;s, Allen attended Sydney Conservatorium of Music, achieving a pass in orchestral musical arrangement. He also received recognition as a member of MAGA, (Musical Arrangers Guild of Australia). (Club and Hotel Bands back then required charts for each musician on stage.)</p>
            </div>
          </div>
          <div className="scene-media scene-media--art">
            <TimelessGibson className="scene-art scene-art--gibson" draw />
          </div>
        </section>

        <section className="scene band scene--l" aria-labelledby="era-page-one">
          <div className="prose">
            <p className="scene-year">1968</p>
            <div className="scene-text">
              <h2 id="era-page-one">Page One Revue</h2>
              <p>A new band followed, Page One Revue. They played the Gold Coast, Melbourne hotels, nine months at the Whiskey Au-Go-Go and a run at The Lido in Melbourne. Then came an eighteen-month tour of Asia: six months at the Siam Intercontinental in Bangkok, then Singapore, Guam, Okinawa, South Korea, Saipan and three months playing private clubs in Japan.</p>
              <p>In Bangkok, Page One Revue had a weekly half-hour television show called Countdown. Ann recorded voice-overs, appeared in Ford advertising and played an English doctor in a Thai film in 1971.</p>
            </div>
          </div>
          <div className="scene-media">
            <Snap
              className="snap--bleed"
              corners="right"
              src="/images/personal/page-one-revue-1968-whiskey-a-go-go.jpg"
              width={678}
              height={506}
              alt="A faded colour photo of six young musicians posing outdoors with the sea behind them. Ann stands in the middle in a long white dress; the five men wear matching white lace shirts, one holding a saxophone and one a red electric guitar."
              caption="Page One Revue, 1968."
            />
          </div>
          <Snap
            className="snap--inset scene-inset"
            corners="all"
            src="/images/personal/ann-singing-page-one-revue.jpg"
            width={506}
            height={678}
            alt="A black and white print of a young Ann with long dark hair, singing into a microphone on a stand in a patterned halter-neck dress, with a curtain behind her."
            caption="Ann singing."
          />
        </section>

        <section className="scene band scene--r" aria-labelledby="era-ray">
          <div className="prose">
            <p className="scene-year">1970s</p>
            <div className="scene-text">
              <h2 id="era-ray">Ann and Allen Ray</h2>
              <p>Back home, they left band work and became a duet, Ann and Allen Ray, playing all the big Sydney clubs alongside the top acts of the day, Col Joy and the Joy Boys, Little Patty, Tony Pantano. By invitation, they performed on stage at the Chicago Theatre for a convention of three thousand delegates.</p>
              <p>Through the seventies and eighties they set aside time for their family of four beautiful children, and Allen combined the duet with his first occupation, teaching school.</p>
            </div>
          </div>
          <div className="scene-media scene-media--art">
            <TimelessMics className="scene-art scene-art--mics" draw />
          </div>
        </section>

        <section className="scene band scene--quiet" aria-labelledby="era-ma5">
          <div className="prose">
            <div className="scene-text">
              <h2 id="era-ma5">The Matthew Allen 5</h2>
              <p>The family moved to the Gold Coast in 1990 when their son Matthew became sick. Matthew, their beautiful fifteen-year-old, died of cancer in February 1991. In his honour the family formed a band called The Matthew Allen 5, later known as the MA 5. Through the nineties this first-class band worked the corporate venues and clubs of the Gold Coast, Brisbane and the Sunshine Coast. <CrossSiteLink site="main" path="/shows">Learn more about the Matthew Allen 5</CrossSiteLink>.</p>
            </div>
          </div>
          <figure className="quiet-photo">
            <img
              src="/images/personal/matthew-allen-5-band-photo.jpg"
              width={1080}
              height={1080}
              loading="lazy"
              decoding="async"
              alt={"A promotional card for The Matthew Allen Five: five smiling band members, a teenage boy holding a saxophone in the middle, beside large red letters reading “MA 5 Live!”. The text below reads: “‘Matthew Allen 5’ opened the concert for Philippino singing Superstar Nora Aunor when she visited Brisbane in 1995. MA 5 stole the show!”"}
            />
            <figcaption>The Matthew Allen 5.</figcaption>
          </figure>
        </section>

        <section className="scene band scene--l scene--today" id="timeless" aria-labelledby="era-timeless">
          <div className="prose">
            <p className="scene-year">Today</p>
            <div className="scene-text">
              <h2 id="era-timeless">Timeless</h2>
              <p>Allen and Ann remain close to their three now-married children. Allen still plays the Trini Lopez Gibson he bought in Parramatta in 1967. Ann sings lead and plays piano. She also paints; you can see <Link href="/anns-art">Ann&rsquo;s art here</Link>. As Timeless, they enjoy playing for diners around Bribie Island. You can <CrossSiteLink site="main" path="/hire">book them here</CrossSiteLink>.</p>
              <figure className="scene-video">
                <video
                  controls
                  playsInline
                  preload="none"
                  poster="/videos/allen-steakout-poster.jpg"
                  width={1024}
                  height={576}
                  aria-label="Timeless at Steakout Restaurant: the camera pans across diners to Ann singing and Allen playing guitar. Video, 11 seconds."
                >
                  <source src="/videos/allen-steakout.mp4" type="video/mp4" />
                  <track kind="captions" src="/videos/allen-steakout.en.vtt" srcLang="en" label="English" default />
                  Your browser does not support video playback.
                </video>
                <figcaption>Allen performing at Steakout Restaurant.</figcaption>
              </figure>
            </div>
          </div>
          <div className="scene-media">
            <Snap
              className="snap--bleed"
              corners="right"
              src="/images/personal/performance-ann-and-allen-onstage.jpg"
              width={505}
              height={505}
              alt="Ann, with blonde hair and a black jacket, smiles beside a microphone while Allen, in a black hat and glasses, plays a red semi-hollow electric guitar under blue and pink stage light."
              caption="Ann and Allen on stage."
            />
          </div>
          <Snap
            className="snap--inset scene-inset"
            corners="all"
            src="/images/personal/current-portrait-allen-2026.jpg"
            width={1213}
            height={1599}
            alt="A close-up of Allen smiling, white-haired, in gold-rimmed glasses and a striped shirt."
            caption="Allen today, Bribie Island."
          />
        </section>
      </div>
    </main>
  );
}
