"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MultipleMediaUploader from "@/components/admin/MultipleMediaUploader";

type Category = {
  id: string;
  name: string;
};

type MediaMode = "UPLOAD" | "EXTERNAL";

export default function NewGalleryItemPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [mediaMode, setMediaMode] = useState<MediaMode>("UPLOAD");

  const [urls, setUrls] = useState<string[]>([]);
  const [externalUrl, setExternalUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/admin/gallery/categories");
        const result = await response.json();
        if (response.ok) {
          setCategories(result.categories ?? []);
        }
      } catch {
        // Non-fatal; category is optional
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  function handleTypeChange(nextType: "IMAGE" | "VIDEO") {
    setType(nextType);
    setUrls([]);
    setExternalUrl("");
    setThumbnailUrl("");
    setMediaMode("UPLOAD");
  }

  const effectiveUrls =
    mediaMode === "EXTERNAL"
      ? externalUrl.trim()
        ? [externalUrl.trim()]
        : []
      : urls;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (effectiveUrls.length === 0) {
      setError("Please upload or provide at least one media URL.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          urls: effectiveUrls,
          thumbnailUrl: thumbnailUrl.trim() || null,
          title: title.trim() || null,
          categoryId: categoryId || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to add media.");
      }

      const count = result.items?.length ?? 1;
      setSuccess(
        `${count} item${count > 1 ? "s" : ""} added successfully!`
      );

      setUrls([]);
      setExternalUrl("");
      setTitle("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add media."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/gallery"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]"
        >
          ← Back to Gallery
        </Link>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Management
          </p>

          <h1 className="mt-4 font-serif text-6xl leading-none">Add Media</h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
            Add photographs or video to the public gallery. You can upload
            multiple files at once. Category is optional.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 space-y-8">
          {/* Media type */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Media Type
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange("IMAGE")}
                className={`rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                  type === "IMAGE"
                    ? "bg-[#0d1a17] text-[#f2e9d8]"
                    : "border border-[#0d1a17]/15 bg-white/40"
                }`}
              >
                Image
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("VIDEO")}
                className={`rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                  type === "VIDEO"
                    ? "bg-[#0d1a17] text-[#f2e9d8]"
                    : "border border-[#0d1a17]/15 bg-white/40"
                }`}
              >
                Video
              </button>
            </div>
          </div>

          {/* Upload / external */}
          <div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setMediaMode("UPLOAD");
                  setExternalUrl("");
                }}
                className={`rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  mediaMode === "UPLOAD"
                    ? "bg-[#0d1a17] text-[#f2e9d8]"
                    : "border border-[#0d1a17]/15"
                }`}
              >
                Upload from Device
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaMode("EXTERNAL");
                  setUrls([]);
                }}
                className={`rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  mediaMode === "EXTERNAL"
                    ? "bg-[#0d1a17] text-[#f2e9d8]"
                    : "border border-[#0d1a17]/15"
                }`}
              >
                External URL
              </button>
            </div>

            <div className="mt-5">
              {mediaMode === "UPLOAD" ? (
                <MultipleMediaUploader
                  mediaType={type === "IMAGE" ? "image" : "video"}
                  onUploadComplete={(uploadedUrls) => {
                    setUrls(uploadedUrls);
                  }}
                  label={
                    type === "IMAGE"
                      ? "Choose images from device (select multiple)"
                      : "Choose videos from device (select multiple)"
                  }
                />
              ) : (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    {type === "VIDEO"
                      ? "YouTube / Vimeo / Video URL"
                      : "Image URL"}
                  </label>

                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder={
                      type === "VIDEO"
                        ? "https://youtube.com/..."
                        : "https://..."
                    }
                    className="mt-3 w-full rounded-2xl border border-[#0d1a17]/15 bg-white/50 px-5 py-4 text-sm outline-none transition-colors focus:border-[#c9a24b]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail (video only, optional) */}
          {type === "VIDEO" && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Thumbnail (Optional)
              </label>

              <div className="mt-4">
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://... (leave blank to use video's own thumbnail)"
                  className="w-full rounded-2xl border border-[#0d1a17]/15 bg-white/50 px-5 py-4 text-sm outline-none transition-colors focus:border-[#c9a24b]"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              Title (Optional)
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Behind the Music"
              className="mt-3 w-full rounded-2xl border border-[#0d1a17]/15 bg-white/50 px-5 py-4 text-sm outline-none transition-colors focus:border-[#c9a24b]"
            />
          </div>

          {/* Category (optional) */}
          <div>
            <label
              htmlFor="categoryId"
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              Category (Optional)
            </label>

            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loadingCategories}
              className="mt-3 w-full rounded-2xl border border-[#0d1a17]/15 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            >
              <option value="">
                {loadingCategories ? "Loading..." : "No category"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ready indicator */}
          {effectiveUrls.length > 0 && (
            <div className="rounded-2xl bg-[#0d1a17] p-5 text-[#f2e9d8]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a24b]">
                {effectiveUrls.length}{" "}
                {effectiveUrls.length === 1 ? "file" : "files"} ready
              </p>
              <div className="mt-2 space-y-1">
                {effectiveUrls.slice(0, 5).map((u, i) => (
                  <p key={i} className="break-all text-xs text-[#f2e9d8]/60">
                    {u}
                  </p>
                ))}
                {effectiveUrls.length > 5 && (
                  <p className="text-xs text-[#f2e9d8]/40">
                    +{effectiveUrls.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-2xl border border-green-700/20 bg-green-50 px-5 py-4 text-sm text-green-800">
              {success}{" "}
              <Link href="/admin/gallery" className="underline">
                View gallery
              </Link>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-900/20 bg-red-50 px-5 py-4 text-sm text-red-900">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/admin/gallery"
              className="rounded-full border border-[#0d1a17]/15 px-7 py-4 text-xs font-bold uppercase tracking-[0.12em]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || effectiveUrls.length === 0}
              className="rounded-full bg-[#0d1a17] px-7 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Saving..."
                : effectiveUrls.length > 1
                  ? `Add ${effectiveUrls.length} Items`
                  : "Add Media"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}