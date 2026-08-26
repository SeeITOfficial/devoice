"use client";

import { useState } from "react";
import Link from "next/link";

type TicketTypeForm = {
  name: string;
  price: string;
  quantity: string;
  unlimited: boolean;
};

export default function NewEventPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([]);

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
          ticketTypes,
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
          className="mt-12 space-y-8 rounded-[2rem] bg-white/50 p-7 sm:p-10"
        >
          {/* Basic event information */}
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
              placeholder="Live at Kampala Serena"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/60 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
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
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/60 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
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
              rows={5}
              placeholder="Tell people about the event..."
              className="mt-3 w-full resize-none rounded-xl border border-[#0d1a17]/10 bg-white/60 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
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
              placeholder="/events/kampala.jpg"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/60 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          {/* Ticket types */}
          <div className="border-t border-[#0d1a17]/10 pt-8">
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