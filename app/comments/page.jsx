import Link from "next/link";
import { headers } from "next/headers";
import CommentForm from "../../components/CommentForm";
import SiteChrome from "../../components/SiteChrome";
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
      <style>{`
  .cwrap{max-width:640px;padding-bottom:48px;}
  .cform{display:flex;flex-direction:column;gap:18px;margin-top:8px;}
  .cform label{display:flex;flex-direction:column;gap:6px;font-size:1.1rem;font-weight:700;}
  .cform input,.cform textarea{font-family:"Lora",Georgia,serif;font-size:1.1rem;font-weight:400;
    padding:12px;border:2px solid var(--ink);border-radius:3px;background:#fff;color:var(--ink);}
  .cform textarea{resize:vertical;}
  .cbtns{display:flex;gap:14px;flex-wrap:wrap;}
  .cbtns .btn{border:0;cursor:pointer;}
  .cnote{color:var(--soft);font-size:1rem;margin:0;}
  @media (max-width:640px){.cwrap{padding-left:12px;padding-right:12px;}}
`}</style>
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">Write a comment</h1>
            <p className="plain">
              Tell Allen what you thought of a story, play, song, album or show.
              Booking enquiries are welcome here too.
            </p>
          </div>
        </header>

        <section aria-label="Write a comment">
          <div className="wrap cwrap">
            <Link className="btn b" href={returnTo}>Back to {returnLabel}</Link>
            {subject ? <p>Commenting on: <strong>{subject}</strong></p> : null}
            <CommentForm subject={subject} />
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
