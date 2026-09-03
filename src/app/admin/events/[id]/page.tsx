"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type TicketTypeForm = {
  id?: string;
  name: string;
  price: string | number;
  quantity: string | number;
  unlimited: boolean;
};

type EventData = {
  id: string;
  title: string;
  date: string;
  description: string | null;
  posterUrl: string | null;
  cancelled: boolean;
  ticketTypes: {
    id: string;
    name: string;
    price: number;
    quantity: number | null;
    unlimited: boolean;
  }[];
};

type EventStats = {
  totalEntered: number;
  totalRevenue: number;
  byTicketType: Record<string, { entered: number; revenue: number }>;
  byPaymentMethod: {
    ONLINE: { entered: number; revenue: number };
    WALK_IN: { entered: number; revenue: number };
  };
};

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([]);

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
        setStats(result.stats || null);
        setTicketTypes(
          result.event.ticketTypes.map((t: any) => ({
            id: t.id,
            name: t.name,
            price: t.price.toString(),
            quantity: t.quantity !== null ? t.quantity.toString() : "",
            unlimited: t.unlimited,
          }))
        );
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

  function addTicketType() {
    setTicketTypes((current) => [
      ...current,
      {
        name: "",
        price: "",
        quantity: "",
        unlimited: false,
      },
    ]);
  }

  function updateTicketType(
    index: number,
    field: keyof TicketTypeForm,
    value: string | boolean
  ) {
    setTicketTypes((current) =>
      current.map((ticket, i) =>
        i === index
          ? {
              ...ticket,
              [field]: value,
            }
          : ticket
      )
    );
  }

  function removeTicketType(index: number) {
    setTicketTypes((current) =>
      current.filter((_, i) => i !== index)
    );
  }

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
          ticketTypes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update event."
        );
      }

      setEvent(result.event);
      setTicketTypes(
        result.event.ticketTypes.map((t: any) => ({
          id: t.id,
          name: t.name,
          price: t.price.toString(),
          quantity: t.quantity !== null ? t.quantity.toString() : "",
          unlimited: t.unlimited,
        }))
      );
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

          {/* Ticket Types */}
          <div className="mt-12 border-t border-[#0d1a17]/10 pt-8">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
                  Admission
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  Ticket Types
                </h2>
                
                <p className="mt-2 text-sm text-[#0d1a17]/45">
                  Define the ticket options for this event.
                </p>
              </div>

              <button
                type="button"
                onClick={addTicketType}
                className="shrink-0 rounded-full border border-[#0d1a17]/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors hover:border-[#c9a24b]"
              >
                + Add Ticket
              </button>
            </div>

            {ticketTypes.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#0d1a17]/15 px-6 py-10 text-center">
                <p className="text-sm text-[#0d1a17]/40">
                  No ticket types added.
                </p>

                <button
                  type="button"
                  onClick={addTicketType}
                  className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#b18a3b]"
                >
                  Add the first ticket type →
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {ticketTypes.map((ticket, index) => (
                  <div
                    key={index}
                    className="rounded-[1.5rem] border border-[#0d1a17]/10 bg-white/40 p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]">
                        Ticket {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeTicketType(index)}
                        className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-700/60 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
                        Name
                      </label>

                      <input
                        value={ticket.name}
                        onChange={(e) =>
                          updateTicketType(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        required
                        placeholder="VIP"
                        className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/60 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
                      />
                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
                          Price (UGX)
                        </label>

                        <input
                          value={ticket.price}
                          onChange={(e) =>
                            updateTicketType(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          required
                          min="0"
                          type="number"
                          placeholder="100000"
                          className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/60 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
                          Quantity
                        </label>

                        <input
                          value={ticket.quantity}
                          onChange={(e) =>
                            updateTicketType(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          required={!ticket.unlimited}
                          disabled={ticket.unlimited}
                          min="1"
                          type="number"
                          placeholder="100"
                          className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/60 px-5 py-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-40 focus:border-[#c9a24b]"
                        />
                      </div>
                    </div>

                    <label className="mt-5 flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={ticket.unlimited}
                        onChange={(e) =>
                          updateTicketType(
                            index,
                            "unlimited",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 accent-[#c9a24b]"
                      />

                      <span className="text-sm">
                        Unlimited availability
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
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

        {stats && (
          <div className="mt-12 rounded-[2rem] border border-[#0d1a17]/10 bg-white/50 p-7 sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]">
              Accounting
            </p>
            <h2 className="mt-2 font-serif text-3xl">Ticket Sales & Entry</h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl bg-[#0d1a17] p-6 text-[#f2e9d8]">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Total Entered</p>
                <p className="mt-2 font-serif text-4xl">{stats.totalEntered}</p>
              </div>
              <div className="rounded-xl bg-[#c9a24b] p-6 text-[#0d1a17]">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Total Revenue</p>
                <p className="mt-2 font-serif text-4xl">{stats.totalRevenue.toLocaleString()} UGX</p>
              </div>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d1a17]/60 mb-4">By Ticket Type</h3>
                <div className="space-y-4">
                  {Object.entries(stats.byTicketType).map(([typeName, data]) => (
                    <div key={typeName} className="flex justify-between items-center border-b border-[#0d1a17]/10 pb-3">
                      <span className="font-medium text-sm">{typeName}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold">{data.revenue.toLocaleString()} UGX</p>
                        <p className="text-[10px] uppercase tracking-wider text-[#0d1a17]/50">{data.entered} entered</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d1a17]/60 mb-4">By Payment Method</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#0d1a17]/10 pb-3">
                    <span className="font-medium text-sm">Online (Mobile Money)</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-700">{stats.byPaymentMethod.ONLINE.revenue.toLocaleString()} UGX</p>
                      <p className="text-[10px] uppercase tracking-wider text-[#0d1a17]/50">{stats.byPaymentMethod.ONLINE.entered} entered</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#0d1a17]/10 pb-3">
                    <span className="font-medium text-sm">Walk-in (Cash)</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-700">{stats.byPaymentMethod.WALK_IN.revenue.toLocaleString()} UGX</p>
                      <p className="text-[10px] uppercase tracking-wider text-[#0d1a17]/50">{stats.byPaymentMethod.WALK_IN.entered} entered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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