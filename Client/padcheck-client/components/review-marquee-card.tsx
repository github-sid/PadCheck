export type MarqueeReview = {
  address: string;
  imageUrl: string;
  rating: number;
  text: string;
  date: string;
};

export function ReviewMarqueeCard({ review }: { review: MarqueeReview }) {
  return (
    <div className="w-60 shrink-0 rounded-xl overflow-hidden bg-white ring-1 ring-black/5 shadow-sm">
      <div className="aspect-[4/3] overflow-hidden bg-neutral-200">
        <img
          src={review.imageUrl}
          alt={review.address}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1.5">
          <Stars rating={review.rating} />
          <span className="text-sm font-semibold text-neutral-900">{review.rating.toFixed(1)}</span>
        </div>
        <p className="text-xs font-medium text-neutral-500 truncate">{review.address}</p>
        <p className="text-sm text-neutral-700 line-clamp-2">{review.text}</p>
        <p className="text-xs text-neutral-400">{review.date}</p>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`size-3.5 ${i < Math.round(rating) ? "fill-orange-500 text-orange-500" : "fill-neutral-200 text-neutral-200"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
