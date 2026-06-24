"use client";

import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { FormField } from "./form-field";
import { RatingGrid } from "./rating-grid";
import { RatingPicker } from "./rating-picker";
import { PhotoUploader, type PhotoEntry } from "./photo-uploader";
import { SignInBanner } from "./sign-in-banner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const RED_FLAG_OPTIONS = [
  "Mould / mildew",
  "Pest infestation",
  "Unresponsive landlord",
  "Hidden fees",
  "Unsafe conditions",
  "Noise disturbances",
  "Poor maintenance",
  "Illegal landlord entry",
];

export function ReviewForm({
  propertyId,
  disabled = false,
  onPosted,
}: {
  propertyId?: string;
  disabled?: boolean;
  onPosted?: () => void;
}) {
  // Core ratings (required)
  const [landlord, setLandlord] = useState(0);
  const [noise, setNoise] = useState(0);
  const [safety, setSafety] = useState(0);
  const [transit, setTransit] = useState(0);
  const [amenities, setAmenities] = useState(0);

  // Environmental details (optional)
  const [noiseLevelDay, setNoiseLevelDay] = useState(0);
  const [noiseLevelNight, setNoiseLevelNight] = useState(0);
  const [streetLighting, setStreetLighting] = useState(0);
  const [parkingEase, setParkingEase] = useState(0);
  const [cellSignal, setCellSignal] = useState(0);
  const [constructionPresent, setConstructionPresent] = useState<boolean | null>(null);

  // Red flags (optional multi-select)
  const [redFlags, setRedFlags] = useState<string[]>([]);

  // Tenancy window (optional)
  const [tenancyStart, setTenancyStart] = useState("");
  const [tenancyEnd, setTenancyEnd] = useState("");
  const [currentTenant, setCurrentTenant] = useState(false);

  // Written review
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function toggleRedFlag(flag: string) {
    setRedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  }

  function handleAddPhotos(entries: PhotoEntry[]) {
    setPhotos((prev) => [...prev, ...entries]);
  }

  function handleRemovePhoto(idx: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!landlord || !noise || !safety || !transit || !amenities) {
      setErrorMsg("Please rate all five categories");
      return;
    }
    if (!body.trim()) {
      setErrorMsg("Add a review");
      return;
    }

    const overall = Math.round((landlord + noise + safety + transit + amenities) / 5);
    const reviewText = title.trim()
      ? `${title.trim()}\n\n${body.trim()}`
      : body.trim();

    setSubmitting(true);
    try {
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        const form = new FormData();
        for (const p of photos) form.append("files", p.file);
        const uploadRes = await fetch(`${API_BASE}/reviews/photos`, {
          method: "POST",
          credentials: "include",
          body: form,
        });
        if (!uploadRes.ok) throw new Error("Photo upload failed");
        const uploadData = await uploadRes.json();
        photoUrls = uploadData.urls ?? [];
      }

      const res = await fetch(`${API_BASE}/reviews/write/${propertyId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address_id: propertyId,
          rating_overall: overall,
          rating_landlord: landlord,
          rating_noise: noise,
          rating_safety: safety,
          rating_transit: transit,
          rating_amenities: amenities,
          noise_level_day: noiseLevelDay || null,
          noise_level_night: noiseLevelNight || null,
          street_lighting: streetLighting || null,
          parking_ease: parkingEase || null,
          cell_signal: cellSignal || null,
          construction_present: constructionPresent,
          red_flags: redFlags.length > 0 ? redFlags : null,
          tenancy_start: tenancyStart ? `${tenancyStart}-01` : null,
          tenancy_end: !currentTenant && tenancyEnd ? `${tenancyEnd}-01` : null,
          review_text: reviewText,
          photo_urls: photoUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail ?? "Failed to post review");
      }

      for (const p of photos) URL.revokeObjectURL(p.preview);
      setTitle(""); setBody("");
      setLandlord(0); setNoise(0); setSafety(0); setTransit(0); setAmenities(0);
      setNoiseLevelDay(0); setNoiseLevelNight(0); setStreetLighting(0);
      setParkingEase(0); setCellSignal(0); setConstructionPresent(null);
      setRedFlags([]); setTenancyStart(""); setTenancyEnd(""); setCurrentTenant(false);
      setPhotos([]);
      setSuccessMsg("Review posted!");
      onPosted?.();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-neutral-100">
        <h2 className="text-base font-semibold text-neutral-900">Write a review</h2>
        <p className="text-sm text-neutral-500 mt-0.5">Help future renters make better decisions</p>
      </div>

      <form onSubmit={submit} className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
        {disabled && <SignInBanner />}

        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 ring-1 ring-green-200 text-sm text-green-800">
            <span className="size-2 rounded-full bg-green-500 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 ring-1 ring-red-200 text-sm text-red-700">
            <span className="size-2 rounded-full bg-red-500 shrink-0" />
            {errorMsg}
          </div>
        )}

        <fieldset disabled={disabled} className="space-y-6 disabled:opacity-50">

          {/* ── Core ratings ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Ratings</p>
            <RatingGrid
              ratings={{ landlord, noise, safety, transit, amenities }}
              setters={{ setLandlord, setNoise, setSafety, setTransit, setAmenities }}
            />
          </div>

          <div className="h-px bg-neutral-100" />

          {/* ── Environmental details ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Environmental details
            </p>
            <p className="text-xs text-neutral-400 mb-4">Optional — helps build neighbourhood averages</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <RatingPicker label="Daytime noise" value={noiseLevelDay} onChange={setNoiseLevelDay} />
              <RatingPicker label="Night-time noise" value={noiseLevelNight} onChange={setNoiseLevelNight} />
              <RatingPicker label="Street lighting" value={streetLighting} onChange={setStreetLighting} />
              <RatingPicker label="Parking ease" value={parkingEase} onChange={setParkingEase} />
              <RatingPicker label="Cell signal" value={cellSignal} onChange={setCellSignal} />
            </div>

            {/* Construction present */}
            <div className="mt-4">
              <p className="text-sm font-medium text-neutral-700 mb-2">Active construction nearby?</p>
              <div className="flex gap-2">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() =>
                      setConstructionPresent((prev) => (prev === val ? null : val))
                    }
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ring-1 transition-colors ${
                      constructionPresent === val
                        ? "bg-neutral-800 text-white ring-neutral-800"
                        : "bg-white text-neutral-600 ring-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {val ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* ── Red flags ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Red flags</p>
            <p className="text-xs text-neutral-400 mb-3">Select any that apply</p>
            <div className="flex flex-wrap gap-2">
              {RED_FLAG_OPTIONS.map((flag) => (
                <button
                  key={flag}
                  type="button"
                  onClick={() => toggleRedFlag(flag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ring-1 transition-colors ${
                    redFlags.includes(flag)
                      ? "bg-red-600 text-white ring-red-600"
                      : "bg-white text-neutral-600 ring-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* ── Tenancy window ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              When did you live here?
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Move-in date">
                <input
                  type="month"
                  value={tenancyStart}
                  onChange={(e) => setTenancyStart(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-white ring-1 ring-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-shadow"
                />
              </FormField>
              <FormField label="Move-out date">
                <input
                  type="month"
                  value={tenancyEnd}
                  onChange={(e) => setTenancyEnd(e.target.value)}
                  disabled={currentTenant}
                  className="w-full px-4 py-3 text-sm bg-white ring-1 ring-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-300 disabled:opacity-40 transition-shadow"
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={currentTenant}
                    onChange={(e) => {
                      setCurrentTenant(e.target.checked);
                      if (e.target.checked) setTenancyEnd("");
                    }}
                    className="rounded"
                  />
                  <span className="text-xs text-neutral-500">I currently live here</span>
                </label>
              </FormField>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* ── Written review ── */}
          <FormField label="Headline">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Sum up your experience in one line"
              className="w-full px-4 py-3 text-sm bg-white ring-1 ring-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-300 placeholder-neutral-400 transition-shadow"
            />
          </FormField>

          <FormField label="Your experience">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="What should a future tenant know? Describe the landlord, building condition, neighbourhood…"
              className="w-full px-4 py-3 text-sm bg-white ring-1 ring-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-300 placeholder-neutral-400 resize-y transition-shadow"
            />
          </FormField>

          <PhotoUploader
            photos={photos}
            onAdd={handleAddPhotos}
            onRemove={handleRemovePhoto}
          />
        </fieldset>

        <button
          type="submit"
          disabled={submitting || disabled}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-primary text-white font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? (
            "Posting…"
          ) : disabled ? (
            "Sign in to review"
          ) : (
            <>
              Post review
              <SendHorizonal className="size-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
