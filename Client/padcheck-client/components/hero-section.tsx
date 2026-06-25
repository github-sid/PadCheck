"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/header";
import { SearchBox } from "./searchbox";
import { Spinner } from "@/components/spinner";
import { ReviewMarqueeCard, type MarqueeReview } from "@/components/review-marquee-card";
import houseJason from "../assest/Houses/jason-briscoe-UV81E0oXXWQ-unsplash.jpg";
import houseDylan from "../assest/Houses/dylan-fout-orDgvHvQlSE-unsplash.jpg";
import houseKara from "../assest/Houses/kara-eads-L7EwHkq1B2s-unsplash.jpg";
import housePatrick from "../assest/Houses/patrick-perkins-3wylDrjxH-E-unsplash.jpg";
import houseNaomi from "../assest/Houses/naomi-hebert-MP0bgaS_d1c-unsplash.jpg";
import houseRoam from "../assest/Houses/roam-in-color-AwOG1tC5buE-unsplash.jpg";
import houseDaniel from "../assest/Houses/daniel-barnes-RKdLlTyjm5g-unsplash.jpg";
import houseZane from "../assest/Houses/zane-lee-ECsnJcc0Dhs-unsplash.jpg";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const DUMMY_REVIEWS: MarqueeReview[] = [
  {
    address: "123 Queen St W, Toronto, ON",
    imageUrl: houseJason.src,
    rating: 4.5,
    text: "Landlord was incredibly responsive. Maintenance requests were handled within 24 hours every time.",
    date: "June 2025",
  },
  {
    address: "88 Pacific Blvd, Vancouver, BC",
    imageUrl: houseDylan.src,
    rating: 3,
    text: "Thin walls and noisy neighbours on weekends. Heat was inconsistent in winter months.",
    date: "May 2025",
  },
  {
    address: "410 Elgin St, Ottawa, ON",
    imageUrl: houseKara.src,
    rating: 5,
    text: "Best rental experience I've had. Super clean building, secure entry, and great location.",
    date: "May 2025",
  },
  {
    address: "22 17th Ave SW, Calgary, AB",
    imageUrl: housePatrick.src,
    rating: 4,
    text: "Quiet street, lots of natural light. Landlord a bit slow to respond but always resolved things.",
    date: "April 2025",
  },
  {
    address: "305 Sherbrooke St W, Montréal, QC",
    imageUrl: houseNaomi.src,
    rating: 3.5,
    text: "Great neighbourhood but the building is older. Had some plumbing issues in the first month.",
    date: "April 2025",
  },
  {
    address: "1740 Gottingen St, Halifax, NS",
    imageUrl: houseRoam.src,
    rating: 4.5,
    text: "Amazing value. Landlord was proactive about seasonal maintenance. Would rent here again.",
    date: "March 2025",
  },
  {
    address: "550 Wellington St W, Toronto, ON",
    imageUrl: houseDaniel.src,
    rating: 2.5,
    text: "Frequent elevator outages and a property management company that was hard to reach.",
    date: "March 2025",
  },
  {
    address: "1200 Robson St, Vancouver, BC",
    imageUrl: houseZane.src,
    rating: 5,
    text: "Spotless unit, walk score of 99, and the management team genuinely cares about tenants.",
    date: "February 2025",
  },
];

export function HeroSection() {
  const router = useRouter();
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!placeId) return;
    setError(null);
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE}/properties/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id: placeId }),
      });
      if (!res.ok) throw new Error("Could not find that property");
      const address = await res.json();
      router.push(`/property/${address.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-neutral-800 font-sans">
      <section className="py-15 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="max-w-[14ch] text-5xl sm:text-6xl font-medium font-serif leading-[1.05] tracking-tight text-neutral-900 text-balance mb-8">
            Find the truth behind the lease.
          </h1>
          <p className="max-w-[56ch] text-base text-neutral-600 text-pretty mb-12">
            A community-led database of rental experiences. Search verified reviews of landlords,
            neighborhood noise, and maintenance history before you sign.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center bg-white ring-1 ring-black/5 rounded-2xl p-2 max-w-2xl"
          >
            <SearchBox
              onSelect={(s) => {
                setPlaceId(s.place_id);
                setError(null);
              }}
              onQueryChange={() => {
                setPlaceId(null);
              }}
            />
            <button
              type="submit"
              disabled={!placeId || searching}
              className="bg-black text-neutral-50 text-sm font-medium px-6 py-2.5 rounded-xl disabled:opacity-50 flex items-center gap-2 hover:bg-neutral-800 transition-colors"
            >
              {searching && <Spinner />}
              {searching ? "Searching…" : "Search properties"}
            </button>
          </form>
          {error && (
            <p className="text-sm text-red-600 mt-3 px-1">{error}</p>
          )}
        </div>
      </section>

      <section className="py-10 border-t border-neutral-100">
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest px-6 sm:px-12 mb-8">
          Recently reviewed
        </h2>
        <div className=" py-10 group overflow-hidden">
          <div className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused]">
            {[...DUMMY_REVIEWS, ...DUMMY_REVIEWS].map((review, i) => (
              <ReviewMarqueeCard key={i} review={review} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
