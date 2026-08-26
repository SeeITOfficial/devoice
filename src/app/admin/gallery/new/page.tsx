"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
};

export default function NewGalleryItemPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: formData.get("type"),
          url: formData.get("url"),
          thumbnailUrl: formData.get("thumbnailUrl"),
          title: formData.get("title"),
          categoryId: formData.get("categoryId"),
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

        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
          Gallery Management
        </p>

        <h1 className="mt-4 font-serif text-6xl leading-none">
          Add Media
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-6 rounded-[2rem] bg-white/50 p-7 sm:p-10"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
              Media type
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="IMAGE"
                  defaultChecked
                  className="peer sr-only"
                />

                <span className="block rounded-xl border border-[#0d1a17]/10 px-5 py-4 text-center text-sm peer-checked:border-[#c9a24b] peer-checked:bg-[#c9a24b]/10">
                  Image
                </span>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="VIDEO"
                  className="peer sr-only"
                />

                <span className="block rounded-xl border border-[#0d1a17]/10 px-5 py-4 text-center text-sm peer-checked:border-[#c9a24b] peer-checked:bg-[#c9a24b]/10">
                  Video
                </span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Category
            </label>

            <select
              id="categoryId"
              name="categoryId"
              required
              disabled={loadingCategories || categories.length === 0}
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : categories.length === 0
                    ? "Create a category first"
                    : "Select category"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="title"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Title
            </label>

            <input
              id="title"
              name="title"
              placeholder="Live at Gabriel Ba Collections"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          <div>
            <label
              htmlFor="url"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Media URL
            </label>

            <input
              id="url"
              name="url"
              required
              placeholder="/gallery/performance-01.jpg"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          <div>
            <label
              htmlFor="thumbnailUrl"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Thumbnail URL
            </label>

            <input
              id="thumbnailUrl"
              name="thumbnailUrl"
              placeholder="Optional"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || categories.length === 0}
            className="w-full rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Adding Media..." : "Add Media"}
          </button>
        </form>
      </div>
    </main>
  );
}