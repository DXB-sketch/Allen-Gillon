import Link from "next/link";
import CrossSiteLink from "../../components/CrossSiteLink";
import Headstock from "../../components/illustrations/Headstock";
import Record from "../../components/illustrations/Record";
import OpenBook from "../../components/illustrations/OpenBook";
import HomeUmbrella from "../../components/illustrations/HomeUmbrella";
import HomeStar from "../../components/illustrations/HomeStar";
import { CROSS_LINK } from "../../lib/sites.mjs";
import "./home.css";

export const metadata = {
  title: { absolute: "Allen Gillon" },
  description:
    "Allen Gillon is a guitarist from Bribie Island, Queensland. Listen to his albums or book him for a venue.",
};

// The hero photo is the page's LCP image: preloaded at high priority, with its
// intrinsic size set so nothing shifts while it loads.
const HERO = {
  src: "/images/personal/allen-playing-red-gibson-waterfront.jpg",
  width: 600,
  height: 600,
};

// The venue handbill: each name printed in one of the two inks, at one of
// three sizes, set in three lines (the fourth field starts a line), so the
// list reads as a letterpress bill rather than a row of tags.
const VENUES = [
  ["Serenity Cafe", "l", "r", true],
  ["Sunset Pier Cafe", "m", "b"],
  ["Cafe 191", "m", "r"],
  ["Coffee Club", "s", "b", true],
  ["Steakout Restaurant", "l", "r"],
  ["The Jetty", "m", "b"],
  ["Bowls Club", "m", "r", true],
  ["Sandstone Tavern", "l", "b"],
];

export default function Page() {
  const cross = CROSS_LINK.main;
  return (
    <main className="home">
      {/* React hoists this into <head>. */}
      <link rel="preload" as="image" href={HERO.src} fetchPriority="high" />
      <header className="home-hero band">
        <h1 className="script">
          <span className="home-name">Allen</span> <span className="home-name">Gillon</span>
        </h1>
        <div className="home-photo" data-reader-skip>
          <img
            src={HERO.src}
            width={HERO.width}
            height={HERO.height}
            fetchPriority="high"
            alt="Allen playing his red Gibson on the Bribie Island waterfront"
          />
        </div>
        <p className="home-intro">
          Allen plays smooth guitar in restaurants around Bribie Island. There is no microphone and no fuss, just his Gibson at a comfortable dinner volume. Diners have called the music &ldquo;beautiful&rdquo; and &ldquo;unforgettable&rdquo;.
        </p>
      </header>

      <nav className="home-doorways band" aria-label="Allen's music">
        <div className="home-doors">
          <Link className="door" href="/hire">
            <Headstock className="door-art door-art--headstock" draw />
            <span className="door-word">Bookings</span>
            <span className="door-line">Solo guitar for restaurants and private bookings</span>
          </Link>
          <Link className="door" href="/music">
            <Record className="door-art door-art--record" draw delay={150} />
            <span className="door-word">Albums</span>
            <span className="door-line">Four albums to hear free, and his original songs</span>
          </Link>
        </div>
      </nav>

      <section className="home-bill band" aria-labelledby="home-bill-title">
        <div className="bill">
          <h2 id="home-bill-title" className="bill-title">
            Venues where Allen has played
          </h2>
          <ul className="bill-venues">
            {VENUES.map(([name, size, ink, lineStart]) => (
              <li key={name} className={`bill-${size} bill-${ink}${lineStart ? " bill-nl" : ""}`}>
                {!lineStart && <HomeStar className="bill-star" />}
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </div>
        <HomeUmbrella className="bill-umbrella" draw />
      </section>

      <section className="home-quote band" aria-label="From the audience">
        <figure>
          <span className="home-quote-mark" aria-hidden="true">&ldquo;</span>
          <blockquote>
            <p>Popped into the Banksia Beach Art Centre Cafe last Tuesday for their delicious coffee and cakes. Not only did I get that, but was also entertained by solo guitarist Allen Gillon, playing some terrific instrumental music, oldies but goodies. Thoroughly enjoyed it all.</p>
          </blockquote>
          <figcaption>
            <cite>Jan Hanson</cite>
          </figcaption>
        </figure>
        <p className="home-reviews">
          <Link href="/reviews">See Friendly reviews</Link>
        </p>
      </section>

      <aside className="home-cross band" aria-label="Allen's other site">
        <p>
          <OpenBook className="cross-art" />
          <CrossSiteLink site={cross.site} path={cross.path}>
            {cross.label}
          </CrossSiteLink>
        </p>
      </aside>
    </main>
  );
}
