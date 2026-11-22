// Customer reviews. Stored and approved in the moto admin's Convex backend
// (repo motopopoyo, convex/beautyReviews.ts), reached over its HTTP API.

const CONVEX_URL = import.meta.env.VITE_REVIEWS_URL ?? "https://tough-meadowlark-233.convex.cloud";

// Set once the Google Business Profile is verified: everyone who leaves a
// review is then also offered Google, whatever their stars.
export const GOOGLE_REVIEW_URL = "";

export const MAX_TEXT = 1500;
export const MIN_TEXT = 10;

export type Review = {
  _id: string; name: string; rating: number; text: string; service?: string; createdAt: number;
};
export type NewReview = { name: string; rating: number; text: string; service?: string; website?: string };

/** What's still missing, or null when it can be sent. */
export function reviewProblem(r: NewReview): string | null {
  if (!(r.rating >= 1 && r.rating <= 5)) return "Please choose 1 to 5 stars.";
  if (r.text.trim().length < MIN_TEXT) return "Please write a little more.";
  if (r.text.trim().length > MAX_TEXT) return `Please keep it under ${MAX_TEXT} characters.`;
  if (!r.name.trim()) return "Please add your name.";
  return null;
}

async function call(kind: "query" | "mutation", path: string, args: object) {
  const res = await fetch(`${CONVEX_URL}/api/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args, format: "json" }),
  });
  const body = await res.json();
  if (body.status !== "success") {
    throw new Error(typeof body.errorData === "string" ? body.errorData : "failed");
  }
  return body.value;
}

export const fetchReviews = (): Promise<Review[]> => call("query", "beautyReviews:published", {});

export async function sendReview(r: NewReview): Promise<void> {
  await call("mutation", "beautyReviews:submit", {
    ...r,
    service: r.service || undefined,
    website: r.website || undefined,
  });
}

export const monthYear = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "long", year: "numeric" });
