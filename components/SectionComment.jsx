import Link from "next/link";

// The one quiet comment link for a section or a page. It opens /comments with
// the subject filled in and a "Back to" link that returns here.
export default function SectionComment({ subject, returnTo, returnLabel, lead = null, children = "Leave a comment" }) {
  return (
    <p className="section-comment">
      {lead ? <>{lead} </> : null}
      <Link href={{ pathname: "/comments", query: { subject, returnTo, returnLabel } }}>{children}</Link>
    </p>
  );
}
