import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

const MAX_PHOTOS = 6;
const MAX_BYTES = 5 * 1024 * 1024;

export type PhotoEntry = { file: File; preview: string };

export function PhotoUploader({
  photos,
  onAdd,
  onRemove,
}: {
  photos: PhotoEntry[];
  onAdd: (entries: PhotoEntry[]) => void;
  onRemove: (idx: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) return;
    const valid: PhotoEntry[] = [];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > MAX_BYTES) continue;
      valid.push({ file: f, preview: URL.createObjectURL(f) });
      if (valid.length >= room) break;
    }
    if (valid.length) onAdd(valid);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Photos (optional)
        </label>
        <span className="text-xs text-neutral-500">
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          if (fileRef.current) fileRef.current.value = "";
        }}
      />

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {photos.map((p, idx) => (
          <div
            key={idx}
            className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-black/5 bg-neutral-100 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute top-1 right-1 size-6 grid place-items-center rounded-full bg-neutral-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove photo"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-lg ring-1 ring-dashed ring-neutral-300 hover:ring-neutral-500 bg-neutral-50 hover:bg-neutral-100 transition-colors grid place-items-center text-neutral-500"
          >
            <ImagePlus className="size-5" />
          </button>
        )}
      </div>

      <p className="text-xs text-neutral-400">JPG or PNG, up to 5 MB each.</p>
    </div>
  );
}
