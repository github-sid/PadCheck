"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Search } from "lucide-react";

setOptions({
  key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  v: "weekly",
});

const MIN_CHARS = 3;
const DEBOUNCE_MS = 300;

type Suggestion = {
  place_id: string;
  formatted: string;
  address_line1: string;
  address_line2: string;
};

type Props = {
  onSelect?: (suggestion: Suggestion) => void;
  onSearch?: (query: string) => void;
  onQueryChange?: (query: string) => void;
};

async function getPlacesLib(): Promise<google.maps.PlacesLibrary> {
  return importLibrary("places");
}

export function SearchBox({ onSelect, onSearch, onQueryChange }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const justSelectedRef = useRef(false);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onQueryChange?.(val);
    if (val.length < MIN_CHARS) {
      setSuggestions([]);
      setOpen(false);
    }
  }

  useEffect(() => {
    if (query.length < MIN_CHARS) return;
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { AutocompleteService, AutocompleteSessionToken } = await getPlacesLib();

        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }

        const service = new AutocompleteService();
        const { predictions } = await service.getPlacePredictions({
          input: query,
          sessionToken: sessionTokenRef.current,
          componentRestrictions: { country: "ca" },
          types: ["address"],
        });

        const results: Suggestion[] = (predictions ?? []).map((p) => ({
          place_id: p.place_id,
          formatted: p.description,
          address_line1: p.structured_formatting.main_text,
          address_line2: p.structured_formatting.secondary_text ?? "",
        }));

        setSuggestions(results);
        setOpen(results.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectSuggestion(s: Suggestion) {
    justSelectedRef.current = true;
    setQuery(s.address_line1);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    sessionTokenRef.current = null;
    onSelect?.(s);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
      } else {
        setOpen(false);
        onSearch?.(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div
      ref={containerRef}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls="searchbox-listbox"
      className="relative flex-1 px-4 flex items-center gap-3"
    >
      <Search className="size-4 text-neutral-400 shrink-0" />
      <input
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        type="text"
        autoComplete="off"
        placeholder="Enter an address"
        aria-autocomplete="list"
        className="w-full bg-transparent border-none text-neutral-900 placeholder-neutral-400 focus:outline-none text-sm h-10"
      />

      {open && (
        <ul
          id="searchbox-listbox"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white ring-1 ring-black/5 rounded-xl shadow-lg overflow-hidden z-50"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.place_id}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => selectSuggestion(s)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex flex-col px-4 py-3 cursor-pointer transition-colors ${
                i === activeIndex ? "bg-neutral-100" : "hover:bg-neutral-50"
              }`}
            >
              <span className="text-sm font-medium text-neutral-900 truncate">{s.address_line1}</span>
              {s.address_line2 && (
                <span className="text-xs text-neutral-400 truncate mt-0.5">{s.address_line2}</span>
              )}
            </li>
          ))}
          {loading && (
            <li className="px-4 py-3 text-xs text-neutral-400">Searching…</li>
          )}
        </ul>
      )}
    </div>
  );
}
