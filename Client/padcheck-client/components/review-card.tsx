import { Star } from "lucide-react";

export type ReviewCardData = {
  id: string;
  rating_overall: number;
  review_text: string | null;
  created_at: string;
  title?: string;
  user_name?: string;
};

export function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-4 ${i <= Math.round(value) ? "text-orange-500 fill-orange-500" : "text-neutral-200 fill-neutral-200"}`}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review }: { review: ReviewCardData }) {
  return (
    <article className="space-y-3 pb-8 border-b border-neutral-200/60 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 flex-wrap">
        <Stars value={review.rating_overall} />
        <span className="text-xs font-medium text-neutral-400">
          {new Date(review.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          {review.user_name ? ` • ${review.user_name}` : " • Verified renter"}
        </span>
      </div>
      {review.title && (
        <p className="text-sm font-medium text-neutral-800">{review.title}</p>
      )}
      {review.review_text && (
        <p className="text-sm text-neutral-600 leading-relaxed text-pretty">{review.review_text}</p>
      )}
    </article>
  );
}
