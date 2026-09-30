import Link from "next/link";
import CrossSiteLink from "../../../components/CrossSiteLink";
import Headstock from "../../../components/illustrations/Headstock";
import Sideboard from "../../../components/illustrations/Sideboard";
import SideboardBook from "../../../components/illustrations/SideboardBook";
import SideboardCorner from "../../../components/illustrations/SideboardCorner";
import SideboardFrame from "../../../components/illustrations/SideboardFrame";
import SideboardShelf from "../../../components/illustrations/SideboardShelf";
import { pageMetadata } from "../../../lib/seo.mjs";
import { pageSrcSet } from "../../../lib/books.mjs";
import "./other-home.css";

// "The sideboard": the home page of other.allengillon.com. It is served at "/"
// through the proxy rewrite; /other-home itself returns 301 to "/".
//
// pageMetadata clears metadataBase for "/", so the canonical keeps its
// trailing slash (https://other.allengillon.com/). No page JSON-LD: the
// layout's site graph covers the home page.
export const metadata = pageMetadata("other", "/");

// The open book's two pages paint side by side at the same size. p002 is
// 1003x1000, a touch larger than p001, so it is the LCP element: it gets the
// one preload. Both pages load eagerly at high priority; everything else on
// the sideboard loads lazily.
const LCP = "/books/little-ray/p002.webp";
const FACING = "/books/little-ray/p001.webp";
// Each page is half the book: half the column on a phone, about a sixth of
// the screen on the three-object sideboard. Phones get the 720px copies.
const LCP_SRCSET = pageSrcSet("little-ray", 2, 1003);
const FACING_SRCSET = pageSrcSet("little-ray", 1, 1000);
const PAGE_SIZES = "(min-width: 820px) 16vw, calc(50vw - 16px)";

// Three objects standing on one drawn sideboard, each a single link: an open
// Chime Time Stories book, a framed painting of Ann's, and a 1968 photo held
// in an album mount by photo corners. The pictures are decoration inside the
// link (alt=""); the label text names the link.
export default function OtherHome() {
  return (
    <div className="sideboard band">
      {/* React hoists this into <head>. */}
      <link rel="preload" as="image" href={LCP} imageSrcSet={LCP_SRCSET} imageSizes={PAGE_SIZES} fetchPriority="high" />
      <header className="sideboard-head">
        <h1 className="script">More on Allen</h1>
        <p>Allen&rsquo;s personal side: family, writing, Timeless and Ann&rsquo;s art.</p>
      </header>

      <div className="doorways">
        <Link prefetch={false} className="doorway doorway-book" href="/books">
          <span className="doorway-label">
            <span className="doorway-title">Stories</span>
            <span className="doorway-sub">Chinese Chimes, plays and textbooks</span>
          </span>
          <span className="doorway-object" aria-hidden="true">
            <span className="book-pages">
              <img src={FACING} srcSet={FACING_SRCSET} sizes={PAGE_SIZES} alt="" width="1000" height="1000" fetchPriority="high" />
              <img src={LCP} srcSet={LCP_SRCSET} sizes={PAGE_SIZES} alt="" width="1003" height="1000" fetchPriority="high" />
            </span>
            <SideboardBook className="book-edges" />
          </span>
          <SideboardShelf className="doorway-shelf" draw />
        </Link>

        <Link prefetch={false} className="doorway doorway-frame" href="/anns-art">
          <span className="doorway-label">
            <span className="doorway-title">Ann Gillon</span>
            <span className="doorway-sub">Ann&rsquo;s original paintings</span>
          </span>
          <span className="doorway-object" aria-hidden="true">
            {/* A small derivative of gallery/426502619623139.webp (541KB), made for
                this doorway. Swap to the Ann's art 480/960 variants once they exist. */}
            <img
              src="/images/sideboard/ann-painting-480.webp"
              srcSet="/images/sideboard/ann-painting-480.webp 480w, /images/sideboard/ann-painting-960.webp 960w"
              sizes="(min-width: 820px) 20vw, 50vw"
              alt=""
              width="480"
              height="481"
              loading="lazy"
              decoding="async"
            />
            <SideboardFrame className="frame-drawing" />
          </span>
          <SideboardShelf className="doorway-shelf" draw />
        </Link>

        <Link prefetch={false} className="doorway doorway-photo" href="/biography">
          <span className="doorway-label">
            <span className="doorway-title">Timeless</span>
            <span className="doorway-sub">Allen and Ann&rsquo;s story</span>
          </span>
          <span className="doorway-object" aria-hidden="true">
            <span className="photo-print">
              <img
                src="/images/personal/page-one-revue-1968-whiskey-a-go-go.jpg"
                alt=""
                width="678"
                height="506"
                loading="lazy"
                decoding="async"
              />
              <SideboardCorner className="corner corner-tl" />
              <SideboardCorner className="corner corner-tr" />
              <SideboardCorner className="corner corner-br" />
              <SideboardCorner className="corner corner-bl" />
            </span>
            <span className="photo-caption">1968</span>
          </span>
          <SideboardShelf className="doorway-shelf" draw />
        </Link>
      </div>
      <Sideboard className="sideboard-drawing" draw />

      <p className="sideboard-back">
        <Headstock className="back-headstock" lead="red" />
        <CrossSiteLink site="main" path="/">
          Allen&rsquo;s music, bookings and albums are on allengillon.com
        </CrossSiteLink>
      </p>
    </div>
  );
}
