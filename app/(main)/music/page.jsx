import CommentLink from "../../components/CommentLink";
import Link from "next/link";
import Album from "../../components/Album";

export const metadata = {
  title: "Al's music style · Allen Gillon",
  description:
    "Listen to Allen Gillon's albums and download the tracks free.",
};

const albums = [
  {
    id: "thats-the-time",
    title: "That's The Time",
    meta: "Allen Gillon Guitarist · 12 tracks",
    cover: "/images/albums/album-thats-the-time.jpg",
    coverAlt: "That's The Time album cover",
    tracks: [
      { src: "/audio/thats-the-time/01-that-s-the-time.mp3", name: "That's The Time", time: "2:26" },
      { src: "/audio/thats-the-time/02-you-don-t-know-me.mp3", name: "You Don't Know Me", time: "3:53" },
      { src: "/audio/thats-the-time/03-reminiscing.mp3", name: "Reminiscing", time: "3:57" },
      { src: "/audio/thats-the-time/04-girl-from-ipanema.mp3", name: "Girl From Ipanema", time: "2:50" },
      { src: "/audio/thats-the-time/05-dream-a-little-dream.mp3", name: "Dream A Little Dream", time: "2:33" },
      { src: "/audio/thats-the-time/06-breezin.mp3", name: "Breezin'", time: "3:56" },
      { src: "/audio/thats-the-time/07-corcovado.mp3", name: "Corcovado", time: "2:03" },
      { src: "/audio/thats-the-time/08-cavatina.mp3", name: "Cavatina", time: "3:23" },
      { src: "/audio/thats-the-time/09-desafinado.mp3", name: "Desafinado", time: "3:03" },
      { src: "/audio/thats-the-time/10-isn-t-she-lovely.mp3", name: "Isn't She Lovely", time: "2:09" },
      { src: "/audio/thats-the-time/11-one-day-i-ll-fly-away.mp3", name: "One Day I'll Fly Away", time: "4:56" },
      { src: "/audio/thats-the-time/12-for-the-love-of-you.mp3", name: "For The Love Of You", time: "3:27" },
    ],
  },
  {
    id: "wonderful-world",
    title: "Wonderful World",
    meta: "Allen Gillon · 10 tracks",
    cover: "/images/albums/album-wonderful-world-PHOTO-of-allen.png",
    coverAlt: "Wonderful World album cover",
    tracks: [
      { src: "/audio/wonderful-world/01-and-i-love-her.mp3", name: "And I Love Her", time: "3:43" },
      { src: "/audio/wonderful-world/02-days-of-wine-and-roses.mp3", name: "Days Of Wine And Roses", time: "2:45" },
      { src: "/audio/wonderful-world/03-don-t-know-why.mp3", name: "Don't Know Why", time: "2:40" },
      { src: "/audio/wonderful-world/04-unforgettable.mp3", name: "Unforgettable", time: "3:39" },
      { src: "/audio/wonderful-world/05-talk-of-the-town-bossa.mp3", name: "Talk Of The Town Bossa", time: "2:17" },
      { src: "/audio/wonderful-world/06-satin-doll.mp3", name: "Satin Doll", time: "2:35" },
      { src: "/audio/wonderful-world/07-take-five.mp3", name: "Take Five", time: "3:02" },
      { src: "/audio/wonderful-world/08-tenderly.mp3", name: "Tenderly", time: "3:15" },
      { src: "/audio/wonderful-world/09-fly-me-to-the-moon.mp3", name: "Fly Me To The Moon", time: "2:36" },
      { src: "/audio/wonderful-world/10-wonderful-world.mp3", name: "Wonderful World", time: "4:54" },
    ],
  },
  {
    id: "misty",
    title: "Misty",
    meta: "Ann & Allen Gillon · 8 tracks",
    cover: "/images/personal/album-misty-PHOTO-of-ann.jpg",
    coverAlt: "Misty album cover",
    tracks: [
      { src: "/audio/misty/01-cry-me-a-river.mp3", name: "Cry Me A River", time: "2:50" },
      { src: "/audio/misty/02-embraceable-you.mp3", name: "Embraceable You", time: "3:48" },
      { src: "/audio/misty/03-tenderly.mp3", name: "Tenderly", time: "3:13" },
      { src: "/audio/misty/04-this-masquerade.mp3", name: "This Masquerade", time: "2:26" },
      { src: "/audio/misty/05-willow-weep-for-me.mp3", name: "Willow Weep For Me", time: "2:59" },
      { src: "/audio/misty/06-body-and-soul.mp3", name: "Body And Soul", time: "4:22" },
      { src: "/audio/misty/07-autumn-leaves.mp3", name: "Autumn Leaves", time: "2:42" },
      { src: "/audio/misty/08-misty.mp3", name: "Misty", time: "2:40" },
    ],
  },
  {
    id: "i-just-called",
    title: "I Just Called",
    meta: "Allen Gillon · 12 tracks",
    cover: "/images/albums/album-i-just-called.jpg",
    coverAlt: "I Just Called album cover",
    tracks: [
      { src: "/audio/i-just-called/01-lately.mp3", name: "Lately", time: "3:33" },
      { src: "/audio/i-just-called/02-how-deep-is-your-love.mp3", name: "How Deep Is Your Love", time: "2:36" },
      { src: "/audio/i-just-called/03-let-s-fall-in-love.mp3", name: "Let's Fall In Love", time: "3:32" },
      { src: "/audio/i-just-called/04-autumn-leaves.mp3", name: "Autumn Leaves", time: "3:43" },
      { src: "/audio/i-just-called/05-i-just-called-to-say.mp3", name: "I Just Called To Say", time: "2:53" },
      { src: "/audio/i-just-called/06-james-bond-007.mp3", name: "James Bond 007", time: "1:50" },
      { src: "/audio/i-just-called/07-just-the-way-you-are.mp3", name: "Just The Way You Are", time: "2:58" },
      { src: "/audio/i-just-called/08-albatross.mp3", name: "Albatross", time: "3:10" },
      { src: "/audio/i-just-called/09-this-masquerade.mp3", name: "This Masquerade", time: "5:18" },
      { src: "/audio/i-just-called/10-tea-for-two-cha-cha.mp3", name: "Tea For Two Cha Cha", time: "2:25" },
      { src: "/audio/i-just-called/11-sleep-walk.mp3", name: "Sleep Walk", time: "4:22" },
      { src: "/audio/i-just-called/12-django-s-castle.mp3", name: "Django's Castle", time: "2:45" },
    ],
  },
];

