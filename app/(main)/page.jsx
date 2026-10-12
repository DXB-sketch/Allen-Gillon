import Link from "next/link";
import CrossSiteLink from "../../components/CrossSiteLink";
import Headstock from "../../components/illustrations/Headstock";
import Record from "../../components/illustrations/Record";
import OpenBook from "../../components/illustrations/OpenBook";
import HomeUmbrella from "../../components/illustrations/HomeUmbrella";
import HomeStar from "../../components/illustrations/HomeStar";
import HeroPhotos from "../../components/HeroPhotos";
import { CROSS_LINK } from "../../lib/sites.mjs";
import { pageMetadata } from "../../lib/seo.mjs";
import "./home.css";

// Title, description, canonical, Open Graph and twitter card: lib/seo.mjs.
// No page JSON-LD: the layout's site graph covers the home page.
export const metadata = pageMetadata("main", "/");

// The hero photo is the page's LCP image: preloaded at high priority, with its
// intrinsic size set so nothing shifts while it loads.
const HERO = {
  src: "/images/personal/allen-playing-red-gibson-waterfront.jpg",
  width: 600,
  height: 600,
  alt: "Allen playing his red Gibson on the Bribie Island waterfront",
  caption: "Sunset Pier Cafe",
};

// The hero photo cross-fades through these after the page loads
// (components/HeroPhotos.jsx). Each is cropped to the frame's 10:9;
// position keeps the subject in view in the narrower 3:2 crop on phones.
// The caption is printed under the photo and read by the page reader.
const HERO_PHOTOS = [
  HERO,
  {
    src: "/images/personal/allen-grey-hat-on-stage.jpg",
    width: 720,
    height: 648,
    alt: "Allen in a grey hat, playing guitar on a darkened stage",
    position: "50% 20%",
    caption: "Big conference night",
  },
  {
    src: "/images/personal/allen-red-gibson-bigsby-close-up.jpg",
    width: 720,
    height: 648,
    alt: "Close-up of Allen's hands on his red Gibson with its Bigsby tremolo",
    position: "50% 55%",
    caption: "Allen with his extendable tremolo arm",
  },
  {
    src: "/images/personal/allen-black-hat-at-venue.jpg",
    width: 720,
    height: 648,
    alt: "Allen in a black hat, smiling as he plays at a venue",
    position: "50% 30%",
    caption: "\u201CLove is in the air\u201D on Bribie.",
  },
];

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
    <div className="home">
      {/* React hoists this into <head>. */}
      <link rel="preload" as="image" href={HERO.src} fetchPriority="high" />
      <header className="home-hero band">
        <h1 className="script" data-reader-inline>
          <span className="home-name">Allen</span> <span className="home-name">Gillon</span>
        </h1>
        <div className="home-photo">
          <HeroPhotos photos={HERO_PHOTOS} />
        </div>
        <p className="home-intro">
          Allen plays smooth guitar memories in restaurants on Bribie Island. Visiting diners have commented that his music is &ldquo;beautiful&rdquo; and &ldquo;unforgettable&rdquo;.
        </p>
      </header>

      <nav className="home-doorways band" aria-label="Allen's music">
        <div className="home-doors">
          <Link prefetch={false} className="door" href="/hire">
            <Headstock className="door-art door-art--headstock" draw />
            <span className="door-word">Bookings</span>
            <span className="door-line">Solo guitar for restaurants and private bookings</span>
          </Link>
          <Link prefetch={false} className="door" href="/music">
            <Record className="door-art door-art--record" draw delay={150} />
            <span className="door-word">Albums</span>
            <span className="door-line">Play/download plus original songs</span>
          </Link>
        </div>
      </nav>

      <section className="home-bill band" aria-labelledby="home-bill-title" data-reader-skip>
        <div className="bill">
          <h2 id="home-bill-title" className="bill-title">
            Venues
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

      <section className="home-quote band" aria-label="From the audience" data-reader-skip>
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
          <Link prefetch={false} href="/reviews">See Friendly reviews</Link>
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
    </div>
  );
}
