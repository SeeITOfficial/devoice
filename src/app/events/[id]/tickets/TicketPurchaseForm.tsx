"use client";

import { useState } from "react";
import Link from "next/link";

type TicketType = {
  id: string;
  name: string;
  price: number;
  quantity: number | null;
  unlimited: boolean;
  availableQuantity: number | null;
};

type EventData = {
  id: string;
  title: string;
  date: string;
};

type PaymentInstructions = {
  provider: string;
  accountNumber: string;
  accountName: string;
};

type Props = {
  event: EventData;
  ticketTypes: TicketType[];
  paymentInstructions: PaymentInstructions;
};

export default function TicketPurchaseForm({ event, ticketTypes, paymentInstructions }: Props) {
  const [ticketTypeId, setTicketTypeId] = useState(
    ticketTypes.length > 0 ? ticketTypes[0].id : ""
  );
  const [quantity, setQuantity] = useState(1);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    orderId: string;
    tickets: {
      ticketCode: string;
    }[];
  } | null>(null);

  const selectedTicket = ticketTypes.find((ticket) => ticket.id === ticketTypeId);
  const total = selectedTicket ? selectedTicket.price * quantity : 0;

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    if (!selectedTicket) {
      setError("Please select a ticket type.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          ticketTypeId,
          quantity,
          customerName,
          phone,
          email,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to book tickets.");
      }

      setSuccess({
        orderId: result.order.id,
        tickets: result.tickets,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to book tickets."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    // Alternatively, we could use useRouter() but simple window.location works
    // effectively here to force navigation to the dedicated payment page.
    if (typeof window !== 'undefined') {
      window.location.href = `/orders/${success.orderId}/pay`;
    }
    
    return (
      <main className="min-h-screen bg-[#f2e9d8] flex items-center justify-center p-6 text-[#0d1a17]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#b18a3b]">Redirecting to payment instructions...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2e9d8] text-[#0d1a17]">
      <section className="px-6 pb-16 pt-24 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/events/${event.id}`}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]"
          >
            ← Back to Event
          </Link>

          <p className="mt-12 text-xs font-bold uppercase tracking-[0.35em] text-[#b18a3b]">
            Tickets
          </p>

          <h1 className="mt-5 font-serif text-6xl leading-[0.9] sm:text-7xl">
            {event.title}
          </h1>

          <p className="mt-6 text-sm uppercase tracking-[0.15em] text-[#0d1a17]/45">
            {new Intl.DateTimeFormat("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(event.date))}
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 sm:px-10 lg:px-20">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] bg-[#0d1a17] p-7 text-[#f2e9d8] sm:p-10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
              Admission
            </p>

            <h2 className="mt-3 font-serif text-4xl">Choose your ticket</h2>

            <div className="mt-8 space-y-3">
              {ticketTypes.map((ticket) => {
                const isSoldOut = ticket.availableQuantity === 0;
                return (
                  <label
                    key={ticket.id}
                    className={`block rounded-2xl border p-5 transition-colors ${
                      ticketTypeId === ticket.id
                        ? "border-[#c9a24b] bg-[#c9a24b]/10"
                        : "border-[#f2e9d8]/15"
                    } ${isSoldOut ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    <input
                      type="radio"
                      name="ticketType"
                      value={ticket.id}
                      checked={ticketTypeId === ticket.id}
                      disabled={isSoldOut}
                      onChange={() => {
                        setTicketTypeId(ticket.id);
                        setQuantity(1);
                      }}
                      className="sr-only"
                    />

                    <div className="flex items-center justify-between gap-5">
                      <div>
                        <p className="font-serif text-2xl">{ticket.name}</p>

                        <p className="mt-2 text-xs text-[#f2e9d8]/45">
                          {ticket.unlimited
                            ? "Unlimited availability"
                            : ticket.availableQuantity !== null
                              ? `${ticket.availableQuantity} available`
                              : "Availability on request"}
                        </p>
                      </div>

                      <p className="shrink-0 text-lg font-semibold text-[#c9a24b]">
                        {ticket.price.toLocaleString()} UGX
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-8">
              <label
                htmlFor="quantity"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f2e9d8]/45"
              >
                Quantity
              </label>

              <input
                id="quantity"
                type="number"
                min="1"
                max={
                  selectedTicket?.unlimited
                    ? undefined
                    : selectedTicket?.availableQuantity ?? undefined
                }
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value) || 1))
                }
                className="mt-3 w-full rounded-xl border border-[#f2e9d8]/15 bg-transparent px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
              />
            </div>

            <div className="mt-10 border-t border-[#f2e9d8]/10 pt-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
                Your details
              </p>

              <div className="mt-6 space-y-5">
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-[#f2e9d8]/15 bg-transparent px-5 py-4 text-sm outline-none placeholder:text-[#f2e9d8]/30 focus:border-[#c9a24b]"
                />

                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0700000000"
                  type="tel"
                  inputMode="numeric"
                  pattern="^07[0-9]{8}$"
                  title="A valid 10-digit Uganda phone number starting with 07"
                  className="w-full rounded-xl border border-[#f2e9d8]/15 bg-transparent px-5 py-4 text-sm outline-none placeholder:text-[#f2e9d8]/30 focus:border-[#c9a24b]"
                />

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address (required for ticket confirmation)"
                  type="email"
                  required
                  className="w-full rounded-xl border border-[#f2e9d8]/15 bg-transparent px-5 py-4 text-sm outline-none placeholder:text-[#f2e9d8]/30 focus:border-[#c9a24b]"
                />
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || ticketTypes.length === 0 || ticketTypes.every(t => t.availableQuantity === 0)}
              className="mt-8 w-full rounded-full bg-[#f2e9d8] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#0d1a17] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating Tickets..." : "Confirm Tickets"}
            </button>
          </form>

          <aside className="h-fit rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 p-7 sm:p-10 lg:sticky lg:top-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
              Order Summary
            </p>

            <h2 className="mt-3 font-serif text-3xl">
              {selectedTicket?.name ?? "Select a ticket"}
            </h2>

            <div className="mt-8 space-y-4 border-t border-[#0d1a17]/10 pt-6">
              <div className="flex justify-between gap-5 text-sm">
                <span className="text-[#0d1a17]/50">Price</span>
                <span>
                  {selectedTicket
                    ? `${selectedTicket.price.toLocaleString()} UGX`
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between gap-5 text-sm">
                <span className="text-[#0d1a17]/50">Quantity</span>
                <span>{quantity}</span>
              </div>

              <div className="flex justify-between gap-5 border-t border-[#0d1a17]/10 pt-5">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">
                  {total.toLocaleString()} UGX
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
