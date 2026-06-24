import { Star, TriangleAlert } from "lucide-react";

export type ReviewCardData = {
    id: string;
    rating_overall: number;
    rating_landlord?: number | null;
    rating_noise?: number | null;
    rating_safety?: number | null;
    rating_transit?: number | null;
    rating_amenities?: number | null;
    review_text: string | null;
    photo_urls?: string[];
    red_flags?: string[] | null;
    tenancy_start?: string | null;
    tenancy_end?: string | null;
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

function MiniRating({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-neutral-500 shrink-0">{label}</span>
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        className={`size-2.5 ${i <= value ? "text-neutral-700 fill-neutral-700" : "text-neutral-200 fill-neutral-200"}`}
                    />
                ))}
            </div>
        </div>
    );
}

function formatTenancy(start: string | null | undefined, end: string | null | undefined): string | null {
    if (!start) return null;
    const fmt = (d: string) =>
        new Date(d).toLocaleDateString(undefined, { month: "short", year: "numeric" });
    return end ? `${fmt(start)} – ${fmt(end)}` : `${fmt(start)} – present`;
}

export function ReviewCard({ review }: { review: ReviewCardData }) {
    const subRatings = [
        { label: "Landlord", value: review.rating_landlord },
        { label: "Noise", value: review.rating_noise },
        { label: "Safety", value: review.rating_safety },
        { label: "Transit", value: review.rating_transit },
        { label: "Amenities", value: review.rating_amenities },
    ].filter((r): r is { label: string; value: number } => typeof r.value === "number" && r.value > 0);

    const tenancy = formatTenancy(review.tenancy_start, review.tenancy_end);

    return (
        <article className="space-y-3 pb-8 border-b border-neutral-200/60 last:border-0 last:pb-0">
            {/* Header row */}
            <div className="flex items-center gap-2 flex-wrap">
                <Stars value={review.rating_overall} />
                <span className="text-xs font-medium text-neutral-400">
                    {new Date(review.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                    {review.user_name ? ` · ${review.user_name}` : " · Verified renter"}
                </span>
            </div>

            {/* Tenancy period */}
            {tenancy && (
                <p className="text-xs text-neutral-400 -mt-1">Lived here: {tenancy}</p>
            )}

            {/* Title + body */}
            {review.title && (
                <p className="text-sm font-medium text-neutral-800">{review.title}</p>
            )}
            {review.review_text && (
                <p className="text-sm text-neutral-600 leading-relaxed text-pretty">{review.review_text}</p>
            )}

            {/* Sub-ratings */}
            {subRatings.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 pt-1">
                    {subRatings.map((r) => (
                        <MiniRating key={r.label} label={r.label} value={r.value} />
                    ))}
                </div>
            )}

            {/* Red flags */}
            {review.red_flags && review.red_flags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {review.red_flags.map((flag) => (
                        <span
                            key={flag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-red-200"
                        >
                            <TriangleAlert className="size-3" />
                            {flag}
                        </span>
                    ))}
                </div>
            )}

            {/* Photos */}
            {review.photo_urls && review.photo_urls.length > 0 && (
                <div className="flex gap-2 flex-wrap pt-1">
                    {review.photo_urls.map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            key={i}
                            src={url}
                            alt={`Review photo ${i + 1}`}
                            className="size-20 rounded-lg object-cover ring-1 ring-black/5"
                        />
                    ))}
                </div>
            )}
        </article>
    );
}
