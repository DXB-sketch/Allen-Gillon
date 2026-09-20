import CommentLink from "../../components/CommentLink";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

export const metadata = {
  title: "eBooks · Allen Gillon",
  description:
    "The Chinese Chimes stories: short eBooks with a moral for young readers, written and narrated by Allen Gillon.",
};

// The four Chinese Chimes stories as they appear on YouTube. readSlug points at
// the digitised book where one exists (see public/books/index.json); the rest
// keep their placeholder pages until their scans arrive.
const stories = [
  { video: "OAu1PmILqeA", title: "Funny Fah Learns When to Stop", readSlug: "funny-fah-learns-when-to-stop" },
  { video: "ZwzVEIQp3Cw", title: "Imaginative Little Mee", readSlug: "imaginative-little-mee" },
  { video: "Ynu-5Rt7Vyw", title: "Hi Doh", readSlug: "little-hi-doh" },
  { video: "cEuPWVPPN0o", title: "Little Ray", readSlug: "little-ray" },
];

async function readIndex() {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "public", "books", "index.json"), "utf8"));
  } catch {
    return [];
  }
}

export default async function BooksPage() {
  const index = await readIndex();
  const bySlug = Object.fromEntries(index.map((b) => [b.slug, b]));

  return (
    <>
      <style>{`
  .video .btnrow{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px;}
  .video .btn{align-self:flex-start;}
`}</style>
      <main>
      <header className="pagehead">
        <div className="wrap">
          <h1 className="script">eBooks</h1>
          <p className="plain">Allen wrote the Chinese Chimes stories for young readers. Each story has a moral. You can read the eBooks here or listen to the YouTube narrations. The videos use an older computer voice, and Allen plans to record them again.</p>
        </div>
      <p className="wrap"><Link href="/plays">See School Plays and Classroom Textbooks</Link></p>
      </header>

      <section aria-label="The Chinese Chimes stories">
        <div className="wrap">
          <div className="videos">
            {stories.map((story) => {
              const book = bySlug[story.readSlug];
              const readable = book && book.status === "free";
              return (
                <figure className="video" key={story.video}>
                  <div className="frame">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${story.video}`}
                      title={story.title}
                      loading="lazy"
                      allow="encrypted-media; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <figcaption>{story.title}</figcaption>
                  <div className="btnrow">
                    <CommentLink subject={story.title} returnTo="/books" returnLabel="eBooks" />
                    <Link className="btn b" href={`/read/${story.readSlug}`}>Read the book</Link>
                    {readable ? (
                      <a className="btn" href={`/books/${story.readSlug}/${story.readSlug}.pdf`} download>Download PDF</a>
                    ) : null}
                  </div>
                </figure>
              );
            })}
          </div>
          <div className="upcoming-books">
            <h2 className="script">Upcoming children&rsquo;s books</h2>
            <ul className="ruled">
              {["Doh", "Soh", "Lah", "Tee"].map((title) => <li key={title}>{title}</li>)}
            </ul>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
