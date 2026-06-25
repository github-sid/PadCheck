import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star, MapPin, Hash, Calendar,
  Footprints, Bus, Train, ShoppingCart, Pill, Stethoscope, Hospital, GraduationCap, Trees, Building2,
} from "lucide-react";
import { Navbar } from "@/components/header";
import { WriteReviewButton } from "@/components/write-review-button";
import { PropertyImageSlider, type SliderImage } from "@/components/property-image-slider";
import { Stars, type ReviewCardData } from "@/components/review-card";
import { ReviewList } from "@/components/review-list";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;


type Address = {
  id: string;
  street_address: string;
  unit_number: string | null;
  city: string;
  province: string;
  postal_code: string;
  lat: string | number | null;
  lng: string | number | null;
  neighbourhood: string | null;
  ward: string | null;
  street_view_url: string | null;
  created_at: string;
};

type StaticData = {
  walk_score: number | null;
  transit_score: number | null;
  nearest_subway_m: number | null;
  nearest_subway_name: string | null;
  nearest_bus_stop_m: number | null;
  nearest_supermarket_m: number | null;
  nearest_pharmacy_m: number | null;
  nearest_hospital_m: number | null;
  nearest_clinic_m: number | null;
  nearest_school_m: number | null;
  nearest_school_name: string | null;
  nearest_park_m: number | null;
};

type Review = {
  id: string;
  rating_overall: number;
  rating_noise: number;
  rating_safety: number;
  rating_transit: number;
  rating_amenities: number;
  rating_landlord: number;
  review_text: string | null;
  photo_urls: string[];
  created_at: string;
};

type PropertyPageData = {
  address: Address;
  static: StaticData | null;
  reviews: Review[];
};

async function getProperty(id: string): Promise<PropertyPageData | null> {
  const res = await fetch(`${API_BASE}/properties/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load property");
  return res.json();
}

function avgFields(reviews: Review[]) {
  if (reviews.length === 0) {
    return { landlord: 0, safety: 0, transit: 0, amenities: 0, noise: 0, overall: 0 };
  }
  const sum = reviews.reduce(
    (a, r) => ({
      landlord: a.landlord + r.rating_landlord,
      safety: a.safety + r.rating_safety,
      transit: a.transit + r.rating_transit,
      amenities: a.amenities + r.rating_amenities,
      noise: a.noise + r.rating_noise,
      overall: a.overall + r.rating_overall,
    }),
    { landlord: 0, safety: 0, transit: 0, amenities: 0, noise: 0, overall: 0 }
  );
  const n = reviews.length;
  return {
    landlord: sum.landlord / n,
    safety: sum.safety / n,
    transit: sum.transit / n,
    amenities: sum.amenities / n,
    noise: sum.noise / n,
    overall: sum.overall / n,
  };
}

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ openReview?: string }>;
}) {
  const { id } = await params;
  const { openReview } = await searchParams;
  const data = await getProperty(id);
  if (!data) notFound();

  const { address, reviews } = data;
  const stats = avgFields(reviews);
  const addressLine = [address.unit_number ? `Unit ${address.unit_number}` : null, address.street_address]
    .filter(Boolean)
    .join(", ");

  const sliderImages: SliderImage[] = [
    ...(address.street_view_url ? [{ url: address.street_view_url, caption: "Street View" }] : []),
    ...reviews.flatMap((r) =>
      r.photo_urls.map((url) => ({ url, caption: "Renter photo" }))
    ),
  ];

  const displayReviews: ReviewCardData[] = reviews.map((r) => ({
    id: r.id,
    rating_overall: r.rating_overall,
    review_text: r.review_text,
    photo_urls: r.photo_urls,
    created_at: r.created_at,
  }));

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-brand-surface text-neutral-800 font-sans">
      <Navbar />

      <div className="flex-1 min-h-0 overflow-hidden px-6 sm:px-12">
        <div className="h-full max-w-6xl mx-auto flex flex-col">

          {/* Back link */}
          <div className="pt-8 pb-3 shrink-0">
            <Link href="/" className="text-xs font-medium uppercase tracking-wider text-neutral-400 hover:text-neutral-600">
              ← Back to search
            </Link>
          </div>

          {/* Two-column layout */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-x-16">

            {/* ── Left: fixed ── */}
            <div className="lg:col-span-5 min-h-0 overflow-hidden flex flex-col gap-6 py-4">
              <div className="shrink-0">
                <h1 className="text-4xl sm:text-5xl font-serif font-medium text-neutral-900 leading-tight tracking-tight mb-3">
                  {addressLine}
                </h1>
                <p className="text-sm text-neutral-500 flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {address.city}, {address.province} {address.postal_code}
                </p>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <PropertyImageSlider images={sliderImages} address={addressLine} />
              </div>
            </div>

            {/* ── Right: scrollable ── */}
            <div className="lg:col-span-7 min-h-0 overflow-y-auto space-y-10 py-4 pb-12">

              {/* Score + write review */}
              <div className="p-6 bg-white ring-1 ring-black/5 rounded-2xl flex items-center gap-6">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-medium text-neutral-900">
                      {stats.overall > 0 ? stats.overall.toFixed(1) : "—"}
                    </span>
                    <span className="text-sm text-neutral-500">/ 5</span>
                  </div>
                  <Stars value={stats.overall} />
                  <p className="mt-2 text-xs text-neutral-500">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
                <div className="h-16 w-px bg-neutral-200/60" />
                <WriteReviewButton variant="card" propertyId={id} defaultOpen={openReview === "1"} />
              </div>

              {/* About */}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-6">
                  About this property
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <DetailRow icon={Hash} label="Postal code" value={address.postal_code} />
                  <DetailRow icon={MapPin} label="Province" value={address.province} />
                  <DetailRow
                    icon={Calendar}
                    label="Listed on PadCheck"
                    value={new Date(address.created_at).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  />
                  <DetailRow
                    icon={Star}
                    label="Reviews"
                    value={`${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`}
                  />
                </dl>
              </div>

              {/* Renter ratings */}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-6">
                  Renter ratings
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                  <RatingBar label="Landlord Responsiveness" value={stats.landlord} />
                  <RatingBar label="Neighborhood Safety" value={stats.safety} />
                  <RatingBar label="Transit Access" value={stats.transit} />
                  <RatingBar label="Amenities" value={stats.amenities} />
                  <RatingBar label="Noise Level" value={stats.noise} />
                </div>
              </div>

              <LocationCard address={address} />
              <NeighbourhoodCard stat={data.static} />

              {/* Reviews */}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-6">
                  Reviews from renters
                </h2>
                <ReviewList reviews={displayReviews} />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 text-neutral-400 mt-0.5 shrink-0" />
      <div>
        <dt className="text-xs font-medium uppercase tracking-wider text-neutral-400">{label}</dt>
        <dd className="text-sm text-neutral-900 mt-0.5">{value}</dd>
      </div>
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

function fmtDist(m: number | null | undefined) {
  if (m == null) return "—";
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

function LocationCard({ address }: { address: Address }) {
  const line2 = `${address.city}, ${address.province} ${address.postal_code}`;
  const hasCoords = address.lat != null && address.lng != null;
  const mapsUrl = `https://www.google.com/maps?q=${address.lat},${address.lng}`;
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-6">Location</h2>
      <div className="p-6 bg-white ring-1 ring-black/5 rounded-2xl space-y-5">
        <div className="flex items-start gap-3">
          <MapPin className="size-4 text-neutral-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {address.unit_number ? `Unit ${address.unit_number}, ` : ""}
              {address.street_address}
            </p>
            <p className="text-sm text-neutral-500">{line2}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-1">
          <DetailRow icon={Building2} label="Neighbourhood" value={address.neighbourhood ?? "—"} />
          <DetailRow icon={Hash} label="Ward" value={address.ward ?? "—"} />
          <DetailRow icon={MapPin} label="Latitude" value={address.lat != null ? String(address.lat) : "—"} />
          <DetailRow icon={MapPin} label="Longitude" value={address.lng != null ? String(address.lng) : "—"} />
        </div>
        {hasCoords && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-medium uppercase tracking-wider text-neutral-500 hover:text-neutral-900"
          >
            Open in Google Maps →
          </a>
        )}
      </div>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number | null | undefined }) {
  const v = value ?? 0;
  const tone =
    v >= 80 ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : v >= 60 ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-neutral-100 text-neutral-600 ring-neutral-200";
  return (
    <div className="p-4 rounded-xl ring-1 ring-black/5 bg-white">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-serif font-medium text-neutral-900">{value ?? "—"}</span>
        <span className="text-xs text-neutral-400">/ 100</span>
      </div>
      <span className={`mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${tone}`}>
        {v >= 80 ? "Very walkable" : v >= 60 ? "Good" : "Limited"}
      </span>
    </div>
  );
}

