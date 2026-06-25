"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useIsSignedIn } from "@/lib/use-auth";
import { UserMenu } from "@/components/user-menu";
import { SearchBox } from "@/components/searchbox";
import { Spinner } from "@/components/spinner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, recheckAuth, user] = useIsSignedIn();
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const isPropertyPage = pathname.startsWith("/property/");

  const handleSignOut = async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    recheckAuth();
  };

  async function handleNavSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!placeId) return;
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE}/properties/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id: placeId }),
      });
      if (!res.ok) return;
      const address = await res.json();
      router.push(`/property/${address.id}`);
    } finally {
      setSearching(false);
    }
  }

  return (
    <nav className="py-4 px-6 sm:px-12 border-b border-neutral-200/60 bg-[#fcfcfb]">
      <div className="max-w-6xl mx-auto flex items-center gap-4">

        <Link href="/" className="font-serif italic text-xl tracking-tight text-neutral-900 shrink-0">
          PadCheck
        </Link>

        {isPropertyPage && (
          <form
            onSubmit={handleNavSearch}
            className="flex-1 max-w-sm flex items-center bg-white ring-1 ring-black/5 rounded-xl overflow-visible"
          >
            <SearchBox
              onSelect={(s) => setPlaceId(s.place_id)}
              onQueryChange={() => setPlaceId(null)}
            />
            <button
              type="submit"
              disabled={!placeId || searching}
              className="shrink-0 mr-2 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium disabled:opacity-40 flex items-center gap-1.5"
            >
              {searching && <Spinner />}
              {searching ? "Searching" : "Go"}
            </button>
          </form>
        )}

        <div className="ml-auto flex items-center gap-6 sm:gap-8">
          {loggedIn === null ? (
            <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
          ) : loggedIn && user ? (
            <UserMenu user={user} onSignOut={handleSignOut} />
          ) : (
            <Link
              href={`/auth?returnUrl=${encodeURIComponent(pathname)}`}
              className="text-sm font-medium py-2 px-4 rounded-full ring-1 ring-black/5 bg-neutral-100 text-neutral-700"
            >
              Sign in
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}
