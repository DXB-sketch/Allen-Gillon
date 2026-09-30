import SectionComment from "../../../components/SectionComment";
import CrossSiteLink from "../../../components/CrossSiteLink";
import ShowSetlist from "../../../components/ShowSetlist";
import "./shows.css";

export const metadata = {
  title: "The Matthew Allen 5",
  description:
    "The Matthew Allen 5 at Chandler Theatre, 1998: hear the show's setlist in 30-second previews.",
};

/* Not a promoted page: it is deliberately kept out of the site navigation and
   is reached through the "Learn more" link on the biography page. */

const tracks = [
  { src: "/audio/ma5-chandler-theatre/01-i-will-always-love-you.mp3", name: "I Will Always Love You", time: "0:30", preview: true },
  { src: "/audio/ma5-chandler-theatre/02-brazil.mp3", name: "Brazil", time: "0:30", preview: true },
  { src: "/audio/ma5-chandler-theatre/03-masquerade.mp3", name: "Masquerade", time: "0:30", preview: true },
  { src: "/audio/ma5-chandler-theatre/04-pensylvania-medley.mp3", name: "Pennsylvania Medley", time: "0:30", preview: true },
  { src: "/audio/ma5-chandler-theatre/05-saltwater.mp3", name: "Saltwater", time: "0:30", preview: true },
  { src: "/audio/ma5-chandler-theatre/06-boogie-woogie-bugle-boy.mp3", name: "Boogie Woogie Bugle Boy", time: "0:30", preview: true },
  { src: "/audio/ma5-chandler-theatre/07-new-york-new-york.mp3", name: "New York New York", time: "0:30", preview: true },
  { src: "/audio/ma5-chandler-theatre/08-tailfeather.mp3", name: "Tailfeather", time: "0:30", preview: true },
  { src: "/audio/ma5-chandler-theatre/09-power-of-love.mp3", name: "Power Of Love", time: "0:30", preview: true },
  { src: "/audio/ma5-chandler-theatre/10-shake-medley.mp3", name: "Shake Medley", time: "0:30", preview: true },
];

export default function ShowsPage() {
  return (
    <main>
      <header className="pagehead band">
        <h1 className="script">The Matthew Allen 5</h1>
        <p className="plain">At Chandler Theatre, 1998. Press play on any song to hear a 30-second preview of the show.</p>
      </header>

      <section className="show-body band">
        <div className="show-list">
          <ShowSetlist tracks={tracks} />
          <SectionComment subject="The Matthew Allen 5" returnTo="/shows" returnLabel="MA5" lead="Like what you hear?">
            Write a comment
          </SectionComment>
          <p className="show-back">
            <CrossSiteLink site="other" path="/biography">&larr; Back to the story</CrossSiteLink>
          </p>
        </div>
        <figure className="show-photo">
          <img
            className="gx-hero"
            src="/images/personal/matthew-allen-5-band-photo.jpg"
            alt="The Matthew Allen 5 on stage"
            loading="lazy"
          />
          <figcaption>MA5 Show.</figcaption>
        </figure>
      </section>
    </main>
  );
}
