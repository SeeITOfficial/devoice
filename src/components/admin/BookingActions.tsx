"use client";

import { useState } from "react";

type BookingActionsProps = {
  bookingId: string;
  status: "PENDING" | "CONFIRMED";
};

export default function BookingActions({
  bookingId,
  status,
}: BookingActionsProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  async function updateStatus(nextStatus: "PENDING" | "CONFIRMED") {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update booking.");
      }

      setCurrentStatus(nextStatus);
    } catch (error) {
      console.error(error);
      alert("Unable to update booking.");
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "CONFIRMED") {
    return (
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#0d1a17] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f2e9d8]">
          Confirmed
        </span>

        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("PENDING")}
          className="text-[10px] uppercase tracking-[0.15em] text-[#0d1a17]/40 hover:text-[#0d1a17]"
        >
          Reopen
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => updateStatus("CONFIRMED")}
      className="rounded-full bg-[#c9a24b] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0d1a17] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Updating..." : "Confirm Booking"}
    </button>
  );
}