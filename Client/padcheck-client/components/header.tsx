"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsSignedIn } from "@/lib/use-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function Navbar() {
  const router = useRouter();
  const loggedIn = useIsSignedIn();

  const handleSignOut = async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };

  return (
    <nav className="py-6 px-6 sm:px-12 border-b border-neutral-200/60 bg-[#fcfcfb]">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        <Link href="/" className="font-serif italic text-xl tracking-tight text-neutral-900">
          PadCheck
        </Link>

        <div className="flex items-center gap-6 sm:gap-8">

          {loggedIn ? (
            <button
              onClick={handleSignOut}
              className="text-sm font-medium py-2 px-4 rounded-full ring-1 ring-black/5 bg-neutral-100 text-neutral-700"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/auth"
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
