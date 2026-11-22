import { useEffect, useState } from "react";
import { fetchReviews, monthYear } from "../lib/reviews";
import type { Review } from "../lib/reviews";

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" role="img" aria-label={`${rating} of 5 stars`}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

/** Published reviews on the home page. Without any, just the invitation. */
export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    let live = true;
    fetchReviews().then((r) => { if (live) setReviews(r); }).catch(() => {});
    return () => { live = false; };
  }, []);

  return (
    <section id="reviews" className="tinted">
      <div className="container">
        <div className="section-head">
          <h2>Reviews</h2>
        </div>
        {reviews.length > 0 && (
          <div className="cards">
            {reviews.map((r) => (
              <figure className="review-card" key={r._id}>
                <Stars rating={r.rating} />
                <blockquote>{r.text}</blockquote>
                <figcaption>
                  {r.name}<span>{[r.service, monthYear(r.createdAt)].filter(Boolean).join(" · ")}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="review-cta">
          <a className="btn btn-secondary" href="/review/">Leave a review</a>
        </div>
      </div>
    </section>
  );
}
