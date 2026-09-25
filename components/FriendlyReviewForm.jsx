"use client";

import { useEffect, useRef, useState } from "react";

export default function FriendlyReviewForm() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [review, setReview] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    let active = true;
    fetch("/api/reviews", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("unavailable"))))
      .then((data) => {
        if (active && Array.isArray(data.reviews)) setReviews(data.reviews);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
        <p className="reviewKicker">Your turn</p>
        <h2 id="add-review-title">Add a friendly review</h2>
        <p>Share a memory of hearing Allen play. Reviews are checked before they appear here.</p>
      </div>

      <form className="friendlyReviewForm" onSubmit={submit}>
        <label className="reviewTrap" aria-hidden="true">
          Website
          <input name="website" tabIndex="-1" autoComplete="off" />
        </label>
        <label>
          Your name
          <input required maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Where you heard Allen <span>(optional)</span>
          <input maxLength={120} value={place} onChange={(event) => setPlace(event.target.value)} />
        </label>
        <label className="reviewField">
          Your review
          <textarea required minLength={10} maxLength={1200} rows={5} value={review} onChange={(event) => setReview(event.target.value)} />
        </label>
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send review"}
        </button>
        {status ? <p className="reviewStatus" role="status">{status}</p> : null}
      </form>

      {reviews.length ? (
        <div className="savedReviews">
          <h3>More friendly reviews</h3>
          {reviews.map((entry) => (
            <article key={entry.id}>
              <blockquote>&ldquo;{entry.body}&rdquo;</blockquote>
              <p>{entry.name}{entry.place ? ` · ${entry.place}` : ""}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
