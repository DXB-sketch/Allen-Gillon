import Link from "next/link";
import SectionComment from "../../../components/SectionComment";
import CrossSiteLink from "../../../components/CrossSiteLink";
import AlbumShelf from "../../../components/Album";
import MusicGibson from "../../../components/illustrations/MusicGibson";
import MusicMic from "../../../components/illustrations/MusicMic";
import MusicFlute from "../../../components/illustrations/MusicFlute";
import MusicKeys from "../../../components/illustrations/MusicKeys";
import LiteYouTube from "./LiteYouTube";
import { albums, originals } from "./albums.mjs";
import "./music.css";

export const metadata = {
  title: "Al's music style",
  description:
    "Listen to Allen Gillon's albums and download the tracks free.",
};

/* Albums (/music), W5.
   One primary thing: the shelf of four albums. Each sleeve is the only
   toggle for its track list; the open panel's one primary action is
   "Download album free" (albums are free: no Payment Link on this page).
   Instruments are two-ink line drawings at the page edges, partly off the
   page, in space that holds no text: Allen's Trini Lopez Gibson by the
   title, a flute under the shelf, a microphone on the Timeless band and a
   strip of piano keys by the original songs. Below 1024px only the Gibson
   stays, peeking into the header beside the title. */

const shelf = albums.map((album) => ({ ...album, shelfCover: `/images/albums/shelf/${album.id}.webp` }));

export default function MusicPage() {
  return (
    <main className="music-page">
      <header className="pagehead band music-head">
        <h1 className="script">Albums</h1>
        <p className="plain">
          Listen to Allen&rsquo;s four studio albums here: click a cover to open the track list, then choose a song,
          or download the whole album free.
        </p>
        <div className="instrument instrument--gibson">
          <MusicGibson />
        </div>
      </header>

      <section className="albums-band band" aria-label="Albums">
        <AlbumShelf albums={shelf} />
        <SectionComment subject="Allen's albums" returnTo="/music" returnLabel="the albums" />
        <div className="instrument instrument--flute" data-motion="from-right">
          <MusicFlute />
        </div>
      </section>

      <section id="timeless" className="timeless-band band ink" aria-labelledby="timeless-title">
        <h2 id="timeless-title" className="script">
          Timeless, with Ann
        </h2>
        <div className="timeless-video timeless-video--lead">
          <video
            controls
            playsInline
            preload="none"
            poster="/images/videos/timeless-masquerade.webp"
            width="1024"
            height="576"
            aria-label="Ann and Allen performing This Masquerade"
          >
            <source src="/videos/timeless-masquerade.mp4" type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
        <div className="timeless-video timeless-video--duet">
          <video
            controls
            playsInline
            preload="none"
            poster="/images/videos/timeless-unforgettable.webp"
            width="1920"
            height="1080"
            aria-label="Ann and Allen performing Unforgettable"
          >
            <source src="/videos/timeless-unforgettable.mp4" type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
        <div className="timeless-text">
          <p>
            Allen and Ann have played together for many years. Their duet,{" "}
            <CrossSiteLink site="other" path="/biography">Timeless</CrossSiteLink>, has taken them from Sydney clubs to a
            convention stage in Chicago. Allen plays his Trini Lopez Gibson and Ann sings and plays piano.
          </p>
          <p>
            Ann also paints. You can see her work on{" "}
            <CrossSiteLink site="other" path="/anns-art">Ann&rsquo;s art page</CrossSiteLink>.
          </p>
          <p>
            Their album together is <a href="#misty">Misty</a>, above. To have Timeless play your restaurant or event,
            see <Link href="/hire">Contact Allen</Link>.
          </p>
        </div>
        <div className="instrument instrument--mic" data-motion="from-right">
          <MusicMic ground="ink" />
        </div>
      </section>

      <section id="originals" className="originals-band band" aria-labelledby="originals-title">
        <div className="instrument instrument--keys" data-motion="from-left">
          <MusicKeys />
        </div>
        <div className="originals-head">
          <h2 id="originals-title" className="script">
            Original songs
          </h2>
          <p className="plain">Songs written by Allen Gillon.</p>
        </div>
        <div className="videos">
          {originals.map((song) => (
            <figure className="video" key={song.id}>
              <div className="frame">
                <LiteYouTube id={song.id} title={song.title} poster={`/images/videos/yt-${song.id}.webp`} />
              </div>
              <figcaption>
                {song.title} <small>{song.credit}</small>
              </figcaption>
            </figure>
          ))}
        </div>
        <SectionComment subject="Original songs" returnTo="/music#originals" returnLabel="Original songs" />
      </section>
    </main>
  );
}
