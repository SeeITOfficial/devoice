"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewGalleryCategoryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/gallery/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to create category."
        );
      }

      window.location.href = "/admin/gallery";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create category."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-2xl">
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
          New Category
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-12 rounded-[2rem] bg-white/50 p-7 sm:p-10"
        >
          <label
            htmlFor="name"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
          >
            Category name
          </label>

          <input
            id="name"
            name="name"
            required
            placeholder="Performances"
            className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
          />

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>
    </main>
  );
}