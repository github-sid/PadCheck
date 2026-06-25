"use client";
import { useState } from "react";
import { ReviewCard, type ReviewCardData } from "./review-card";

const PAGE_SIZE = 5;

export function ReviewList({ reviews }: { reviews: ReviewCardData[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const hasMore = visibleCount < reviews.length;

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No reviews yet. Be the first to leave one!
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.slice(0, visibleCount).map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
      {hasMore && (
        <button
          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
          className="w-full py-3 text-sm font-medium text-neutral-600 ring-1 ring-black/10 rounded-xl hover:bg-neutral-50"
        >
          Load More
        </button>
      )}
    </div>
  );
}
