"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/header";
import { SearchBox } from "./searchbox";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
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
      <section className="py-20 px-6 sm:px-12">
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
                setQuery(s.address_line1);
                setPlaceId(s.place_id);
                setError(null);
              }}
              onQueryChange={(q) => {
                setQuery(q);
                setPlaceId(null);
              }}
            />
            <button
              type="submit"
              disabled={!placeId || searching}
              className="bg-[#000000] text-neutral-50 text-sm font-medium px-6 py-2.5 rounded-xl disabled:opacity-50"
            >
              {searching ? "Searching…" : "Search properties"}
            </button>
          </form>
          {error && (
            <p className="text-sm text-red-600 mt-3 px-1">{error}</p>
          )}
        </div>
      </section>

      <section className="py-16 bg-neutral-100/50 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-2xl font-serif font-medium text-neutral-900">
              {query.trim() ? "Search results" : "Recently reviewed"}
            </h2>
            <span className="text-sm font-medium text-neutral-500">
            </span>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-neutral-200 rounded-xl mb-4" />
                <div className="h-4 bg-neutral-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
              </div>
            ))}
          </div>

          <p className="text-sm text-neutral-500 py-12">
            No properties found. Be the first to add a review for your address.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <button
              key={"1"}
              onClick={() => { }}
              className="group text-left"
            >
              <div className="w-full aspect-[4/3] overflow-hidden rounded-[12px] outline-1 -outline-offset-1 outline-black/5 mb-4 bg-neutral-200">
                <img
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-semibold text-neutral-900">123 Main St</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-sm font-medium text-neutral-900">
                      4.5
                    </span>
                    <svg className="size-3 text-orange-500 fill-orange-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-neutral-500">
                  New York, NY • 45 reviews
                </p>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>

  );
}
