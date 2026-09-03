"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import QRCode from "qrcode";

// ─── Types ───────────────────────────────────────────────────────────────────

type TicketStatus = "RESERVED" | "VALID" | "USED" | "INVALID";
type OrderStatus = "PENDING" | "CONFIRMED";

type TicketItem = {
  id: string;
  ticketCode: string;
  qrToken: string | null;
  status: TicketStatus;
  ticketType: { id: string; name: string; price: number };
};

type Order = {
  id: string;
  status: OrderStatus;
  quantity: number;
  customerName: string;
  createdAt: string;
  event: { id: string; title: string; date: string };
  tickets: TicketItem[];
};

type Stage = "phone" | "code" | "tickets";

// ─── QR Canvas ───────────────────────────────────────────────────────────────

function QrCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 250,
        margin: 2,
        color: { dark: "#0d1a17", light: "#f2e9d8" },
      }).catch(console.error);
    }
  }, [value]);

  return <canvas ref={canvasRef} className="rounded-xl" />;
}

// ─── Ticket Card ─────────────────────────────────────────────────────────────

function TicketCard({
  ticket,
  event,
  orderStatus,
}: {
  ticket: TicketItem;
  event: Order["event"];
  orderStatus: OrderStatus;
}) {
  const statusConfig: Record<string, { label: string; style: string }> = {
    VALID: { label: "Valid", style: "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20" },
    USED: { label: "Used", style: "bg-[#0d1a17]/10 text-[#0d1a17]/50 border border-[#0d1a17]/15" },
    INVALID: { label: "Invalid", style: "bg-red-500/10 text-red-700 border border-red-500/20" },
    RESERVED: { label: "Pending Payment", style: "bg-blue-500/10 text-blue-800 border border-blue-500/20" },
  };
  const cfg = statusConfig[ticket.status] ?? { label: ticket.status, style: "" };
  const eventDate = new Date(event.date);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-[#0d1a17]/10 bg-white/50">
      {/* Top stripe for PENDING */}
      {orderStatus === "PENDING" && (
        <div className="bg-[#c9a24b]/10 px-7 py-3 border-b border-[#c9a24b]/20">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#8c6b25] font-bold">
            ◷ Payment Pending — not a valid ticket yet
          </p>
        </div>
      )}

      <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
        {/* Left: details */}
        <div className="p-7 sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${cfg.style}`}>
              {cfg.label}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/40">
              {ticket.ticketType.name}
            </span>
          </div>

          <h2 className="mt-4 font-serif text-3xl leading-tight">{event.title}</h2>

          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/40">Date</p>
              <p className="mt-1">
                {new Intl.DateTimeFormat("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(eventDate)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/40">Ticket Code</p>
              <p className="mt-1 font-mono font-bold tracking-wider">{ticket.ticketCode}</p>
            </div>
          </div>
        </div>

        {/* Right: QR */}
        {ticket.qrToken && ticket.status !== "INVALID" && (
          <div className="flex items-center justify-center border-t border-[#0d1a17]/10 p-7 sm:border-l sm:border-t-0 sm:p-9">
            <div className="flex flex-col items-center gap-3">
              <QrCanvas value={ticket.qrToken} />
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/40 text-center">
                Scan at entry
              </p>
            </div>
          </div>
        )}

        {/* No QR for pending/invalid */}
        {(!ticket.qrToken || ticket.status === "INVALID") && orderStatus === "CONFIRMED" && (
          <div className="flex items-center justify-center border-t border-[#0d1a17]/10 p-7 sm:border-l sm:border-t-0">
            <p className="text-sm text-[#0d1a17]/40 text-center">
              {ticket.status === "USED" ? "Ticket used at entry" : "Ticket unavailable"}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyTicketsPage() {
  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // On mount, try to load existing session
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ticket/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setOrders(data.orders);
            setStage("tickets");
          }
        }
      } catch {
        // no session — stay on phone stage
      }
    })();
  }, []);

  // ── Stage 1: Request OTP ──────────────────────────────────────────────────

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/ticket/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      setMessage(data.message ?? "Check your email for a verification code.");
      setStage("code");
    } catch {
      setError("Unable to contact server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Stage 2: Verify OTP ───────────────────────────────────────────────────

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ticket/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? "Incorrect code. Please try again.");
        setLoading(false);
        return;
      }

      // Session cookie is now set — load tickets
      const ordersRes = await fetch("/api/ticket/orders");
      const ordersData = await ordersRes.json();
      setOrders(ordersData.orders ?? []);
      setStage("tickets");
    } catch {
      setError("Unable to verify. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Stage 3: Sign out ─────────────────────────────────────────────────────

  function handleSignOut() {
    // Clear session by resetting state; cookie expires naturally
    document.cookie = "ticket_session=; Max-Age=0; path=/";
    setStage("phone");
    setPhone("");
    setCode("");
    setOrders(null);
    setMessage("");
    setError("");
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const confirmedOrders = orders?.filter((o) => o.status === "CONFIRMED") ?? [];
  const pendingOrders = orders?.filter((o) => o.status === "PENDING") ?? [];

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-24 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">

        {/* ── Stage 1: Phone entry ──────────────────────────────────────── */}
        {stage === "phone" && (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#b18a3b]">
              De Voice
            </p>
            <h1 className="mt-5 font-serif text-6xl leading-none">My Tickets</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#0d1a17]/60">
              Enter the phone number you used when purchasing your ticket. We'll send a verification code to your registered email address.
            </p>

            <form onSubmit={handleRequestCode} className="mt-12">
              <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/50">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 700 000 000"
                required
                className="mt-3 w-full rounded-xl border border-[#0d1a17]/15 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
              />

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="mt-6 rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Code"}
              </button>
            </form>
          </>
        )}

        {/* ── Stage 2: OTP entry ───────────────────────────────────────── */}
        {stage === "code" && (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#b18a3b]">
              Verification
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-none">Enter verification code</h1>

            {message && (
              <p className="mt-6 max-w-xl text-base leading-7 text-[#0d1a17]/60">
                {message}
              </p>
            )}

            <form onSubmit={handleVerifyCode} className="mt-10">
              <label htmlFor="code" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/50">
                6-digit code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                required
                autoFocus
                className="mt-3 w-full rounded-xl border border-[#0d1a17]/15 bg-white/50 px-5 py-4 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-[#c9a24b]"
              />

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStage("phone"); setCode(""); setError(""); }}
                  className="rounded-full border border-[#0d1a17]/15 px-6 py-5 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:border-[#c9a24b]"
                >
                  Back
                </button>
              </div>

              <p className="mt-6 text-xs text-[#0d1a17]/40">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  onClick={() => { setStage("phone"); setCode(""); setError(""); }}
                  className="text-[#b18a3b] underline underline-offset-2"
                >
                  Try again
                </button>
              </p>
            </form>
          </>
        )}

        {/* ── Stage 3: Ticket dashboard ────────────────────────────────── */}
        {stage === "tickets" && orders !== null && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#b18a3b]">My Tickets</p>
                <h1 className="mt-5 font-serif text-5xl leading-none">Your tickets</h1>
              </div>
              <button
                onClick={handleSignOut}
                className="mt-2 rounded-full border border-[#0d1a17]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:border-[#0d1a17]/30"
              >
                Sign out
              </button>
            </div>

            {orders.length === 0 && (
              <div className="mt-12 rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 p-16 text-center">
                <p className="font-serif text-3xl">No tickets found.</p>
                <p className="mt-3 text-sm text-[#0d1a17]/50">
                  No confirmed or pending orders are associated with this number.
                </p>
                <Link
                  href="/events"
                  className="mt-8 inline-flex rounded-full bg-[#0d1a17] px-7 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8]"
                >
                  Browse Events
                </Link>
              </div>
            )}

            {/* Confirmed tickets */}
            {confirmedOrders.length > 0 && (
              <section className="mt-12">
                <div className="space-y-6">
                  {confirmedOrders.map((order) =>
                    order.tickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        event={order.event}
                        orderStatus={order.status}
                      />
                    ))
                  )}
                </div>
              </section>
            )}

            {/* Pending tickets */}
            {pendingOrders.length > 0 && (
              <section className="mt-12">
                <div className="space-y-6">
                  {pendingOrders.map((order) =>
                    order.tickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={{ ...ticket, qrToken: null }}
                        event={order.event}
                        orderStatus={order.status}
                      />
                    ))
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
