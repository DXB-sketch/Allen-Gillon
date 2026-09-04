import Link from "next/link";
import ShowSetlist from "../../components/ShowSetlist";

export const metadata = {
  title: "The Matthew Allen 5 · Allen Gillon",
  description:
    "The Matthew Allen 5 at Chandler Theatre, 1998: hear the show's setlist in 30-second previews.",
};

/* Not a promoted page: it is deliberately kept out of the site navigation and
   is reached through the "Learn more" link on the biography page. */

const tracks = [
  { src: "/audio/ma5-chandler-theatre/01-i-will-always-love-you.mp3", name: "I Will Always Love You", time: "5:12" },
  { src: "/audio/ma5-chandler-theatre/02-brazil.mp3", name: "Brazil", time: "2:39" },
  { src: "/audio/ma5-chandler-theatre/03-masquerade.mp3", name: "Masquerade", time: "2:49" },
  { src: "/audio/ma5-chandler-theatre/04-pensylvania-medley.mp3", name: "Pennsylvania Medley", time: "6:17" },
  { src: "/audio/ma5-chandler-theatre/05-saltwater.mp3", name: "Saltwater", time: "4:01" },
  { src: "/audio/ma5-chandler-theatre/06-boogie-woogie-bugle-boy.mp3", name: "Boogie Woogie Bugle Boy", time: "2:31" },
  { src: "/audio/ma5-chandler-theatre/07-new-york-new-york.mp3", name: "New York New York", time: "3:12" },
  { src: "/audio/ma5-chandler-theatre/08-tailfeather.mp3", name: "Tailfeather", time: "3:42" },
  { src: "/audio/ma5-chandler-theatre/09-power-of-love.mp3", name: "Power Of Love", time: "5:35" },
  { src: "/audio/ma5-chandler-theatre/10-shake-medley.mp3", name: "Shake Medley", time: "6:25" },
];

export default function ShowsPage() {
  return (
    <>
      <style>{`
  .showGrid{display:grid;grid-template-columns:1fr 380px;gap:44px;align-items:start;padding:16px 0 40px;}
  .showGrid .gx-hero{border:3px solid var(--ink);border-radius:3px;}
  .showGrid figcaption{font-size:.98rem;color:var(--soft);margin-top:6px;}
  .setlist{list-style:none;margin:10px 0 0;padding:0;border-top:var(--rule);}
  .setlist li{display:flex;align-items:center;gap:16px;padding:8px 0;border-bottom:var(--rule);}
  .setlist .no{font-family:"Dynalight","Times New Roman",cursive;font-size:1.7rem;color:var(--red);min-width:1.6ch;text-align:right;line-height:1;}
  .setlist li:nth-child(even) .no{color:var(--blue);}
  .setlist .tname{font-size:1.2rem;}
  .likeit{margin-top:28px;font-size:1.15rem;}
  @media (max-width:860px){.showGrid{grid-template-columns:1fr;}.showGrid .gx-hero{max-width:min(340px,85vw);}}
  @media (max-width:640px){
    .pagehead .plain{padding-left:12px;padding-right:4px;}
    .setlist li{padding-left:12px;padding-right:4px;gap:10px;}
    .setlist .tname{font-size:1.05rem;}
  }
`}</style>
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">The Matthew Allen 5</h1>
            <p className="plain">At Chandler Theatre, 1998. Press play on any song to hear a 30-second preview of the show.</p>
          </div>
        </header>

        <section>
          <div className="wrap showGrid">
            <div>
              <ShowSetlist tracks={tracks} />
              <p className="likeit">
                Like what you hear? <Link href="/comments">Write a comment</Link>
              </p>
              <p className="likeit">
                <Link href="/biography">&larr; Back to the story</Link>
              </p>
            </div>
            <figure style={{ margin: 0 }}>
              <img
                className="gx-hero"
                src="/images/personal/matthew-allen-5-band-photo.jpg"
                alt="The Matthew Allen 5 on stage"
                loading="lazy"
              />
              <figcaption>MA5 Show.</figcaption>
            </figure>
          </div>
        </section>
      </main>
    </>
  );
}
