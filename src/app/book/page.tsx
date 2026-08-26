"use client";

import { useState } from "react";

const eventTypes = [
  "Live Performance",
  "Private Event",
  "Corporate Event",
  "Wedding",
  "Festival",
  "Collaboration",
  "Other",
];

const guestSizes = [
  "Under 50",
  "50–150",
  "150–500",
  "500–1,000",
  "1,000+",
];

export default function BookPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f2e9d8] px-6 py-32 text-[#0d1a17] sm:px-10 lg:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Request received
          </p>

          <h1 className="mt-6 font-serif text-6xl leading-none sm:text-7xl">
            Thank you.
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-[#0d1a17]/60">
            Management will review your booking request and get back to you
            with availability and next steps.
          </p>

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-10 rounded-full border border-[#0d1a17]/20 px-7 py-4 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:border-[#b18a3b]"
          >
            Send Another Request
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f2e9d8] text-[#0d1a17]">
      {/* Header */}
      <section className="px-6 pb-16 pt-28 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Booking
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">
            Bring
            <br />
            De Voice.
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-[#0d1a17]/60 sm:text-lg">
            Tell management a little about your event and we'll take it from
            there.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="bg-[#0d1a17] px-6 py-20 text-[#f2e9d8] sm:px-10 lg:px-20">
        <form
          onSubmit={async (event) => {
            event.preventDefault();

            const form = event.currentTarget;
            const formData = new FormData(form);

            setSubmitting(true);
            setError("");

            try {
              const response = await fetch("/api/book", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: formData.get("name"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  eventType: formData.get("eventType"),
                  date: formData.get("date"),
                  location: formData.get("location"),
                  guestSize: formData.get("guestSize"),
                  message: formData.get("message"),
                }),
              });

              const result = await response.json();

              if (!response.ok || !result.success) {
                throw new Error(
                  result.message || "Unable to submit booking."
                );
              }

              setSubmitted(true);
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Unable to submit booking."
              );
            } finally {
              setSubmitting(false);
            }
		  }}	
          className="mx-auto max-w-[1000px]"
        >
          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#c9a24b]">
              01 · Your details
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <input
                required
                type="text"
                name="name"
                placeholder="Your name"
                className="rounded-2xl border border-[#f2e9d8]/15 bg-[#f2e9d8]/[0.04] px-5 py-4 text-sm text-[#f2e9d8] outline-none placeholder:text-[#f2e9d8]/30 focus:border-[#c9a24b]"
              />

              <input
                required
                type="email"
                name="email"
                placeholder="Email address"
                className="rounded-2xl border border-[#f2e9d8]/15 bg-[#f2e9d8]/[0.04] px-5 py-4 text-sm text-[#f2e9d8] outline-none placeholder:text-[#f2e9d8]/30 focus:border-[#c9a24b]"
              />

              <input
                required
                type="tel"
                name="phone"
                placeholder="Phone / WhatsApp"
                className="rounded-2xl border border-[#f2e9d8]/15 bg-[#f2e9d8]/[0.04] px-5 py-4 text-sm text-[#f2e9d8] outline-none placeholder:text-[#f2e9d8]/30 focus:border-[#c9a24b]"
              />
            </div>
          </div>

          {/* Event type */}
          <div className="mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#c9a24b]">
              02 · Event type
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {eventTypes.map((type) => (
                <label key={type} className="cursor-pointer">
                  <input
                    required
                    type="radio"
                    name="eventType"
                    value={type}
                    className="peer sr-only"
                  />

                  <span className="block rounded-2xl border border-[#f2e9d8]/15 bg-[#f2e9d8]/[0.03] px-5 py-4 text-sm text-[#f2e9d8]/60 transition-all peer-checked:border-[#c9a24b] peer-checked:bg-[#c9a24b]/10 peer-checked:text-[#c9a24b]">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Event details */}
          <div className="mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#c9a24b]">
              03 · Event details
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <input
                required
                type="date"
                name="date"
                className="rounded-2xl border border-[#f2e9d8]/15 bg-[#f2e9d8]/[0.04] px-5 py-4 text-sm text-[#f2e9d8] outline-none focus:border-[#c9a24b]"
              />

              <input
                required
                type="text"
                name="location"
                placeholder="Event location"
                className="rounded-2xl border border-[#f2e9d8]/15 bg-[#f2e9d8]/[0.04] px-5 py-4 text-sm text-[#f2e9d8] outline-none placeholder:text-[#f2e9d8]/30 focus:border-[#c9a24b]"
              />
            </div>

            <div className="mt-5">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#f2e9d8]/40">
                Expected attendance
              </p>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {guestSizes.map((size) => (
                  <label key={size} className="cursor-pointer">
                    <input
                      required
                      type="radio"
                      name="guestSize"
                      value={size}
                      className="peer sr-only"
                    />

                    <span className="block rounded-xl border border-[#f2e9d8]/15 px-4 py-3 text-center text-xs text-[#f2e9d8]/50 transition-all peer-checked:border-[#c9a24b] peer-checked:text-[#c9a24b]">
                      {size}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#c9a24b]">
              04 · Anything else?
            </p>

            <textarea
              name="message"
              rows={5}
              placeholder="Tell us anything management should know..."
              className="mt-8 w-full resize-none rounded-2xl border border-[#f2e9d8]/15 bg-[#f2e9d8]/[0.04] px-5 py-4 text-sm text-[#f2e9d8] outline-none placeholder:text-[#f2e9d8]/30 focus:border-[#c9a24b]"
            />
          </div>

          {/* Submit */}
          <div className="mt-10 border-t border-[#f2e9d8]/10 pt-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#f2e9d8] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#0d1a17] transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Sending Request..."
                : "Send Booking Request"}
            </button>

            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-[#f2e9d8]/30">
              Your request will be reviewed by management.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}