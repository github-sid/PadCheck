"use client";

import { useState } from "react";

function RatingPicker({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{label}</label>
        <span className="text-xs text-neutral-500">{value || "—"}/5</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`size-10 rounded-lg ring-1 grid place-items-center text-sm transition-colors ${
              n <= value ? "bg-[#2d332d] text-white ring-[#2d332d]" : "ring-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [r1, setR1] = useState(0);
  const [r2, setR2] = useState(0);
  const [r3, setR3] = useState(0);
  const [r4, setR4] = useState(0);

  return (
    <div className="p-8">
      <h3 className="text-xl font-serif font-medium text-neutral-900 mb-2">Have you lived here?</h3>
      <p className="text-sm text-neutral-500 mb-8">Your honest feedback helps the next renter make a better decision.</p>

      <form className="space-y-6">
        <RatingPicker label="Landlord" value={r1} onChange={setR1} />
        <RatingPicker label="Value" value={r2} onChange={setR2} />
        <RatingPicker label="Neighborhood" value={r3} onChange={setR3} />
        <RatingPicker label="Maintenance" value={r4} onChange={setR4} />

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Headline</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            className="w-full p-3 text-sm bg-neutral-50 ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300 placeholder-neutral-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Your experience</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="What should a future tenant know?"
            className="w-full p-4 text-sm bg-neutral-50 ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300 placeholder-neutral-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-[#2d332d] text-white font-medium text-sm transition-opacity hover:opacity-90"
        >
          Post review
        </button>
      </form>
    </div>
  );
}
