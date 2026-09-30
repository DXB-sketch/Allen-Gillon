import Link from "next/link";
import CrossSiteLink from "../../../components/CrossSiteLink";
import Headstock from "../../../components/illustrations/Headstock";
import Sideboard from "../../../components/illustrations/Sideboard";
import SideboardBook from "../../../components/illustrations/SideboardBook";
import SideboardCorner from "../../../components/illustrations/SideboardCorner";
import SideboardFrame from "../../../components/illustrations/SideboardFrame";
import SideboardShelf from "../../../components/illustrations/SideboardShelf";
import { ogImages } from "../../../lib/og.mjs";
import "./other-home.css";

// "The sideboard": the home page of other.allengillon.com. It is served at "/"
// through the proxy rewrite; /other-home itself returns 301 to "/".
//
// metadataBase is cleared here on purpose: with a metadataBase, vinext (like
// Next) prints a root canonical as the bare origin "https://other.allengillon.com",
// dropping the trailing slash. Without one, absolute URLs are printed exactly
// as written, so every URL in this metadata must stay absolute (ogImages
// returns absolute URLs).
const CANONICAL = "https://other.allengillon.com/";
const OG = ogImages("other", "/");

export const metadata = {
  metadataBase: null,
  title: { absolute: "More on Allen: stories, Timeless and Ann's art" },
  description:
    "Allen Gillon's personal side: stories and school plays for young readers, the Timeless story of Allen and Ann, and Ann Gillon's original paintings.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "More on Allen",
    description:
      "Stories and school plays for young readers, the Timeless story of Allen and Ann, and Ann Gillon's original paintings.",
    url: CANONICAL,
    siteName: "More on Allen",
    locale: "en_AU",
    type: "website",
    images: OG,
  },
  twitter: { card: "summary_large_image", images: OG },
};

// Three objects standing on one drawn sideboard, each a single link: an open
// Chime Time Stories book, a framed painting of Ann's, and a 1968 photo held
// in an album mount by photo corners. The pictures are decoration inside the
// link (alt=""); the label text names the link.
export default function OtherHome() {
  return (
    <main className="sideboard band">
      <header className="sideboard-head">
        <h1 className="script">More on Allen</h1>
        <p>Allen&rsquo;s personal side: family, writing, Timeless and Ann&rsquo;s art.</p>
      </header>

      <div className="doorways">
        <Link className="doorway doorway-book" href="/books">
          <span className="doorway-label">
            <span className="doorway-title">Stories</span>
            <span className="doorway-sub">Chinese Chimes, plays and textbooks</span>
          </span>
          <span className="doorway-object" aria-hidden="true">
            <span className="book-pages">
              <img src="/books/little-ray/p001.webp" alt="" width="1000" height="1000" />
              <img src="/books/little-ray/p002.webp" alt="" width="1003" height="1000" />
            </span>
            <SideboardBook className="book-edges" />
          </span>
          <SideboardShelf className="doorway-shelf" draw />
        </Link>

        <Link className="doorway doorway-frame" href="/anns-art">
          <span className="doorway-label">
            <span className="doorway-title">Ann Gillon</span>
            <span className="doorway-sub">Ann&rsquo;s original paintings</span>
          </span>
          <span className="doorway-object" aria-hidden="true">
            <img src="/images/art/gallery/426502619623139.webp" alt="" width="1397" height="1400" />
            <SideboardFrame className="frame-drawing" />
          </span>
          <SideboardShelf className="doorway-shelf" draw />
        </Link>

        <Link className="doorway doorway-photo" href="/biography">
          <span className="doorway-label">
            <span className="doorway-title">Timeless</span>
            <span className="doorway-sub">Allen and Ann&rsquo;s story</span>
          </span>
          <span className="doorway-object" aria-hidden="true">
            <span className="photo-print">
              <img src="/images/personal/page-one-revue-1968-whiskey-a-go-go.jpg" alt="" width="678" height="506" />
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
    </main>
  );
}
