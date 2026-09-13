import Link from "next/link";

export default function CommentLink({ subject, returnTo, returnLabel, children = "Leave a comment" }) {
  return (
    <Link className="comment-link" href={{ pathname: "/comments", query: { subject, returnTo, returnLabel } }}>
      {children}
    </Link>
  );
}