/* Hidden from the site for now at Allen's request. Keep the data here so the
   album can be restored later by moving it back into the `albums` array. */
// eslint-disable-next-line no-unused-vars
const hiddenAlbums = [
  {
    id: "dedicated-to-tim-hughes",
    title: "Dedicated To Tim Hughes",
    meta: "Ann & Allen Gillon with Tim Hughes · 11 tracks · previews only",
    cover: "/images/albums/album-dedicated-to-tim-hughes.jpg",
    coverAlt: "Dedicated To Tim Hughes album cover",
    tracks: [
      { src: "/audio/dedicated-to-tim-hughes/01-don-t-get-around-much.mp3", name: "Don't Get Around Much", time: "4:01" },
      { src: "/audio/dedicated-to-tim-hughes/02-my-funny-valentine.mp3", name: "My Funny Valentine", time: "5:47" },
      { src: "/audio/dedicated-to-tim-hughes/03-till.mp3", name: "Till", time: "4:03" },
      { src: "/audio/dedicated-to-tim-hughes/04-i-ve-got-you-under-my-skin.mp3", name: "I've Got You Under My Skin", time: "4:12" },
      { src: "/audio/dedicated-to-tim-hughes/05-all-the-way.mp3", name: "All The Way", time: "4:31" },
      { src: "/audio/dedicated-to-tim-hughes/06-i-just-called.mp3", name: "I Just Called", time: "3:54" },
      { src: "/audio/dedicated-to-tim-hughes/07-georgia.mp3", name: "Georgia", time: "3:47" },
      { src: "/audio/dedicated-to-tim-hughes/08-a-train.mp3", name: 'Take the "A" Train', time: "2:15" },
      { src: "/audio/dedicated-to-tim-hughes/09-can-t-take-that-away-from-me.mp3", name: "Can't Take That Away From Me", time: "3:19" },
      { src: "/audio/dedicated-to-tim-hughes/10-route-66.mp3", name: "Route 66", time: "3:07" },
      { src: "/audio/dedicated-to-tim-hughes/11-misty.mp3", name: "Misty", time: "4:43" },
    ],
  },
];

