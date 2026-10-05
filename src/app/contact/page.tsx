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
                  WhatsApp / Phone
                </p>

                <p className="mt-2 text-sm font-medium text-[#f2e9d8]/90">
                  +256 703 008952
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

              <div className="pt-2">
                <a
                  href="https://wa.me/256703008952?text=Hello%2C%20I%20am%20reaching%20out%20to%20De%20Voice%20Management%20regarding%20an%20inquiry%20for%20Jonathan%20(De%20Voice)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-[#0a1412] transition-transform hover:scale-105 hover:bg-[#20ba5a]"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 0C5.397 0 0 5.391 0 12.019c0 2.113.547 4.175 1.588 5.986L.055 24l6.195-1.622a11.968 11.968 0 005.781 1.482h.005c6.633 0 12.03-5.391 12.03-12.022 0-3.21-1.25-6.228-3.52-8.5C18.27 1.066 15.247 0 12.031 0zm0 22.017h-.004a9.99 9.99 0 01-5.093-1.39l-.365-.217-3.784.992 1.01-3.687-.238-.379a9.98 9.98 0 01-1.536-5.317c0-5.526 4.498-10.024 10.02-10.024 2.677 0 5.193 1.043 7.085 2.936a9.96 9.96 0 012.93 7.087c0 5.528-4.498 10.025-10.015 10.025zm5.49-7.514c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.676.15-.2.301-.776.98-.952 1.18-.175.201-.35.226-.651.076-.301-.15-1.272-.469-2.424-1.496-.895-.798-1.5-1.784-1.675-2.085-.175-.3-.019-.463.131-.613.136-.135.301-.35.451-.526.151-.175.201-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.587-.492-.507-.676-.516l-.576-.01c-.2 0-.526.075-.801.376-.276.301-1.053 1.028-1.053 2.507 0 1.479 1.078 2.908 1.228 3.108.15.201 2.121 3.24 5.138 4.542.718.31 1.278.496 1.716.635.722.23 1.379.197 1.898.12.578-.087 1.782-.727 2.032-1.43.25-.702.25-1.303.175-1.429-.075-.125-.275-.201-.576-.351z" />
                  </svg>
                  Direct WhatsApp Chat
                </a>
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