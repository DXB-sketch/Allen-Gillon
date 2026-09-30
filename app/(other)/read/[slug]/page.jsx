import SectionComment from "../../../../components/SectionComment";
import Link from "next/link";
import CrossSiteLink from "../../../../components/CrossSiteLink";
import { notFound } from "next/navigation";
import BookReader from "../../../../components/BookReader";
import SyncedStoryReader from "../../../../components/SyncedStoryReader";
import PurchaseLink from "../../../../components/PurchaseLink";
import { formatAud, playPrice, stripePaymentLink } from "../../../../lib/storefront.mjs";
import bookIndex from "../../../../public/books/index.json";
import breakoutManifest from "../../../../public/books/breakout/manifest.json";
import funnyFahManifest from "../../../../public/books/funny-fah-learns-when-to-stop/manifest.json";
import imaginativeMeeManifest from "../../../../public/books/imaginative-little-mee/manifest.json";
import hiDohManifest from "../../../../public/books/little-hi-doh/manifest.json";
import littleRayManifest from "../../../../public/books/little-ray/manifest.json";
import meltingPotManifest from "../../../../public/books/melting-pot/manifest.json";
import otherMansGrassManifest from "../../../../public/books/the-other-mans-grass/manifest.json";
import sherwoodManifest from "../../../../public/books/three-heroes-of-sherwood/manifest.json";
import calamityJaneManifest from "../../../../public/books/tribute-to-calamity-jane/manifest.json";
import "./read.css";

// Workers have no runtime filesystem. Keeping these JSON files as static
// imports lets both Next.js and Cloudflare bundle the complete reader data.
const manifests = {
  breakout: breakoutManifest,
  "funny-fah-learns-when-to-stop": funnyFahManifest,
  "imaginative-little-mee": imaginativeMeeManifest,
  "little-hi-doh": hiDohManifest,
  "little-ray": littleRayManifest,
  "melting-pot": meltingPotManifest,
  "the-other-mans-grass": otherMansGrassManifest,
  "three-heroes-of-sherwood": sherwoodManifest,
  "tribute-to-calamity-jane": calamityJaneManifest,
};

// Storybooks that are on YouTube but not yet digitised: keep a plain
// placeholder page for each until their scans arrive.
const placeholders = {
  "funny-fah-learns-when-to-stop": "Funny Fah Learns When to Stop",
  "imaginative-little-mee": "Imaginative Little Mee",
  "little-ray": "Little Ray",
};

const storyAudio = {
  "funny-fah-learns-when-to-stop": "/audio/chinese-chimes-audiobooks/funny-fah-learns-when-to-stop.mp3",
  "imaginative-little-mee": "/audio/chinese-chimes-audiobooks/imaginative-little-mee.mp3",
  "little-hi-doh": "/audio/chinese-chimes-audiobooks/hi-doh.mp3",
  "little-ray": "/audio/chinese-chimes-audiobooks/little-ray.mp3",
};

// The original YouTube narrations, offered as a tertiary link under the reader.
const storyVideo = {
  "funny-fah-learns-when-to-stop": "OAu1PmILqeA",
  "imaginative-little-mee": "ZwzVEIQp3Cw",
  "little-hi-doh": "Ynu-5Rt7Vyw",
  "little-ray": "cEuPWVPPN0o",
};

// These page samples came from the original story videos used to digitise the
// books. Midpoints between samples approximate each original page turn; the
// cues are then scaled to the matching ElevenLabs narration.
const storyPageTiming = {
  "funny-fah-learns-when-to-stop": {
    samples: [2, 15, 39, 69, 95, 110, 127, 140, 153, 172, 183, 198, 215, 230, 250, 278, 302, 326, 354, 371, 379, 406, 417, 448, 458, 484, 492, 516, 530, 544, 566, 587, 609, 636],
    sourceDuration: 647,
    audioDuration: 746.89,
  },
  "imaginative-little-mee": {
    samples: [2, 16, 31, 48, 65, 84, 104, 123, 138, 161, 183, 199, 207, 224, 240, 245, 252, 265, 301, 335, 361, 392, 426, 452, 473, 488, 507, 522, 537],
    sourceDuration: 645,
    audioDuration: 439.93,
  },
  "little-hi-doh": {
    samples: [4, 28, 50, 75, 97, 118, 134, 142, 156, 170, 182, 197, 212, 228, 244, 261, 273, 286, 301, 306, 316, 332, 345, 352, 362],
    sourceDuration: 372,
    audioDuration: 302.5,
  },
  "little-ray": {
    samples: [5, 23, 46, 70, 90, 106, 123, 139, 154, 174, 192, 207, 219, 236, 266, 298, 325, 348, 372],
    sourceDuration: 387,
    audioDuration: 325.33,
  },
};

