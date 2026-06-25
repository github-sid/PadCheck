"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import house1 from "../assest/Houses/house1.jpg";
import houseAndrea from "../assest/Houses/andrea-davis-nbI8gqbBaHo-unsplash.jpg";
import houseBailey1 from "../assest/Houses/bailey-anselme-Bkp3gLygyeA-unsplash (1).jpg";
import houseBailey2 from "../assest/Houses/bailey-anselme-Bkp3gLygyeA-unsplash.jpg";
import houseChristian from "../assest/Houses/christian-koch-D_4R9CcYZOk-unsplash.jpg";
import houseDaniel from "../assest/Houses/daniel-barnes-RKdLlTyjm5g-unsplash.jpg";
import houseDavid from "../assest/Houses/david-veksler-VW5YwCYbPyk-unsplash.jpg";
import houseDigital from "../assest/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash.jpg";
import houseDoug from "../assest/Houses/doug-vos-HEHjFvFHpr8-unsplash.jpg";
import houseDylan from "../assest/Houses/dylan-fout-orDgvHvQlSE-unsplash.jpg";
import houseFrames from "../assest/Houses/frames-for-your-heart-2d4lAQAlbDA-unsplash.jpg";
import houseJason from "../assest/Houses/jason-briscoe-UV81E0oXXWQ-unsplash.jpg";
import houseJessica from "../assest/Houses/jessica-furtney-YOoucEImrKw-unsplash.jpg";
import houseJosh from "../assest/Houses/josh-hemsley-7QOKbETFg94-unsplash.jpg";
import houseKara from "../assest/Houses/kara-eads-L7EwHkq1B2s-unsplash.jpg";
import houseLukas from "../assest/Houses/lukas-d-iP_BWrXyx3k-unsplash.jpg";
import houseNaomi from "../assest/Houses/naomi-hebert-MP0bgaS_d1c-unsplash.jpg";
import housePatrick from "../assest/Houses/patrick-perkins-3wylDrjxH-E-unsplash.jpg";
import houseRoam from "../assest/Houses/roam-in-color-AwOG1tC5buE-unsplash.jpg";
import houseZacH from "../assest/Houses/zac-gudakov-hj2IezwH1VA-unsplash.jpg";
import houseZacM from "../assest/Houses/zac-gudakov-mw_mj-noYHM-unsplash.jpg";
import houseZane from "../assest/Houses/zane-lee-ECsnJcc0Dhs-unsplash.jpg";

import type { StaticImageData } from "next/image";

const FALLBACK_IMAGES: StaticImageData[] = [
  house1, houseAndrea, houseBailey1, houseBailey2, houseChristian, houseDaniel,
  houseDavid, houseDigital, houseDoug, houseDylan, houseFrames, houseJason,
  houseJessica, houseJosh, houseKara, houseLukas, houseNaomi, housePatrick,
  houseRoam, houseZacH, houseZacM, houseZane,
];

function pickFallback(address: string): StaticImageData {
  let hash = 0;
  for (let i = 0; i < address.length; i++) hash = (hash * 31 + address.charCodeAt(i)) | 0;
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
}

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
        <Image src={pickFallback(address)} alt="Property" className="object-cover w-full h-full" />
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
