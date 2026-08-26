"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewVideoPage() {
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
      const response = await fetch("/api/admin/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          thumbnailUrl: formData.get("thumbnailUrl"),
          source: formData.get("source"),
          videoUrl: formData.get("videoUrl"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to create video."
        );
      }

      window.location.href = "/admin/videos";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create video."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/videos"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]"
        >
          ← Back to Videos
        </Link>

        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
          Video Management
        </p>

        <h1 className="mt-4 font-serif text-6xl leading-none">
          New Video
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-6 rounded-[2rem] bg-white/50 p-7 sm:p-10"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Video title
            </label>

            <input
              id="title"
              name="title"
              required
              placeholder="De Voice — Live Performance"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          {/* Source */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
              Video source
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  value="EXTERNAL"
                  defaultChecked
                  className="peer sr-only"
                />

                <span className="block rounded-xl border border-[#0d1a17]/10 px-5 py-4 text-center text-sm peer-checked:border-[#c9a24b] peer-checked:bg-[#c9a24b]/10">
                  External
                </span>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  value="UPLOAD"
                  className="peer sr-only"
                />

                <span className="block rounded-xl border border-[#0d1a17]/10 px-5 py-4 text-center text-sm peer-checked:border-[#c9a24b] peer-checked:bg-[#c9a24b]/10">
                  Upload
                </span>
              </label>
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label
              htmlFor="videoUrl"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Video URL
            </label>

            <input
              id="videoUrl"
              name="videoUrl"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />

            <p className="mt-2 text-[10px] text-[#0d1a17]/35">
              For external videos, paste the YouTube, Vimeo or other video
              URL.
            </p>
          </div>

          {/* Thumbnail */}
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
              required
              placeholder="/videos/live-performance.jpg"
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
            disabled={loading}
            className="w-full rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Video..." : "Create Video"}
          </button>
        </form>
      </div>
    </main>
  );
}