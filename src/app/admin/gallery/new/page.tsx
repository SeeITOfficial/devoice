"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MediaUploader from "@/components/admin/MediaUploader";

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

  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [mediaMode, setMediaMode] =
    useState<MediaMode>("UPLOAD");

  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(
          "/api/admin/gallery/categories"
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load categories."
          );
        }

        setCategories(result.categories);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  function handleTypeChange(
    nextType: "IMAGE" | "VIDEO"
  ) {
    setType(nextType);
    setUrl("");
    setThumbnailUrl("");
    setMediaMode("UPLOAD");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    if (!categoryId) {
      setError("Please select a gallery category.");
      setLoading(false);
      return;
    }

    if (!url.trim()) {
      setError("Please upload or provide a media URL.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          url: url.trim(),
          thumbnailUrl:
            thumbnailUrl.trim() || null,
          title: title.trim() || null,
          categoryId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to add media."
        );
      }

      window.location.href = "/admin/gallery";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to add media."
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

          <h1 className="mt-4 font-serif text-6xl leading-none">
            Add Media
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
            Add photographs or video to the public gallery.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-8"
        >
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
                  setUrl("");
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
                  setUrl("");
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
                <MediaUploader
                  mediaType={
                    type === "IMAGE"
                      ? "image"
                      : "video"
                  }
                  onUploadComplete={(uploadedUrl) => {
                    setUrl(uploadedUrl);
                  }}
                  label={
                    type === "IMAGE"
                      ? "Choose image from device"
                      : "Choose video from device"
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
                    value={url}
                    onChange={(event) =>
                      setUrl(event.target.value)
                    }
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

          {/* Thumbnail */}
          {type === "VIDEO" && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Thumbnail
              </label>

              <div className="mt-4">
                <MediaUploader
                  mediaType="image"
                  onUploadComplete={(uploadedUrl) => {
                    setThumbnailUrl(uploadedUrl);
                  }}
                  label="Choose thumbnail"
                />
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[#0d1a17]/35">
                  Or use a thumbnail URL
                </p>

                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(event) =>
                    setThumbnailUrl(event.target.value)
                  }
                  placeholder="https://..."
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
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Behind the Music"
              className="mt-3 w-full rounded-2xl border border-[#0d1a17]/15 bg-white/50 px-5 py-4 text-sm outline-none transition-colors focus:border-[#c9a24b]"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="categoryId"
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              Category
            </label>

            <select
              id="categoryId"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              disabled={loadingCategories}
              className="mt-3 w-full rounded-2xl border border-[#0d1a17]/15 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select a category"}
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Uploaded URL indicator */}
          {url && (
            <div className="rounded-2xl bg-[#0d1a17] p-5 text-[#f2e9d8]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a24b]">
                Media ready
              </p>

              <p className="mt-2 break-all text-xs text-[#f2e9d8]/60">
                {url}
              </p>
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
              disabled={
                loading ||
                loadingCategories ||
                !url ||
                !categoryId
              }
              className="rounded-full bg-[#0d1a17] px-7 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Saving..." : "Add Media"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}