import Link from "next/link";

// The one quiet comment link for a section or a page. It opens /comments with
// the subject filled in and a "Back to" link that returns here.
// rel="nofollow": /comments is noindex (lib/seo.mjs), and every subject is a
// new URL, so crawlers would otherwise queue one noindex page per section.
export default function SectionComment({ subject, returnTo, returnLabel, lead = null, children = "Leave a comment", ...rest }) {
  return (
    <p className="section-comment" {...rest}>
      {lead ? <>{lead} </> : null}
      <Link prefetch={false} rel="nofollow" href={{ pathname: "/comments", query: { subject, returnTo, returnLabel } }}>{children}</Link>
    </p>
  );
}
