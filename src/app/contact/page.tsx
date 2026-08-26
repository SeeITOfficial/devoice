"use client";

import { useState } from "react";

const subjects = [
  "General Enquiry",
  "Booking",
  "Collaboration",
  "Media / Press",
  "Business Enquiry",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        form.reset();
      } else {
        alert(result.message || "Unable to send message.");
      }
    } catch (error) {
      console.error("Contact submission error:", error);
      alert("Unable to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f2e9d8] px-6 py-32 text-[#0d1a17] sm:px-10 lg:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Message received
          </p>

          <h1 className="mt-6 font-serif text-6xl leading-none sm:text-7xl">
            Thank you.
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-[#0d1a17]/60">
            Your message has been sent to management. We'll get back to you as
            soon as possible.
          </p>

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-10 rounded-full border border-[#0d1a17]/20 px-7 py-4 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:border-[#b18a3b]"
          >
            Send Another Message
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f2e9d8] text-[#0d1a17]">
      {/* Header */}
      <section className="px-6 pb-20 pt-28 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Management
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-6xl leading-[0.9] sm:text-7xl lg:text-9xl">
            Let's
            <br />
            connect.
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-[#0d1a17]/60 sm:text-lg">
            For bookings, collaborations, media enquiries and business
            opportunities, contact the De Voice management team.
          </p>
        </div>
      </section>

      {/* Contact area */}
      <section className="bg-[#0d1a17] px-6 py-20 text-[#f2e9d8] sm:px-10 lg:px-20">
        <div className="mx-auto grid max-w-[1200px] gap-16 lg:grid-cols-[0.7fr_1.3fr]">
          {/* Contact information */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#c9a24b]">
              Get in touch
            </p>

            <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
              De Voice
              <br />
              Management
            </h2>

            <div className="mt-10 space-y-7">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#f2e9d8]/35">
                  Email
                </p>

                <p className="mt-2 text-sm text-[#f2e9d8]/70">
                  management@devoice.com
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#f2e9d8]/35">
                  Location
                </p>

                <p className="mt-2 text-sm text-[#f2e9d8]/70">
                  Kampala, Uganda
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#f2e9d8]/35">
                  Availability
                </p>

                <p className="mt-2 text-sm leading-6 text-[#f2e9d8]/70">
                  Uganda · Africa · International
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
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
            </div>

            <input
              required
              type="tel"
              name="phone"
              placeholder="Phone / WhatsApp"
              className="w-full rounded-2xl border border-[#f2e9d8]/15 bg-[#f2e9d8]/[0.04] px-5 py-4 text-sm text-[#f2e9d8] outline-none placeholder:text-[#f2e9d8]/30 focus:border-[#c9a24b]"
            />

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#f2e9d8]/35">
                What is this about?
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {subjects.map((subject) => (
                  <label key={subject} className="cursor-pointer">
                    <input
                      required
                      type="radio"
                      name="subject"
                      value={subject}
                      className="peer sr-only"
                    />

                    <span className="block rounded-2xl border border-[#f2e9d8]/15 bg-[#f2e9d8]/[0.03] px-5 py-4 text-sm text-[#f2e9d8]/55 transition-all peer-checked:border-[#c9a24b] peer-checked:bg-[#c9a24b]/10 peer-checked:text-[#c9a24b]">
                      {subject}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <textarea
              required
              name="message"
              rows={6}
              placeholder="Your message..."
              className="w-full resize-none rounded-2xl border border-[#f2e9d8]/15 bg-[#f2e9d8]/[0.04] px-5 py-4 text-sm text-[#f2e9d8] outline-none placeholder:text-[#f2e9d8]/30 focus:border-[#c9a24b]"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#f2e9d8] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#0d1a17] transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#f2e9d8]/25">
              Your message will be reviewed by management.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}