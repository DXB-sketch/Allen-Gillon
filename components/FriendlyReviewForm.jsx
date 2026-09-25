"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "allen-gillon-friendly-reviews";
const PHONE = "+61438747882";

function readSavedReviews() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.slice(-20) : [];
  } catch {
    return [];
  }
}

export default function FriendlyReviewForm() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [review, setReview] = useState("");

  useEffect(() => setReviews(readSavedReviews()), []);

  function save(nextReviews) {
    const limited = nextReviews.slice(-20);
    setReviews(limited);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  }

  function submit(event) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanPlace = place.trim();
    const cleanReview = review.trim();
    if (!cleanName || !cleanReview) return;

    const entry = {
      id: window.crypto?.randomUUID?.() || `${Date.now()}`,
      name: cleanName,
      place: cleanPlace,
      review: cleanReview,
    };
    save([...reviews, entry]);
    setName("");
    setPlace("");
    setReview("");

    const message = `Friendly review for Allen Gillon\n\n${cleanReview}\n\n- ${cleanName}${cleanPlace ? `, ${cleanPlace}` : ""}`;
    window.location.href = `sms:${PHONE}?&body=${encodeURIComponent(message)}`;
  }

  function removeReview(id) {
    save(reviews.filter((entry) => entry.id !== id));
  }

  return (
    <section className="addReview" aria-labelledby="add-review-title">
      <div className="reviewFormIntro">
        <p className="reviewKicker">Your turn</p>
        <h2 id="add-review-title">Add a friendly review</h2>
        <p>Your review will appear on this device. The button also prepares a text to Allen so he can add it to the public page.</p>
      </div>

      <form className="friendlyReviewForm" onSubmit={submit}>
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
        <button className="btn" type="submit">Add review and text Allen</button>
      </form>

      {reviews.length ? (
        <div className="savedReviews" aria-live="polite">
          <h3>Added on this device</h3>
          {reviews.map((entry) => (
            <article key={entry.id}>
              <blockquote>&ldquo;{entry.review}&rdquo;</blockquote>
              <p>{entry.name}{entry.place ? ` · ${entry.place}` : ""}</p>
              <button type="button" onClick={() => removeReview(entry.id)}>Remove from this device</button>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
