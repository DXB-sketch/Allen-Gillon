import Link from "next/link";
import { notFound } from "next/navigation";

const works = {
  "melting-pot": { title: "Melting Pot", kind: "script", back: "/plays", backLabel: "Back to School Plays" },
  "the-other-mans-grass": { title: "The Other Man's Grass", kind: "script", back: "/plays", backLabel: "Back to School Plays" },
  "tribute-to-calamity-jane": { title: "Tribute to Calamity Jane", kind: "script", back: "/plays", backLabel: "Back to School Plays" },
  "three-heroes-of-sherwood": { title: "Three Heroes of Sherwood", kind: "script", back: "/plays", backLabel: "Back to School Plays" },
  "breakout": { title: "Breakout", kind: "script", back: "/plays", backLabel: "Back to School Plays" },
  "riddled-with-language": { title: "Riddled with Language", kind: "textbook", back: "/plays", backLabel: "Back to School Plays" },
  "practice-in-communication-book-1": { title: "Practice in Communication, Book 1", kind: "textbook", back: "/plays", backLabel: "Back to School Plays" },
  "practice-in-communication-book-2": { title: "Practice in Communication, Book 2", kind: "textbook", back: "/plays", backLabel: "Back to School Plays" },
  "funny-fah-learns-when-to-stop": { title: "Funny Fah Learns When to Stop", kind: "storybook", back: "/books", backLabel: "Back to Children's Books" },
  "imaginative-little-mee": { title: "Imaginative Little Mee", kind: "storybook", back: "/books", backLabel: "Back to Children's Books" },
  "hi-doh": { title: "Hi Doh", kind: "storybook", back: "/books", backLabel: "Back to Children's Books" },
  "little-ray": { title: "Little Ray", kind: "storybook", back: "/books", backLabel: "Back to Children's Books" },
};

const kindLine = {
  script:
    "This play is being digitised. When it is ready, the full script will open right here, page by page, free of charge and free of copyright. Until then, Allen sends scripts by email on request.",
  textbook:
    "This book is being digitised. When it is ready, its pages will open right here so teachers can look through it before using it in class.",
  storybook:
    "This storybook is being digitised. When it is ready, the full story will open right here to read along with, or without, the narration.",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(works).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const work = works[slug];
  if (!work) return {};
  return {
    title: `${work.title} · Allen Gillon`,
    description: `${work.title} by Allen Gillon, being digitised for reading on this site.`,
  };
}

export default async function ReadPage({ params }) {
  const { slug } = await params;
  const work = works[slug];
  if (!work) notFound();
  return (
    <main>
      <header className="pagehead">
        <div className="wrap">
          <h1 className="script">{work.title}</h1>
          <p className="plain">{kindLine[work.kind]}</p>
        </div>
      </header>
      <section aria-label="Coming soon">
        <div className="wrap">
          <div className="note">
            <p>
              Nothing to read just yet: the pages are on their way from Allen&rsquo;s shelf to this one. If you would
              like a copy in the meantime, <Link href="/hire">get in touch</Link>.
            </p>
          </div>
          <p style={{ marginTop: "24px" }}>
            <Link className="btn b" href={work.back}>
              {work.backLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
