import SectionComment from "../../../components/SectionComment";
import AlbumShelf from "../../../components/Album";
import MusicGibson from "../../../components/illustrations/MusicGibson";
import MusicGuitar from "../../../components/illustrations/MusicGuitar";
import MusicFlute from "../../../components/illustrations/MusicFlute";
import MusicKeys from "../../../components/illustrations/MusicKeys";
import ShelfPlank from "../../../components/illustrations/ShelfPlank";
import LiteYouTube from "./LiteYouTube";
import { SHELF_SIZES, shelfSrcSet } from "../../../lib/album-shelf.mjs";
import { albums, originals } from "./albums.mjs";
import { pageMetadata } from "../../../lib/seo.mjs";
import { collectionPage, jsonLdProps, musicAlbum } from "../../../lib/schema.mjs";
import "./music.css";

export const metadata = pageMetadata("main", "/music");

/* The albums as a collection, then one MusicAlbum each (free, so the Offer
   price is 0). No VideoObject: the Timeless videos' upload dates are unknown. */
const JSON_LD = [
  collectionPage(
    albums.map((a) => ({ url: `/music#${a.id}`, name: a.title, image: a.cover })),
    { url: "/music", name: "Albums", site: "main" },
  ),
  ...albums.map(musicAlbum),
];

/* Albums (/music), W5.
   One primary thing: the shelf of four albums. Each sleeve is the only
   toggle for its track list; the open panel's one primary action is
   "Download album free" (albums are free: no Payment Link on this page).
   Instruments are two-ink line drawings at the page edges, partly off the
   page, in space that holds no text: Allen's Trini Lopez Gibson by the
   title, a flute under the shelf and a strip of piano keys by the original
   songs. Below 1024px only a guitar stays: a smaller whole electric guitar
   beside the title in place of the long Gibson.
   The page reader stops after the last album, I Just Called: the comment
   link and the original songs below it are marked data-reader-skip.
   Timeless Duo, with Ann now lives on the Timeless page, under "Today". */

const shelf = albums.map((album) => ({ ...album, shelfCover: `/images/albums/shelf/${album.id}.webp` }));

export default function MusicPage() {
  return (
    <div className="music-page">
      <script {...jsonLdProps(JSON_LD)} />
      {/* The first sleeve is the LCP image. React hoists this into <head>. */}
      <link
        rel="preload"
        as="image"
        href={shelf[0].shelfCover}
        imageSrcSet={shelfSrcSet(shelf[0].shelfCover)}
        imageSizes={SHELF_SIZES}
        fetchPriority="high"
      />
      <header className="pagehead band music-head">
        <h1 className="script">Albums</h1>
        <p className="plain">
          Listen to four studio albums here: click a cover to open the track list, then choose a song,
          or download the whole album free.
        </p>
        <div className="instrument instrument--gibson" data-motion="from-right">
          <MusicGibson />
        </div>
        <div className="instrument instrument--guitar" data-motion="from-right">
          <MusicGuitar />
        </div>
      </header>

      <section className="albums-band band" aria-label="Albums">
        <AlbumShelf albums={shelf} shelf={<ShelfPlank className="album-shelf" draw />} />
        <SectionComment subject="Allen's albums" returnTo="/music" returnLabel="the albums" data-reader-skip />
        <div className="instrument instrument--flute" data-motion="from-right">
          <MusicFlute />
        </div>
      </section>

      <section id="originals" className="originals-band band" aria-labelledby="originals-title" data-reader-skip>
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
    </div>
  );
}
