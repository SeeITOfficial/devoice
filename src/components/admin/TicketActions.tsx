"use client";

import { useState } from "react";

type TicketActionsProps = {
  ticketId: string;
  initialStatus: "RESERVED" | "VALID" | "USED" | "INVALID";
};

export default function TicketActions({
  ticketId,
  initialStatus,
}: TicketActionsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function invalidate() {
    if (!confirm("Invalidate this ticket? This cannot be undone.")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "INVALID" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to invalidate ticket.");
      }

      setStatus("INVALID");
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to invalidate ticket."
      );
    } finally {
      setLoading(false);
    }
  }

  const statusStyles: Record<string, string> = {
    RESERVED: "bg-blue-500/10 text-blue-800 border border-blue-500/20",
    VALID:
      "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20",
    USED: "bg-[#0d1a17]/8 text-[#0d1a17]/50 border border-[#0d1a17]/15",
    INVALID: "bg-red-500/10 text-red-700 border border-red-500/20",
  };

  const statusIndicators: Record<string, string> = {
    RESERVED: "◷",
    VALID: "✓",
    USED: "–",
    INVALID: "✕",
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
          statusStyles[status] ?? ""
        }`}
        aria-label={`Ticket status: ${status}`}
      >
        <span className="mr-2" aria-hidden="true">{statusIndicators[status]}</span>
        {status}
      </span>

      {status === "VALID" && (
        <button
          type="button"
          disabled={loading}
          onClick={invalidate}
          aria-label={loading ? "Invalidating ticket" : "Invalidate ticket"}
          className="rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-red-700/60 transition-colors hover:bg-red-500/5 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
        >
          {loading ? "Invalidating..." : "Invalidate"}
        </button>
      )}
    </div>
  );
}
