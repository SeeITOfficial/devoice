"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NewSongPage() {
  const params = useParams();
  const albumId = params.albumId as string;

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
      const response = await fetch("/api/admin/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          audioUrl: formData.get("audioUrl"),
          artworkUrl: formData.get("artworkUrl"),
          releaseDate: formData.get("releaseDate"),
          published: formData.get("published") === "on",
          albumId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to create song."
        );
      }

      window.location.href = "/admin/music";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create song."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/music"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]"
        >
          ← Back to Music
        </Link>

        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
          Music Management
        </p>

        <h1 className="mt-4 font-serif text-6xl leading-none">
          New Song
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-6 rounded-[2rem] bg-white/50 p-7 sm:p-10"
        >
          <div>
            <label
              htmlFor="title"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Song title
            </label>

            <input
              id="title"
              name="title"
              required
              placeholder="Nakinga"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          <div>
            <label
              htmlFor="audioUrl"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Audio URL
            </label>

            <input
              id="audioUrl"
              name="audioUrl"
              required
              placeholder="/music/nakinga.mp3"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          <div>
            <label
              htmlFor="artworkUrl"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Artwork URL
            </label>

            <input
              id="artworkUrl"
              name="artworkUrl"
              placeholder="/music/nakinga.jpg"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          <div>
            <label
              htmlFor="releaseDate"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Release date
            </label>

            <input
              id="releaseDate"
              name="releaseDate"
              type="date"
              required
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="published"
              className="h-4 w-4 accent-[#c9a24b]"
            />

            <span className="text-sm">
              Publish song immediately
            </span>
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Song..." : "Create Song"}
          </button>
        </form>
      </div>
    </main>
  );
}