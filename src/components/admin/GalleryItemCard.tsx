"use client";

import { useState } from "react";

type GalleryItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
  categoryId: string | null;
  category: { name: string } | null;
};

export default function GalleryItemCard({ item }: { item: GalleryItem }) {
  const [title, setTitle] = useState(item.title ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");

  if (deleted) return null;

  async function handleRename() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to rename.");
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to rename.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete this ${item.type === "IMAGE" ? "image" : "video"}? This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to delete.");
      setDeleted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
      setDeleting(false);
    }
  }

  const displayTitle = title || "Untitled";

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[#0d1a17]/10 bg-white/50">
      {/* Thumbnail */}
      <div className="relative aspect-square bg-[#16241f]">
        {item.type === "IMAGE" ? (
          <img
            src={item.thumbnailUrl || item.url}
            alt={displayTitle}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a24b]/50 text-[#c9a24b]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#f2e9d8]/50">Video</p>
            </div>
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-[#0d1a17]/75 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#f2e9d8]">
          {item.type}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {editing ? (
          <div className="space-y-3">
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setEditing(false);
              }}
              placeholder="Enter title (optional)"
              className="w-full rounded-xl border border-[#0d1a17]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#c9a24b]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRename}
                disabled={saving}
                className="rounded-full bg-[#0d1a17] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#f2e9d8] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setTitle(item.title ?? ""); }}
                className="rounded-full border border-[#0d1a17]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="font-serif text-xl">{displayTitle}</p>
        )}

        <p className="mt-2 truncate text-xs text-[#0d1a17]/40">{item.url}</p>

        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-[#0d1a17]/10 pt-4">
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b18a3b] hover:underline"
          >
            Rename
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600 hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
