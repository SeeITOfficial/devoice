"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewEventPage() {
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
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          date: formData.get("date"),
          description: formData.get("description"),
          posterUrl: formData.get("posterUrl"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to create event."
        );
      }

      window.location.href = "/admin/events";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create event."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/events"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]"
        >
          ← Back to Events
        </Link>

        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
          Event Management
        </p>

        <h1 className="mt-4 font-serif text-6xl leading-none">
          New Event
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
              Event title
            </label>

            <input
              id="title"
              name="title"
              required
              placeholder="Gabriel Ba Collections"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Date
            </label>

            <input
              id="date"
              name="date"
              type="datetime-local"
              required
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          <div>
            <label
              htmlFor="posterUrl"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Poster URL
            </label>

            <input
              id="posterUrl"
              name="posterUrl"
              placeholder="/events/event-poster.jpg"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={6}
              placeholder="Tell visitors about this event..."
              className="mt-3 w-full resize-none rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
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
            className="w-full rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Event..." : "Create Event"}
          </button>
        </form>
      </div>
    </main>
  );
}