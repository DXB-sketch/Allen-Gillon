"use client";

import { useRef, useState } from "react";
import CrossSiteLink from "./CrossSiteLink";

export default function FriendlyReviewForm() {
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [review, setReview] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());

  async function submit(event) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanPlace = place.trim();
    const cleanReview = review.trim();
    if (!cleanName || !cleanReview) return;

    setSubmitting(true);
    setStatus("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          place: cleanPlace,
          review: cleanReview,
          website: form.get("website"),
          startedAt: startedAt.current,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Please try again.");
      setName("");
      setPlace("");
      setReview("");
      setStatus(data.message);
      startedAt.current = Date.now();
    } catch (error) {
      setStatus(error.message || "Your review could not be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="addReview" aria-labelledby="add-review-title">
      <div className="reviewFormIntro">
        <h2 id="add-review-title">Add a friendly review</h2>
        <p>Share a memory of hearing Allen play. Reviews are checked before they appear here.</p>
      </div>

      <form className="friendlyReviewForm" onSubmit={submit}>
        <label className="reviewTrap" aria-hidden="true">
          Website
          <input name="website" tabIndex="-1" autoComplete="off" />
        </label>
        <label>
          <span className="fieldName">Your name</span>
          <input required maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          <span className="fieldName">
            Where you heard Allen <span className="fieldHint">(optional)</span>
          </span>
          <input maxLength={120} value={place} onChange={(event) => setPlace(event.target.value)} />
        </label>
        <label className="reviewField">
          <span className="fieldName">Your review</span>
          <textarea required minLength={10} maxLength={1200} rows={6} value={review} onChange={(event) => setReview(event.target.value)} />
        </label>
        <div className="reviewSend">
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send review"}
          </button>
          <p className="reviewStatus" role="status">{status}</p>
        </div>
        {/* /privacy is served on the main host only. The legal pages are not
            published yet (W7); this link will resolve once they are. It is an
            absolute main-host URL so it stays right wherever the form is used. */}
        <p className="reviewPrivacy">
          Once Allen approves it, your review appears here with your name and
          where you heard him. The{" "}
          <CrossSiteLink site="main" path="/privacy">privacy page</CrossSiteLink>{" "}
          explains how your details are handled.
        </p>
      </form>
    </section>
  );
}
