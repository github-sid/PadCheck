"use client";

import { useState, useEffect } from "react";
import { PencilLine, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ReviewForm } from "./review-form";
import { useIsSignedIn } from "@/lib/use-auth";

export function WriteReviewButton({
  variant = "header",
  propertyId,
  defaultOpen = false,
}: {
  variant?: "header" | "card";
  propertyId?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isSignedIn = useIsSignedIn();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (defaultOpen) {
      router.replace(pathname);
    }
    // one-shot: strip the ?openReview=1 param from URL on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          variant === "card"
            ? "flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
            : "inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-brand-primary text-white font-medium text-sm hover:opacity-90 transition-opacity shrink-0"
        }
      >
        <PencilLine className="size-4" />
        Write a review
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-brand-surface rounded-2xl ring-1 ring-black/5 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 size-8 grid place-items-center rounded-full hover:bg-neutral-100 text-neutral-500"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <ReviewForm disabled={!isSignedIn} propertyId={propertyId} />
          </div>
        </div>
      )}
    </>
  );
}
