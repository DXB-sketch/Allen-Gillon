import CommentForm from "../../components/CommentForm";

export const metadata = {
  title: "Write a comment · Allen Gillon",
  description:
    "Write a comment for Allen Gillon and the Matthew Allen 5 — it goes straight to Allen as a text message.",
};

export default function CommentsPage() {
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
              Heard the Matthew Allen 5, or one of Allen and Ann&rsquo;s shows or
              albums? Leave your comment here. Venue managers interested in a
              booking are very welcome to use this page too.
            </p>
          </div>
        </header>

        <section aria-label="Write a comment">
          <div className="wrap cwrap">
            <CommentForm />
          </div>
        </section>
      </main>
    </>
  );
}