export default function MusicPage() {
  return (
    <>
      <style>{`
  .timelessLead{max-width:760px;margin:40px auto 28px;}
  .timelessLead video{display:block;width:100%;height:auto;border:3px solid var(--ink);border-radius:3px;background:var(--ink);}
  .duet{display:grid;grid-template-columns:320px 1fr;gap:36px;align-items:start;padding:0 0 8px;}
  .duet video{display:block;width:100%;max-width:320px;aspect-ratio:1/1;object-fit:contain;border:3px solid var(--ink);border-radius:3px;background:var(--ink);}
  .duet p{font-size:1.1rem;margin:0 0 16px;}
  @media (max-width:820px){
    .timelessLead{max-width:min(560px,100%);margin-top:32px;}
    .duet{grid-template-columns:1fr;}
    .duet video{max-width:min(320px,82vw);margin:0 auto;}
    .duet h2{text-align:center;}
    .duet p{max-width:34ch;margin:0 auto 16px;}
  }
  section{padding-top:16px;}
  .secrule{border:0;border-top:var(--rule);margin:56px 0 0;}
`}</style>
      <main className="music-page">
        <div className="music-ornament" aria-hidden="true">
          <svg viewBox="0 0 90 210" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M55 8c-7 28-10 51-8 72l-9 30c-4 13-14 20-25 29-13 11-12 34 3 47 15 14 38 10 49-4 9-11 13-23 9-35-4-10-9-19-9-29l7-38c5-20 7-43 7-67Z" />
            <path d="m45 81 27 7M37 115l29 20M22 159c8-9 21-10 30-2 8 7 9 20 2 29M50 10l29 5" />
            <circle cx="42" cy="165" r="8" />
          </svg>
          <svg className="ornament-mic" viewBox="0 0 60 120" fill="none" stroke="currentColor" strokeWidth="3">
            <rect x="18" y="5" width="24" height="54" rx="12" />
            <path d="M10 45v4c0 16 9 26 20 26s20-10 20-26v-4M30 75v25M17 100h26" />
          </svg>
        </div>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">Al&rsquo;s music style</h1>
            <p className="plain">
              Listen to Allen&rsquo;s four studio albums here. He arranged many of the backing tracks himself, including
              &ldquo;Desafinado&rdquo; and &ldquo;Girl from Ipanema&rdquo;. Click a cover to open the track list, then choose a song.
              Each complete album is free to download. Individual song downloads are available under the three-dot menus. If you would rather have Allen in the room,{" "}
              <Link href="/hire">he still takes bookings</Link>.
            </p>
          </div>
        </header>

        <section aria-label="Albums">
          <div className="wrap albums">
            {albums.map((album) => (
              <Album key={album.id} {...album} />
            ))}
          </div>
        </section>

        <hr className="secrule" />

        <section id="timeless" aria-label="The duet Timeless">
          <div className="wrap">
            <div className="timelessLead">
              <video controls playsInline preload="metadata" aria-label="Ann and Allen performing This Masquerade">
                <source src="/videos/timeless-masquerade.mp4" type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          </div>
          <div className="wrap duet">
            <video controls playsInline preload="metadata" aria-label="Ann and Allen performing Unforgettable">
              <source src="/videos/timeless-unforgettable.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
            <div>
              <h2 className="script">Timeless, with Ann</h2>
              <p>
                Allen and Ann have played together for many years. Their duet, Timeless, has taken them from Sydney clubs to a convention stage in Chicago. Allen plays his Trini Lopez Gibson and Ann sings and plays piano.
              </p>
              <p>
                Ann also paints. You can see her work on <Link href="/anns-art">Ann&rsquo;s art page</Link>.
              </p>
              <p>
                Their album together is <a href="#misty">Misty</a>, above. To have Timeless play your restaurant or
                event, see <Link href="/hire">Contact Allen</Link>.
              </p>
            </div>
          </div>
        </section>

        <hr className="secrule" />

        <section id="originals" aria-label="Original songs">
          <div className="wrap">
            <h2 className="script" style={{ marginTop: "40px" }}>
              Original Songs
            </h2>
            <p className="plain" style={{ marginBottom: "8px" }}>
              Songs written by Allen Gillon.
            </p>
            <div className="videos">
              <figure className="video">
                <div className="frame">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/6idFN_r1Dlw"
                    title="At Last I'm Free"
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <figcaption>
                  At Last I'm Free <small>written by Allen Gillon</small>
                  <CommentLink subject={"At Last I'm Free"} returnTo="/music#originals" returnLabel="Original Songs" />
                </figcaption>
              </figure>
              <figure className="video">
                <div className="frame">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/AWTyzHr4eaI"
                    title="Jamie"
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <figcaption>
                  Jamie <small>written by Allen Gillon and Barry Cochran</small>
                  <CommentLink subject={"Jamie"} returnTo="/music#originals" returnLabel="Original Songs" />
                </figcaption>
              </figure>
              <figure className="video">
                <div className="frame">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/nqTpPzs9boQ"
                    title="Trippin' On My Senses"
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <figcaption>
                  Trippin' On My Senses <small>written by Allen Gillon</small>
                  <CommentLink subject={"Trippin' On My Senses"} returnTo="/music#originals" returnLabel="Original Songs" />
                </figcaption>
              </figure>
              <figure className="video">
                <div className="frame">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/VnXBwH5PcxU"
                    title="Travellin' Road"
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <figcaption>
                  Travellin' Road <small>written by Allen Gillon</small>
                  <CommentLink subject={"Travellin' Road"} returnTo="/music#originals" returnLabel="Original Songs" />
                </figcaption>
              </figure>
              <figure className="video">
                <div className="frame">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/21kIAn9ED28"
                    title="Taking Chances"
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <figcaption>
                  Taking Chances <small>written by Allen Gillon</small>
                  <CommentLink subject={"Taking Chances"} returnTo="/music#originals" returnLabel="Original Songs" />
                </figcaption>
              </figure>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
