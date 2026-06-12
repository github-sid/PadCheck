"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("token")
  );

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    router.push("/auth");
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
