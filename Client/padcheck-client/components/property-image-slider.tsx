"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import house1 from "../assest/house1.jpg";

export type SliderImage = {
  url: string;
  caption?: string;
};

type Props = {
  images: SliderImage[];
  address: string;
};

export function PropertyImageSlider({ images, address }: Props) {
  const [idx, setIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-4/3 overflow-hidden rounded-2xl outline-1 -outline-offset-1 outline-black/5 bg-neutral-100">
        <Image src={house1} alt="Property" className="object-cover w-full h-full" />
      </div>
    );
  }

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);
  const current = images[idx];

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full aspect-4/3 overflow-hidden rounded-2xl outline-1 -outline-offset-1 outline-black/5 bg-neutral-100 group">
        <Image
          key={current.url}
          src={current.url}
          alt={current.caption ?? `Photo of ${address}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {current.caption && (
          <span className="absolute bottom-3 left-3 text-[11px] font-medium uppercase tracking-wider text-white bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
            {current.caption}
          </span>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-8 grid place-items-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-8 grid place-items-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              aria-label="Next photo"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${
                i === idx
                  ? "w-4 h-1.5 bg-neutral-800"
                  : "size-1.5 bg-neutral-300 hover:bg-neutral-500"
              }`}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
