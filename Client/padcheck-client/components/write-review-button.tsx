"use client";

import { useState } from "react";
import { PencilLine, X } from "lucide-react";
import { ReviewForm } from "./review-form";

export function WriteReviewButton({ variant = "header" }: { variant?: "header" | "card" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          variant === "card"
            ? "flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2d332d] text-white font-medium text-sm hover:opacity-90 transition-opacity"
            : "inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-[#2d332d] text-white font-medium text-sm hover:opacity-90 transition-opacity shrink-0"
        }
      >
        <PencilLine className="size-4" />
        Write a review
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg my-8 bg-[#fcfcfb] rounded-2xl ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 size-8 grid place-items-center rounded-full hover:bg-neutral-100 text-neutral-500"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <ReviewForm />
          </div>
        </div>
      )}
    </>
  );
}
