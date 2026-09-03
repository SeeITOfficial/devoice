"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  totalAmount: number;
  unitPrice: number;
};

export default function OrderActions({ orderId, totalAmount, unitPrice }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmResult, setConfirmResult] = useState<{
    emailSent: boolean;
    emailError?: string;
  } | null>(null);

  async function handleConfirm() {
    if (
      !confirm(
        `Confirm payment of ${totalAmount.toLocaleString()} UGX for this order?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setConfirmResult(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONFIRM_PAYMENT" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to confirm payment.");
      }

      setConfirmResult({
        emailSent: result.emailSent ?? false,
        emailError: result.emailError,
      });

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to confirm payment."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (
      !confirm(
        "Reject this order? This will invalidate any reserved tickets."
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setConfirmResult(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reject order.");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject order."
      );
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 border-t border-[#0d1a17]/10 pt-6">
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {confirmResult && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-xs ${
            confirmResult.emailSent
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-800"
              : "border-amber-500/20 bg-amber-500/10 text-amber-800"
          }`}
        >
          <p className="font-semibold">Payment confirmed.</p>
          {confirmResult.emailSent ? (
            <p className="mt-0.5">Ticket email sent successfully.</p>
          ) : (
            <p className="mt-0.5">
              Ticket email could not be sent.{" "}
              {confirmResult.emailError && (
                <span className="opacity-70">{confirmResult.emailError}</span>
              )}
              {" "}The ticket is still valid — the customer can retrieve it at /ticket.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/50">
            Amount Due
          </p>
          <p
            className="mt-1 font-serif text-2xl text-[#b18a3b]"
            title={`${unitPrice.toLocaleString()} UGX per ticket`}
          >
            {totalAmount.toLocaleString()} UGX
          </p>
        </div>

        <button
          onClick={handleReject}
          disabled={loading}
          className="rounded-full border border-red-700/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-red-700 transition-colors hover:bg-red-700/5 disabled:opacity-50"
        >
          {loading ? "..." : "Reject"}
        </button>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="rounded-full bg-[#0d1a17] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
}
