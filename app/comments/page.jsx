import Link from "next/link";
import { headers } from "next/headers";
import CommentForm from "../../components/CommentForm";
import SiteChrome from "../../components/SiteChrome";
import "./comments.css";
import { SITES, defaultReturnTo, safeReturnTo, siteForHost } from "../../lib/sites.mjs";

// Served on both hosts. The host decides the mast, footer, title and which
// pages "Back to" may return to.
export async function generateMetadata() {
  const site = siteForHost((await headers()).get("host"));
  return {
    metadataBase: new URL(SITES[site].origin),
    title: `Write a comment · ${SITES[site].name}`,
    description:
      "Write a comment about Allen Gillon's work. The message goes straight to Allen by text.",
    robots: { index: false },
  };
}

export default async function CommentsPage({ searchParams }) {
  const query = await searchParams;
  const site = siteForHost((await headers()).get("host"));
  const subject = typeof query.subject === "string" ? query.subject.slice(0, 300) : "";
  const returnTo = safeReturnTo(site, query.returnTo);
  const fellBack = returnTo === defaultReturnTo(site) && query.returnTo !== returnTo;
  const fallbackLabel = site === "other" ? "Stories" : "MA5";
  const returnLabel = fellBack
    ? fallbackLabel
    : typeof query.returnLabel === "string"
      ? query.returnLabel.slice(0, 300)
      : "the page";
  return (
    <SiteChrome site={site}>
      <div>
        <header className="pagehead band">
          {/* The way back is a text link, never a second button: the page's
              one primary action is "Send as a text to Allen". */}
          <p className="cback">
            <Link className="back-link" href={returnTo}>Back to {returnLabel}</Link>
          </p>
          <h1 className="script">Write a comment</h1>
          <p className="plain">
            Tell Allen what you thought of a story, play, song, album or show.
            Booking enquiries are welcome here too.
          </p>
        </header>

        <section className="cwrap band" aria-label="Write a comment">
          <div className="measure">
            {subject ? <p className="csubject">Commenting on: <strong>{subject}</strong></p> : null}
            <CommentForm subject={subject} />
          </div>
        </section>
      </div>
    </SiteChrome>
  );
}
