import Link from "next/link";

export default function CommentLink({ subject, returnTo, returnLabel, children = "Leave a comment" }) {
  return (
    <Link className="comment-link" href={{ pathname: "/comments", query: { subject, returnTo, returnLabel } }}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 17.5 3.5 21l4.2-1.6c1.3.7 2.7 1.1 4.3 1.1 5 0 9-3.8 9-8.5s-4-8.5-9-8.5S3 7.3 3 12c0 2.1.7 4 2 5.5Z" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
      {children}
    </Link>
  );
}
