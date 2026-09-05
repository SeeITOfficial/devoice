"use client";

import { useState } from "react";

type VideoSource = "UPLOAD" | "EXTERNAL";

type Video = {
  id: string;
  title: string | null;
  thumbnailUrl: string | null;
  videoUrl: string;
  source: VideoSource;
  createdAt: Date | string;
};

function getYouTubeId(url: string) {
  const m =
    url.match(/[?&]v=([^&]+)/) ??
    url.match(/youtu\.be\/([^?]+)/) ??
    url.match(/youtube\.com\/embed\/([^?]+)/);
  return m ? m[1] : null;
}

export default function VideoCard({ video }: { video: Video }) {
  const [title, setTitle] = useState(video.title ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");

  if (deleted) return null;

  const youtubeId = getYouTubeId(video.videoUrl);
  const autoThumb = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : null;
  const thumbSrc = video.thumbnailUrl || autoThumb;

  async function handleRename() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
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
    if (!confirm("Delete this video? This cannot be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to delete.");
      setDeleted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
      setDeleting(false);
    }
  }

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(video.createdAt));

  return (
    <article className="overflow-hidden rounded-[2rem] border border-[#0d1a17]/10 bg-white/50">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-[#16241f]">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={title || "Video"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#c9a24b]/50 text-[#c9a24b]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-[#0d1a17]/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#f2e9d8]">
          {video.source}
        </div>
      </div>

      {/* Details */}
      <div className="p-6">
        {editing ? (
          <div className="space-y-3">
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") { setEditing(false); setTitle(video.title ?? ""); }
              }}
              placeholder="Video title (optional)"
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
                onClick={() => { setEditing(false); setTitle(video.title ?? ""); }}
                className="rounded-full border border-[#0d1a17]/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <h2 className="font-serif text-2xl">{title || <span className="text-[#0d1a17]/30 italic">Untitled</span>}</h2>
        )}

        <p className="mt-3 truncate text-xs text-[#0d1a17]/40">{video.videoUrl}</p>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-6 flex items-center justify-between border-t border-[#0d1a17]/10 pt-5">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#0d1a17]/35">
            {formattedDate}
          </span>

          <div className="flex items-center gap-4">
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
      </div>
    </article>
  );
}
