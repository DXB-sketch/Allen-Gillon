"use client";

import { useEffect, useState } from "react";

// Visitor reviews, loaded from /api/reviews (D1). They publish as soon as
// they are sent; a review just sent from the form on this page is added at
// the top without a reload (the "allen:review-added" event). Renders
// nothing until there is at least one, so the page never shows an empty
// heading.
//
// The response body is always read, even on an error status, so the request
// is closed cleanly, and a timeout covers a stalled server. (This is hygiene:
// the networkidle hang noted in e2e/layout.spec.mjs was not reproduced.)
export default function ApprovedReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    fetch("/api/reviews", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json().then((data) => (response.ok ? data : { reviews: [] })))
      .then((data) => {
        if (Array.isArray(data.reviews)) setReviews(data.reviews);
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const added = (event) => {
      const review = event.detail;
      if (review?.id) setReviews((current) => [review, ...current.filter((entry) => entry.id !== review.id)]);
    };
    window.addEventListener("allen:review-added", added);
    return () => window.removeEventListener("allen:review-added", added);
  }, []);

  if (!reviews.length) return null;

  return (
    <section className="approvedReviews" aria-labelledby="approved-reviews-title">
      <h2 id="approved-reviews-title">More friendly reviews</h2>
      <div className="approvedList">
        {reviews.map((entry) => (
          <figure key={entry.id}>
            <blockquote>
              <p>&ldquo;{entry.body}&rdquo;</p>
            </blockquote>
            <figcaption>
              {entry.name}
              {entry.place ? `, ${entry.place}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
