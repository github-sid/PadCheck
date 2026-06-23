"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useIsSignedIn(): [boolean, () => void] {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [tick, setTick] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => setIsSignedIn(res.ok))
      .catch(() => setIsSignedIn(false));
  }, [pathname, tick]);

  return [isSignedIn, () => setTick((t) => t + 1)];
}