function AmenityRow({
  icon: Icon,
  label,
  distance_m,
  name,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  distance_m: number | null | undefined;
  name?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-neutral-200/60 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <Icon className="size-4 text-neutral-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm text-neutral-900">{label}</p>
          {name && <p className="text-xs text-neutral-500 truncate">{name}</p>}
        </div>
      </div>
      <span className="text-sm font-medium text-neutral-700 tabular-nums shrink-0">{fmtDist(distance_m)}</span>
    </div>
  );
}

function NeighbourhoodCard({ stat }: { stat: StaticData | null }) {
  if (!stat) {
    return (
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-6">
          Neighbourhood & amenities
        </h2>
        <p className="text-sm text-neutral-500">Neighbourhood data isn&apos;t available for this property yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-6">
        Neighbourhood & amenities
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <ScorePill label="Walk Score" value={stat.walk_score} />
        <ScorePill label="Transit Score" value={stat.transit_score} />
      </div>
      <div className="p-6 bg-white ring-1 ring-black/5 rounded-2xl">
        <AmenityRow icon={Train} label="Nearest subway" distance_m={stat.nearest_subway_m} name={stat.nearest_subway_name} />
        <AmenityRow icon={Bus} label="Nearest bus stop" distance_m={stat.nearest_bus_stop_m} />
        <AmenityRow icon={ShoppingCart} label="Supermarket" distance_m={stat.nearest_supermarket_m} />
        <AmenityRow icon={Pill} label="Pharmacy" distance_m={stat.nearest_pharmacy_m} />
        <AmenityRow icon={Hospital} label="Hospital" distance_m={stat.nearest_hospital_m} />
        <AmenityRow icon={Stethoscope} label="Clinic" distance_m={stat.nearest_clinic_m} />
        <AmenityRow icon={GraduationCap} label="School" distance_m={stat.nearest_school_m} name={stat.nearest_school_name} />
        <AmenityRow icon={Trees} label="Park" distance_m={stat.nearest_park_m} />
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        <Footprints className="size-3 inline -mt-0.5 mr-1" />
        Walking distances are approximate.
      </p>
    </div>
  );
}
