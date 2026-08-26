"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type EventData = {
  id: string;
  title: string;
  date: string;
  description: string | null;
  posterUrl: string | null;
  cancelled: boolean;
};

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/admin/events/${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load event."
          );
        }

        setEvent(result.event);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load event."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  async function handleSubmit(
    submitEvent: React.FormEvent<HTMLFormElement>
  ) {
    submitEvent.preventDefault();

    if (!event) return;

    setSaving(true);
    setError("");

    const form = submitEvent.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
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
          result.message || "Unable to update event."
        );
      }

      setEvent(result.event);
      alert("Event updated.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update event."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCancelled() {
    if (!event) return;

    const nextCancelled = !event.cancelled;

    setCancelling(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancelled: nextCancelled,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update event."
        );
      }

      setEvent(result.event);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update event."
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f2e9d8] px-6 py-20 text-[#0d1a17]">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#b18a3b]">
            Loading event...
          </p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[#f2e9d8] px-6 py-20 text-[#0d1a17]">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-red-700">
            Event not found
          </p>

          <Link
            href="/admin/events"
            className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.2em]"
          >
            ← Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const localDate = new Date(event.date);

  const dateValue = new Date(
    localDate.getTime() - localDate.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/events"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]"
        >
          ← Back to Events
        </Link>

        <div className="mt-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
              Event Management
            </p>

            <h1 className="mt-4 font-serif text-6xl leading-none">
              Edit Event
            </h1>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] ${
              event.cancelled
                ? "bg-red-500/10 text-red-700"
                : "bg-[#0d1a17] text-[#f2e9d8]"
            }`}
          >
            {event.cancelled ? "Cancelled" : "Active"}
          </span>
        </div>

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
              defaultValue={event.title}
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
              defaultValue={dateValue}
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
              defaultValue={event.posterUrl ?? ""}
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
              defaultValue={event.description ?? ""}
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
            disabled={saving}
            className="w-full rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="mt-6 rounded-[2rem] border border-[#0d1a17]/10 bg-white/30 p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
            Event status
          </p>

          <p className="mt-3 text-sm leading-6 text-[#0d1a17]/55">
            Cancelling an event keeps the event in the database but marks it
            as cancelled instead of deleting its history.
          </p>

          <button
            type="button"
            disabled={cancelling}
            onClick={toggleCancelled}
            className={`mt-5 rounded-full border px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors disabled:opacity-50 ${
              event.cancelled
                ? "border-[#0d1a17]/20 hover:border-[#c9a24b]"
                : "border-red-500/30 text-red-700 hover:bg-red-500/5"
            }`}
          >
            {cancelling
              ? "Updating..."
              : event.cancelled
                ? "Restore Event"
                : "Cancel Event"}
          </button>
        </div>
      </div>
    </main>
  );
}