import { useState } from "react";
import { Star } from "lucide-react";

export function RatingPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        <span className="text-xs text-neutral-400 tabular-nums w-6 text-right">
          {value ? `${value}/5` : ""}
        </span>
      </div>
      <div
        className="flex gap-0.5"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            className="p-0.5 focus:outline-none"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`size-6 transition-colors duration-75 ${
                n <= active
                  ? n <= value
                    ? "fill-amber-400 text-amber-400"
                    : "fill-amber-300 text-amber-300"
                  : "text-neutral-200 hover:text-amber-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
