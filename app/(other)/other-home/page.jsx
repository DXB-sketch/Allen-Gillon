import Link from "next/link";
import CrossSiteLink from "../../../components/CrossSiteLink";
import "./other-home.css";

// "The sideboard": the home page of other.allengillon.com. It is served at "/"
// through the proxy rewrite; /other-home itself returns 301 to "/".
export const metadata = {
  title: { absolute: "More on Allen: stories, Timeless and Ann's art" },
  description:
    "Allen Gillon's personal side: stories and school plays for young readers, the Timeless story of Allen and Ann, and Ann Gillon's original paintings.",
  alternates: { canonical: "https://other.allengillon.com/" },
  openGraph: {
    title: "More on Allen",
    description:
      "Stories and school plays for young readers, the Timeless story of Allen and Ann, and Ann Gillon's original paintings.",
    url: "https://other.allengillon.com/",
    siteName: "More on Allen",
    locale: "en_AU",
    type: "website",
    images: [{ url: "/images/chinese-chimes-together.webp", width: 1080, height: 607 }],
  },
};

export default function OtherHome() {
  return (
    <main className="sideboard">
      <header className="sideboard-head">
        <h1 className="script">More on Allen</h1>
        <p>Allen&rsquo;s personal side: family, writing, Timeless and Ann&rsquo;s art.</p>
      </header>

      <div className="doorways">
        <Link className="doorway doorway-book" href="/books">
          <span className="doorway-object" aria-hidden="true">
            <img
              src="/images/chinese-chimes-together.webp"
              alt=""
              width="1080"
              height="607"
            />
          </span>
          <span className="doorway-label">Stories, plays and textbooks</span>
        </Link>

        <Link className="doorway doorway-frame" href="/anns-art">
          <span className="doorway-object" aria-hidden="true">
            <img
              src="/images/art/gallery/426502619623139.webp"
              alt=""
              width="1397"
              height="1400"
              loading="lazy"
            />
          </span>
          <span className="doorway-label">Ann Gillon&rsquo;s paintings</span>
        </Link>

        <Link className="doorway doorway-photo" href="/biography">
          <span className="doorway-object" aria-hidden="true">
            <img
              src="/images/personal/page-one-revue-1968-whiskey-a-go-go.jpg"
              alt=""
              width="678"
              height="506"
              loading="lazy"
            />
          </span>
          <span className="doorway-label">Timeless: Allen and Ann&rsquo;s story</span>
        </Link>
      </div>

      <p className="sideboard-back">
        <CrossSiteLink site="main" path="/">
          Allen&rsquo;s music, bookings and albums are on allengillon.com
        </CrossSiteLink>
      </p>
    </main>
  );
}
