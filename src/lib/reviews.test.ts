import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchReviews, reviewProblem, sendReview } from "./reviews";

const ok = { name: "Test Guest", rating: 3, text: "Good massage, arrived late." };

describe("reviewProblem", () => {
  it("accepts any star rating", () => {
    for (const rating of [1, 2, 3, 4, 5]) expect(reviewProblem({ ...ok, rating })).toBeNull();
  });
  it("says what's missing", () => {
    expect(reviewProblem({ ...ok, rating: 0 })).toMatch(/stars/);
    expect(reviewProblem({ ...ok, text: "ok" })).toMatch(/little more/);
    expect(reviewProblem({ ...ok, text: "x".repeat(1501) })).toMatch(/under/);
    expect(reviewProblem({ ...ok, name: " " })).toMatch(/name/);
  });
});

describe("calls", () => {
  afterEach(() => vi.unstubAllGlobals());
  const reply = (body: object) => vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => body })));

  it("returns published reviews", async () => {
    reply({ status: "success", value: [] });
    expect(await fetchReviews()).toEqual([]);
  });
  it("passes on the reason a review was refused", async () => {
    reply({ status: "error", errorData: "Please add your name.", errorMessage: "x" });
    await expect(sendReview(ok)).rejects.toThrow("Please add your name.");
  });
  it("never shows raw server errors", async () => {
    reply({ status: "error", errorMessage: "[Request ID: 1] Server Error" });
    await expect(sendReview(ok)).rejects.toThrow(/^failed$/);
  });
});
