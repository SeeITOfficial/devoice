"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";

type ValidateResult =
  | "CHECKED_IN"
  | "ALREADY_USED"
  | "RESERVED"
  | "INVALID"
  | "NOT_FOUND"
  | "SOLD_OUT"
  | "EVENT_MISMATCH";

type ValidationResponse = {
  success: boolean;
  result: ValidateResult;
  message: string;
  ticket?: {
    id: string;
    ticketCode: string;
    status: string;
    ticketType: { name: string; price: number };
    customerName: string;
    phone: string;
    email: string | null;
    event: { title: string; date: string; cancelled: boolean };
  } | null;
};

export default function TicketValidatePage() {
  const [code, setCode] = useState("");
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResponse | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  async function startCamera() {
    setCameraError("");
    setResult(null);
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Success callback
          if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().catch(console.error);
            setCameraActive(false);
          }
          setCode(decodedText);
          validateCode(decodedText);
        },
        () => {
          // Failure callback - ignore
        }
      );
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access failed", err);
      setCameraError("Camera access is unavailable. Enter the ticket code manually.");
      setCameraActive(false);
    }
  }

  async function stopCamera() {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        setCameraActive(false);
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    validateCode(code);
  }

  async function validateCode(rawCode: string) {
    const trimmed = rawCode.trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);

    try {
      const isQrToken =
        trimmed.includes("-") && trimmed.length > 16 && !trimmed.startsWith("DV-");

      const payload = {
        ...(isQrToken ? { qrToken: trimmed } : { ticketCode: trimmed }),
        ...(eventId.trim() ? { eventId: eventId.trim() } : {}),
      };

      const response = await fetch("/api/admin/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        success: false,
        result: "NOT_FOUND",
        message: "Unable to contact server. Check your connection.",
      });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setCode("");
    setResult(null);
  }

  function scanNext() {
    reset();
    startCamera();
  }

  const resultStyles: Record<string, string> = {
    CHECKED_IN: "border-emerald-500/30 bg-emerald-500/5",
    ALREADY_USED: "border-amber-500/30 bg-amber-500/5",
    RESERVED: "border-blue-500/30 bg-blue-500/5",
    INVALID: "border-red-500/30 bg-red-500/5",
    NOT_FOUND: "border-[#0d1a17]/10 bg-white/30",
    SOLD_OUT: "border-red-500/30 bg-red-500/5",
    EVENT_MISMATCH: "border-red-500/30 bg-red-500/5",
  };

  const resultBadge: Record<string, string> = {
    CHECKED_IN: "bg-emerald-500/10 text-emerald-800",
    ALREADY_USED: "bg-amber-500/10 text-amber-800",
    RESERVED: "bg-blue-500/10 text-blue-800",
    INVALID: "bg-red-500/10 text-red-700",
    NOT_FOUND: "bg-[#0d1a17]/5 text-[#0d1a17]/50",
    SOLD_OUT: "bg-red-500/10 text-red-700",
    EVENT_MISMATCH: "bg-red-500/10 text-red-700",
  };

  const resultLabel: Record<string, string> = {
    CHECKED_IN: "✓ Checked In",
    ALREADY_USED: "Already Used",
    RESERVED: "◷ Pending Payment",
    INVALID: "Invalid Ticket",
    NOT_FOUND: "Not Found",
    SOLD_OUT: "Sold Out",
    EVENT_MISMATCH: "Wrong Event",
  };

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin/tickets"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]"
        >
          ← Back to Orders
        </Link>

        <div className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Event Check-in
          </p>
          <h1 className="mt-4 font-serif text-6xl leading-none">Validate Ticket</h1>
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#0d1a17]/10 bg-white/50 p-7 sm:p-10">
          <label
            htmlFor="eventId"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
          >
            Event context (optional)
          </label>
          <input
            id="eventId"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter the event ID to restrict check-in"
            autoComplete="off"
            className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 font-mono text-sm outline-none focus:border-[#c9a24b]"
          />
          <p className="mt-3 text-xs text-[#0d1a17]/45">
            Leave blank to use the existing global scanner behavior.
          </p>
        </div>

        {/* Camera Scanner Section */}
        <div className="mt-12 rounded-[2rem] bg-white/50 p-7 sm:p-10 border border-[#0d1a17]/10">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/60 mb-6">Scanner</h2>
          
          <div className="flex flex-col items-center">
            {/* The QR Reader Container */}
            <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden mb-6 bg-black/5"></div>
            
            {cameraError && (
              <p className="text-sm font-medium text-red-600 mb-6 text-center">{cameraError}</p>
            )}

            {!cameraActive && !result ? (
              <button
                type="button"
                onClick={startCamera}
                className="w-full sm:w-auto rounded-full bg-[#c9a24b] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#0d1a17] transition-all hover:bg-[#b18a3b]"
              >
                Start Camera
              </button>
            ) : cameraActive ? (
              <button
                type="button"
                onClick={stopCamera}
                className="w-full sm:w-auto rounded-full bg-red-600/10 px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-red-700 transition-all hover:bg-red-600/20"
              >
                Stop Camera
              </button>
            ) : null}
            
            {result && !cameraActive && (
              <button
                type="button"
                onClick={scanNext}
                className="w-full sm:w-auto rounded-full bg-[#c9a24b] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#0d1a17] transition-all hover:bg-[#b18a3b]"
              >
                Scan Next Ticket
              </button>
            )}
          </div>
        </div>

        {/* Manual Fallback Section */}
        <form onSubmit={handleSubmit} className="mt-8 rounded-[2rem] bg-white/50 p-7 sm:p-10 border border-[#0d1a17]/10">
          <label htmlFor="code" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
            Manual Ticket Code
          </label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="DV-XXXXXXXXXX"
            autoComplete="off"
            className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 font-mono text-sm outline-none focus:border-[#c9a24b]"
          />

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading || !code.trim() || cameraActive}
              className="flex-1 rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-all hover:bg-[#0d1a17]/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Submit"}
            </button>
            {result && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-[#0d1a17]/15 px-6 py-5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all hover:border-[#c9a24b] hover:bg-[#0d1a17]/5"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Result card */}
        {result && (
          <div
            className={`mt-6 rounded-[2rem] border p-7 sm:p-9 shadow-sm ${
              result.result
                ? resultStyles[result.result] ?? "border-[#0d1a17]/10 bg-white/30"
                : "border-[#0d1a17]/10 bg-white/30"
            }`}
            role="status"
            aria-label={`Result: ${result.message}`}
            aria-live="polite"
          >
            {result.result && (
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] ${
                  resultBadge[result.result] ?? ""
                }`}
              >
                <span aria-hidden="true">
                  {result.result === "CHECKED_IN" && "✓"}
                  {result.result === "ALREADY_USED" && "⚠"}
                  {result.result === "INVALID" && "✕"}
                  {result.result === "NOT_FOUND" && "?"}
                  {result.result === "SOLD_OUT" && "✕"}
                  {result.result === "RESERVED" && "◷"}
                </span>
                {resultLabel[result.result] ?? result.result}
              </span>
            )}

            <p className="mt-5 text-sm font-medium">{result.message}</p>

            {result.ticket && (
              <div className="mt-7 grid gap-5 border-t border-current/10 pt-6 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">Guest</p>
                  <p className="mt-2 text-sm font-medium">{result.ticket.customerName}</p>
                  <p className="mt-1 text-xs text-[#0d1a17]/50">{result.ticket.phone}</p>
                  {result.ticket.email && (
                    <p className="mt-1 text-xs text-[#0d1a17]/50">{result.ticket.email}</p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">Event</p>
                  <p className="mt-2 text-sm font-medium">{result.ticket.event.title}</p>
                  <p className="mt-1 text-xs text-[#0d1a17]/50">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(result.ticket.event.date))}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">Ticket code</p>
                  <p className="mt-2 font-mono text-sm font-bold">{result.ticket.ticketCode}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">Ticket type</p>
                  <p className="mt-2 text-sm">{result.ticket.ticketType.name}</p>
                  <p className="mt-1 text-xs text-[#0d1a17]/50">{result.ticket.ticketType.price.toLocaleString()} UGX</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
