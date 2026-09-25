"use client";

import { useId, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";

export const MAX_IMAGES = 6;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

let nextKey = 0;

/*
  Turns picked/dropped files into { key, file, url } items, skipping
  anything that isn't an image or is over 5 MB. Returns the items to
  add and a readable note about what was skipped.
*/
export function prepareImages(files, existingCount) {
  const accepted = [];
  const skipped = { type: 0, size: 0, limit: 0 };

  for (const file of files) {
    if (!file.type.startsWith("image/")) skipped.type++;
    else if (file.size > MAX_IMAGE_BYTES) skipped.size++;
    else if (existingCount + accepted.length >= MAX_IMAGES) skipped.limit++;
    else accepted.push({ key: ++nextKey, file, url: URL.createObjectURL(file) });
  }

  const notes = [];
  if (skipped.type) notes.push(`${skipped.type} ${skipped.type === 1 ? "file isn't" : "files aren't"} an image`);
  if (skipped.size) notes.push(`${skipped.size} ${skipped.size === 1 ? "is" : "are"} over 5 MB`);
  if (skipped.limit) notes.push(`${skipped.limit} over the ${MAX_IMAGES}-image limit`);

  return { accepted, note: notes.length ? `Skipped: ${notes.join(", ")}.` : null };
}

// Preview URLs of new files are only freed when removed; the rest go with the page
export const releaseImage = (item) => item.file && URL.revokeObjectURL(item.url);

// Images already saved on a product: { key, url } with no file
export const existingImages = (urls = []) => urls.map((url) => ({ key: ++nextKey, url }));

/*
  Product image picker: drop zone + ordered previews. The first image
  is the cover used on product cards; arrows move images in the order.
  items: [{ key, url, file? }] (file only on new uploads)   onChange(nextItems)
*/
export default function ImageUploader({ items, onChange, error, uploading = false, describedBy, markNew = false }) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [note, setNote] = useState(null);

  const add = (fileList) => {
    const { accepted, note } = prepareImages(Array.from(fileList || []), items.length);
    setNote(note);
    if (accepted.length) onChange([...items, ...accepted]);
  };

  const remove = (index) => {
    releaseImage(items[index]);
    onChange(items.filter((_, i) => i !== index));
    setNote(null);
  };

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const full = items.length >= MAX_IMAGES;

  return (
    <div>
      {!full && (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!uploading) add(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
            error
              ? "border-danger bg-danger-tint/40"
              : dragging
                ? "border-ink bg-ink/3"
                : "border-ink/20 bg-paper hover:border-ink/40"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <ImagePlus className="h-5 w-5 text-muted" aria-hidden="true" />
          <span className="mt-2 text-sm font-medium text-ink">
            {dragging ? "Drop to add" : "Drag images here or click to browse"}
          </span>
          <span className="mt-1 text-xs text-muted">
            JPG, PNG or WebP, up to 5 MB each · {MAX_IMAGES - items.length} of {MAX_IMAGES} remaining
          </span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            onChange={(e) => {
              add(e.target.files);
              e.target.value = ""; // allow picking the same file again
            }}
            className="sr-only"
          />
        </label>
      )}

      {note && (
        <p className="mt-2 text-[13px] text-warning" role="status">
          {note}
        </p>
      )}

      {items.length > 0 && (
        <ol className="mt-4 grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-4 xl:grid-cols-6" aria-label="Selected images, in display order">
          {items.map((item, index) => (
            <li key={item.key} className="min-w-0">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-line bg-paper">
                {/* Local object URL preview; next/image can't optimise blob: URLs */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.file ? `Image ${index + 1}: ${item.file.name}` : `Image ${index + 1}`} className="h-full w-full object-cover" />

                <span className="absolute top-1.5 left-1.5 rounded bg-white/95 px-1.5 py-0.5 text-[11px] font-medium text-ink shadow-sm">
                  {index === 0 ? "Cover" : index + 1}
                </span>

                {/* Editing: flag images that will be uploaded on save */}
                {markNew && item.file && (
                  <span className="absolute top-1.5 right-1.5 rounded bg-ink px-1.5 py-0.5 text-[11px] font-medium text-white">
                    New
                  </span>
                )}

                {uploading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                    <Loader2 className="h-5 w-5 animate-spin text-ink" aria-hidden="true" />
                  </span>
                )}
              </div>

              {/* Controls sit under the image so they're always visible and tappable */}
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || uploading}
                    className="flex h-8 w-8 items-center justify-center rounded text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label={index === 1 ? `Make image ${index + 1} the cover` : `Move image ${index + 1} earlier`}
                    title="Move earlier"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1 || uploading}
                    className="flex h-8 w-8 items-center justify-center rounded text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label={`Move image ${index + 1} later`}
                    title="Move later"
                  >
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={uploading}
                  className="flex h-8 items-center gap-1 rounded px-1.5 text-xs text-muted transition-colors hover:bg-danger-tint hover:text-danger disabled:opacity-30"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
