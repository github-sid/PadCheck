"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
const AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";
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

export function SearchBox({ onSelect, onSearch, onQueryChange }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clearing happens in onChange — not inside an effect — to avoid cascading renders
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

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          text: query,
          apiKey: GEOAPIFY_KEY ?? "",
          limit: "6",
          format: "json",
        });
        const res = await fetch(`${AUTOCOMPLETE_URL}?${params}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error("autocomplete failed");
        const data = await res.json();
        const results: Suggestion[] = (data.results ?? []).map((r: Record<string, string>) => ({
          place_id: r.place_id ?? r.formatted,
          formatted: r.formatted ?? "",
          address_line1: r.address_line1 ?? r.formatted ?? "",
          address_line2: r.address_line2 ?? "",
        }));
        setSuggestions(results);
        setOpen(results.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, [query]);

  // Close dropdown when clicking outside
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
    setQuery(s.address_line1);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
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
    // role="combobox" owns the aria-expanded state; input stays as role="textbox"
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
        placeholder="Enter an address, zip, or city..."
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
