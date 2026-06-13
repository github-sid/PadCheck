"use client";

import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import { Navbar } from "@/components/header";

const PLACEHOLDER_PROPERTY = {
  id: "1",
  address: "42 Elmwood Avenue, Apt 3B",
  city: "San Francisco",
  region: "CA",
  postal_code: "94117",
  property_type: "Apartment",
};

const PLACEHOLDER_REVIEWS = [
  {
    id: "r1",
    title: "Great landlord, loved the neighborhood",
    body: "Lived here for two years. The landlord was always responsive and fixed issues within a day or two. The neighborhood is walkable and safe. Only downside was the rent increased significantly at renewal.",
    rating_landlord: 5,
    rating_value: 3,
    rating_neighborhood: 5,
    rating_maintenance: 4,
    created_at: "2024-11-01T00:00:00Z",
    display_name: "Jordan M.",
  },
  {
    id: "r2",
    title: "Decent place, slow on repairs",
    body: "The apartment itself is nice and the location is convenient. Maintenance requests sometimes took weeks. Overall a fair experience for the price.",
    rating_landlord: 3,
    rating_value: 4,
    rating_neighborhood: 4,
    rating_maintenance: 2,
    created_at: "2024-08-15T00:00:00Z",
    display_name: "Alex K.",
  },
];

function avg(reviews: typeof PLACEHOLDER_REVIEWS) {
  if (!reviews.length) return { landlord: 0, value: 0, neighborhood: 0, maintenance: 0, overall: 0 };
  const sum = reviews.reduce(
    (a, r) => ({
      landlord: a.landlord + r.rating_landlord,
      value: a.value + r.rating_value,
      neighborhood: a.neighborhood + r.rating_neighborhood,
      maintenance: a.maintenance + r.rating_maintenance,
    }),
    { landlord: 0, value: 0, neighborhood: 0, maintenance: 0 }
  );
  const n = reviews.length;
  const out = {
    landlord: sum.landlord / n,
    value: sum.value / n,
    neighborhood: sum.neighborhood / n,
    maintenance: sum.maintenance / n,
  };
  return { ...out, overall: (out.landlord + out.value + out.neighborhood + out.maintenance) / 4 };
}

export default function PropertyPage() {
  const property = PLACEHOLDER_PROPERTY;
  const reviews = PLACEHOLDER_REVIEWS;
  const stats = avg(reviews);

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-neutral-800 font-sans">
      <Navbar />

      <section className="py-16 sm:py-24 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Left column */}
            <div className="lg:col-span-7">
              <Link href="/" className="text-xs font-medium uppercase tracking-wider text-neutral-400 hover:text-neutral-600">
                ← Back
              </Link>

              <div className="mt-6 mb-10">
                <h1 className="text-4xl font-serif font-medium text-neutral-900 leading-tight tracking-tight mb-3">
                  {property.address}
                </h1>
                <p className="text-sm text-neutral-500">
                  {property.city}{property.region ? `, ${property.region}` : ""}
                  {property.postal_code ? ` ${property.postal_code}` : ""}
                  {property.property_type ? ` • ${property.property_type}` : ""}
                </p>
              </div>

              {/* Image placeholder */}
              <div className="w-full aspect-video overflow-hidden rounded-2xl outline-1 -outline-offset-1 outline-black/5 mb-12 bg-neutral-100" />

              {/* Rating bars */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-8 py-8 border-y border-neutral-200/60">
                <RatingBar label="Landlord Responsiveness" value={stats.landlord} />
                <RatingBar label="Value for Money" value={stats.value} />
                <RatingBar label="Neighborhood Safety" value={stats.neighborhood} />
                <RatingBar label="Maintenance Speed" value={stats.maintenance} />
              </div>

              {/* Reviews */}
              <div className="mt-12 space-y-10">
                {reviews.length === 0 && (
                  <p className="text-sm text-neutral-500">No reviews yet. Be the first to share your experience.</p>
                )}
                {reviews.map((r) => {
                  const overall = (r.rating_landlord + r.rating_value + r.rating_neighborhood + r.rating_maintenance) / 4;
                  return (
                    <article key={r.id} className="space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Stars value={overall} />
                        <span className="text-xs font-medium text-neutral-400">
                          {new Date(r.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                          {r.display_name ? ` • ${r.display_name}` : ""}
                        </span>
                      </div>
                      <h4 className="text-lg font-medium text-neutral-900">{r.title}</h4>
                      <p className="text-sm text-neutral-600 leading-relaxed text-pretty max-w-[60ch]">{r.body}</p>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Right column — review form */}
            <div className="lg:col-span-5">
              <ReviewForm />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 5) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-neutral-600">{label}</span>
        <span className="text-sm font-semibold text-neutral-900">{value > 0 ? value.toFixed(1) : "—"}</span>
      </div>
      <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
        <div className="h-full bg-neutral-800" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
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

function RatingPicker({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{label}</label>
        <span className="text-xs text-neutral-500">{value || "—"}/5</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`size-10 rounded-lg ring-1 grid place-items-center text-sm transition-colors ${
              n <= value ? "bg-[#2d332d] text-white ring-[#2d332d]" : "ring-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [r1, setR1] = useState(0);
  const [r2, setR2] = useState(0);
  const [r3, setR3] = useState(0);
  const [r4, setR4] = useState(0);

  return (
    <div className="sticky top-12 p-8 bg-white ring-1 ring-black/5 rounded-2xl">
      <h3 className="text-xl font-serif font-medium text-neutral-900 mb-2">Have you lived here?</h3>
      <p className="text-sm text-neutral-500 mb-8">Your honest feedback helps the next renter make a better decision.</p>

      <form className="space-y-6">
        <RatingPicker label="Landlord" value={r1} onChange={setR1} />
        <RatingPicker label="Value" value={r2} onChange={setR2} />
        <RatingPicker label="Neighborhood" value={r3} onChange={setR3} />
        <RatingPicker label="Maintenance" value={r4} onChange={setR4} />

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Headline</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            className="w-full p-3 text-sm bg-neutral-50 ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300 placeholder-neutral-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Your experience</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="What should a future tenant know?"
            className="w-full p-4 text-sm bg-neutral-50 ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300 placeholder-neutral-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-[#2d332d] text-white font-medium text-sm transition-opacity hover:opacity-90"
        >
          Post review
        </button>
      </form>
    </div>
  );
}
