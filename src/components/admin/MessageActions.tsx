"use client";

import { useState } from "react";

type MessageActionsProps = {
  messageId: string;
  read: boolean;
};

export default function MessageActions({
  messageId,
  read,
}: MessageActionsProps) {
  const [isRead, setIsRead] = useState(read);
  const [loading, setLoading] = useState(false);

  async function updateReadStatus(nextRead: boolean) {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/messages/${messageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            read: nextRead,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update message."
        );
      }

      setIsRead(nextRead);
    } catch (error) {
      console.error(error);
      alert("Unable to update message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => updateReadStatus(!isRead)}
      className="rounded-full border border-[#0d1a17]/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:border-[#c9a24b] disabled:opacity-50"
    >
      {loading
        ? "Updating..."
        : isRead
          ? "Mark Unread"
          : "Mark Read"}
    </button>
  );
}