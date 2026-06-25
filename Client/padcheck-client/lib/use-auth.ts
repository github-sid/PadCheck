"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type AuthUser = {
  email: string;
  display_name?: string | null;
  provider: "email" | "gmail";
  role: "user" | "admin";
  created_at: string;
};

export function useIsSignedIn(): [boolean | null, () => void, AuthUser | null] {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tick, setTick] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setIsSignedIn(true);
          setUser({
            email: data.email,
            display_name: data.display_name,
            provider: data.provider,
            role: data.role,
            created_at: data.created_at,
          });
        } else {
          setIsSignedIn(false);
          setUser(null);
        }
      })
      .catch(() => {
        setIsSignedIn(false);
        setUser(null);
      });
  }, [pathname, tick]);

  return [isSignedIn, () => setTick((t) => t + 1), user];
}
