"use client";

import { useState } from "react";

/* No server or database behind the site, so the comment is delivered the way
   Allen prefers to be reached: as a text message to his phone. The form
   composes the message and hands it to the visitor's SMS app. */
const PHONE = "+61438747882";

export default function CommentForm() {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  const body = `${comment}${name ? `\n— ${name}` : ""}`;
  const smsHref = `sms:${PHONE}?&body=${encodeURIComponent(body)}`;

  return (
    <form
      className="cform"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = smsHref;
      }}
    >
      <label>
        Your name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </label>
      <label>
        Your comment
        <textarea
          required
          rows={6}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>
      <div className="cbtns">
        <button type="submit" className="btn">
          Send as a text to Allen
        </button>
        <a
          className="btn b"
          href="https://www.facebook.com/people/Allen-Gillon/100011388424486/"
          target="_blank"
          rel="noopener"
        >
          Or comment on Facebook
        </a>
      </div>
      <p className="cnote">
        The text button opens your phone&rsquo;s messages, addressed to Allen on{" "}
        <a href={`sms:${PHONE}`}>Text 0438 747 882</a>, with your comment ready
        to send.
      </p>
    </form>
  );
}
