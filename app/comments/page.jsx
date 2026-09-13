import Link from "next/link";
import CommentForm from "../../components/CommentForm";

export const metadata = {
  title: "Write a comment · Allen Gillon",
  description:
    "Write a comment about Allen Gillon’s books, plays, songs, albums or the Matthew Allen 5 — it goes straight to Allen as a text message.",
};

export default async function CommentsPage({ searchParams }) {
  const query = await searchParams;
  const subject = typeof query.subject === "string" ? query.subject.slice(0, 300) : "";
  const requestedReturn = typeof query.returnTo === "string" ? query.returnTo : "";
  const returnTo = /^\/(?:music(?:#[a-z0-9-]+)?|books|plays|shows|read\/[a-z0-9-]+)$/.test(requestedReturn) ? requestedReturn : "/shows";
  const returnLabel = returnTo === "/shows" ? "MA5" : typeof query.returnLabel === "string" ? query.returnLabel.slice(0, 300) : "the page";
  return (
    <>
      <style>{`
  .cwrap{max-width:640px;padding-bottom:48px;}
  .cform{display:flex;flex-direction:column;gap:18px;margin-top:8px;}
  .cform label{display:flex;flex-direction:column;gap:6px;font-size:1.1rem;font-weight:700;}
  .cform input,.cform textarea{font-family:"Times New Roman",Times,serif;font-size:1.1rem;font-weight:400;
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
              Read a book or play, or heard a song, album or show? Leave your
              comment here. Venue managers interested in a
              booking are very welcome to use this page too.
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
    </>
  );
}