function pageCuesFor(slug) {
  const timing = storyPageTiming[slug];
  if (!timing) return null;
  return timing.samples.map((sample, index, samples) => {
    if (index === 0) return 0;
    const boundary = (samples[index - 1] + sample) / 2;
    return Number(((boundary / timing.sourceDuration) * timing.audioDuration).toFixed(2));
  });
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = new Set([...bookIndex.map((b) => b.slug), ...Object.keys(placeholders)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = bookIndex.find((b) => b.slug === slug);
  if (entry && entry.status === "free") {
    return {
      title: entry.title,
      description: entry.blurb,
      openGraph: {
        title: entry.title,
        description: entry.blurb,
        images: [{ url: entry.section === "childrens" ? "/images/chinese-chimes-together.webp" : `/books/${slug}/p001.webp` }],
      },
    };
  }
  if (entry) {
    return {
      title: entry.title,
      description: `${entry.title}, a published classroom title by Allen Gillon.`,
    };
  }
  if (placeholders[slug]) {
    return {
      title: placeholders[slug],
      description: `${placeholders[slug]} by Allen Gillon, being digitised for reading on this site.`,
    };
  }
  return {};
}

export default async function ReadPage({ params }) {
  const { slug } = await params;
  const entry = bookIndex.find((b) => b.slug === slug);

  if (!entry && !placeholders[slug]) notFound();

  // Not yet digitised: plain placeholder, nothing heavy.
  if (!entry) {
    const title = placeholders[slug];
    return (
      <main>
        <header className="pagehead band">
          <h1 className="script">{title}</h1>
          <p className="plain">
            This storybook is being digitised. Its scanned pages will be added here when they are ready.
          </p>
        </header>
        <section className="read-body band" aria-label="Coming soon">
          <p>
            If you would like a copy in the meantime, <CrossSiteLink site="main" path="/hire">contact Allen</CrossSiteLink>.
          </p>
          <p className="read-back">
            <Link className="back-link" href="/books#stories">Back to Stories</Link>
          </p>
          <SectionComment subject={title} returnTo={`/read/${slug}`} returnLabel={title} />
        </section>
      </main>
    );
  }

  // Published elsewhere; web rights not confirmed. Listed only.
  if (entry.status !== "free") {
    return (
      <main>
        <header className="pagehead band">
          <h1 className="script">{entry.title}</h1>
          <p className="plain">{entry.blurb}</p>
        </header>
        <section className="read-body band" aria-label="Availability">
          <p>
            {entry.title} is a published title available to schools through its publisher. It is not available to
            read or download on this site. For help finding a copy, <CrossSiteLink site="main" path="/hire">get in touch</CrossSiteLink>.
          </p>
          <p className="read-back">
            <Link className="back-link" href="/books#classroom-texts">Back to Classroom Texts</Link>
          </p>
          <SectionComment subject={entry.title} returnTo={`/read/${slug}`} returnLabel={entry.title} />
        </section>
      </main>
    );
  }

  const manifest = manifests[slug];
  if (!manifest) notFound();

  const backHref = entry.section === "plays" ? "/books#school-plays" : "/books#stories";
  const backLabel = entry.section === "plays" ? "Back to School Plays" : "Back to Stories";
  const isPlay = entry.section === "plays";
  const readerManifest = isPlay ? { ...manifest, hasDownload: false } : manifest;
  const storyPageCues = pageCuesFor(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: manifest.title,
    author: { "@type": "Person", name: "Allen Gillon" },
    bookFormat: "https://schema.org/EBook",
    inLanguage: "en",
    numberOfPages: manifest.pageCount,
    description: manifest.blurb,
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="pagehead band">
        <h1 className="script">{manifest.title}</h1>
        <p className="plain">
          {manifest.blurb} {manifest.pageCount} pages. {isPlay ? `Read it here before buying the ${formatAud(playPrice)} file.` : "Read it here, or download the PDF to keep."}
        </p>
        {isPlay ? (
          <p className="read-buy">
            <PurchaseLink href={stripePaymentLink(`play-${slug}`)} pendingLabel={`${formatAud(playPrice)} download. Online checkout coming soon`}>Buy the {formatAud(playPrice)} download</PurchaseLink>
          </p>
        ) : null}
      </header>
      <section className="read-body band" aria-label={`Read ${manifest.title}`}>
        <div className="read-reader">
          {storyAudio[slug] && storyPageCues ? (
            <SyncedStoryReader
              manifest={readerManifest}
              audioSrc={storyAudio[slug]}
              pageCues={storyPageCues}
            />
          ) : (
            <BookReader manifest={readerManifest} />
          )}
        </div>
        {storyVideo[slug] ? (
          <p className="read-tertiary">
            <a href={`https://www.youtube.com/watch?v=${storyVideo[slug]}`} target="_blank" rel="noreferrer">Original YouTube narration</a>
          </p>
        ) : null}
        <p className="read-back">
          <Link className="back-link" href={backHref}>{backLabel}</Link>
        </p>
        <SectionComment subject={manifest.title} returnTo={`/read/${slug}`} returnLabel={manifest.title} />
      </section>
    </main>
  );
}
