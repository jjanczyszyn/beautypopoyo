import { useState } from "react";
import type { FormEvent } from "react";
import { GOOGLE_REVIEW_URL, MAX_TEXT, reviewProblem, sendReview } from "../lib/reviews";
import { defaultConfig } from "../lib/seedData";
import { buildWhatsAppLink } from "../lib/booking";

const SERVICES = ["Massage", "Body treatment", "Hair", "Nails", "More than one"];

export function ReviewPage() {
  const [rating, setRating] = useState(0);
  const [service, setService] = useState("");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const review = { name, rating, text, service, website };
    const missing = reviewProblem(review);
    setProblem(missing); setFailed(false);
    if (missing) return;
    setBusy(true);
    try {
      await sendReview(review);
      setSent(true);
      window.scrollTo(0, 0);
    } catch (err) {
      const reason = err instanceof Error ? err.message : "failed";
      // Our own short explanations are shown; anything else gets a way round it.
      if (/^(Please|That|We can't)/.test(reason)) setProblem(reason);
      else setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="container row">
          <a href="/" className="brand">Popoyo<span className="dot">.</span>Beauty</a>
        </div>
      </header>
      <main className="container review-page">
        {sent ? (
          <div role="status">
            <h1>Thank you</h1>
            <p>We have your review. It will appear on our site once we've checked it's from a customer.</p>
            {GOOGLE_REVIEW_URL && (
              <p>You can also <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">post it on Google</a>.</p>
            )}
            <a className="btn btn-secondary" href="/">Back to Popoyo Beauty</a>
          </div>
        ) : (
          <>
            <h1>How was it?</h1>
            <form className="form" onSubmit={submit} noValidate>
              <fieldset className="star-picker">
                <legend>Your rating</legend>
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className={n <= rating ? "on" : ""}>
                    <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} aria-label={`${n} ${n === 1 ? "star" : "stars"}`} />
                    <span aria-hidden="true">★</span>
                  </label>
                ))}
              </fieldset>
              <label>
                What did you have? (optional)
                <select value={service} onChange={(e) => setService(e.target.value)}>
                  <option value="">Choose</option>
                  {SERVICES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label>
                Your review
                <textarea rows={6} maxLength={MAX_TEXT} value={text} onChange={(e) => setText(e.target.value)} />
              </label>
              <label>
                Your name, as you'd like it shown
                <input value={name} maxLength={60} autoComplete="name" onChange={(e) => setName(e.target.value)} />
              </label>
              <div className="hp" aria-hidden="true">
                <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
              </div>
              {problem && <div className="form-error" role="alert">{problem}</div>}
              {failed && (
                <div className="form-error" role="alert">
                  Your review wasn't sent. Try again, or{" "}
                  <a href={buildWhatsAppLink(`My review of Popoyo Beauty (${rating}/5): ${text}`, defaultConfig.whatsappNumber)} target="_blank" rel="noreferrer">send it on WhatsApp</a>.
                </div>
              )}
              <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Send review"}</button>
              <p className="review-note">
                We publish your name, stars and words on this site after checking you're a customer.
                We publish critical reviews too.
              </p>
            </form>
          </>
        )}
      </main>
    </>
  );
}
