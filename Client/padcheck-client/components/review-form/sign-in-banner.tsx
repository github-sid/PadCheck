"use client";

import { LogIn } from "lucide-react";
import { usePathname } from "next/navigation";

export function SignInBanner() {
  const pathname = usePathname();
  const returnUrl = encodeURIComponent(`${pathname}?openReview=1`);
  const href = `/auth?returnUrl=${returnUrl}`;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 ring-1 ring-neutral-200">
      <div className="size-9 rounded-lg bg-white ring-1 ring-neutral-200 grid place-items-center shrink-0">
        <LogIn className="size-4 text-neutral-500" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-800">Sign in to leave a review</p>
        <p className="text-xs text-neutral-500 mt-0.5">
          <a href={href} className="text-brand-primary font-semibold underline underline-offset-2 hover:opacity-70">
            Create an account or sign in
          </a>
          {" "}to share your experience.
        </p>
      </div>
    </div>
  );
}
