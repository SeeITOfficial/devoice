"use client";

import { useState } from "react";

type Song = {
  id: string;
  title: string;
  published: boolean;
  releaseDate: Date | string;
};

type Album = {
  id: string;
  title: string;
  artworkUrl: string;
  releaseDate: Date | string;
  published: boolean;
  songs: Song[];
};

export default function AlbumCard({ initialAlbum }: { initialAlbum: Album }) {
  const [album, setAlbum] = useState(initialAlbum);
  const [deleted, setDeleted] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(album.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (deleted) return null;

  async function handleRenameAlbum() {
    if (!newTitle.trim() || newTitle === album.title) {
      setEditingTitle(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/albums/${album.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update album.");
      setAlbum({ ...album, title: data.album.title });
      setEditingTitle(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update album.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublishAlbum() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/albums/${album.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !album.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update album.");
      setAlbum({ ...album, published: data.album.published });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update album.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAlbum() {
    if (!confirm(`Delete album "${album.title}" and ALL its songs? This cannot be undone.`)) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/albums/${album.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to delete album.");
      setDeleted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete album.");
      setSaving(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-[#0d1a17]/10 bg-white/50">
      <div className="grid lg:grid-cols-[260px_1fr]">
        {/* Artwork */}
        <div className="relative aspect-square bg-[#16241f] lg:aspect-auto">
          {album.artworkUrl ? (
            <img
              src={album.artworkUrl}
              alt={album.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs uppercase tracking-[0.25em] text-[#c9a24b]">
                No Artwork
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePublishAlbum}
                disabled={saving}
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
                  album.published
                    ? "bg-[#0d1a17] text-[#f2e9d8] hover:bg-red-900"
                    : "bg-[#0d1a17]/5 text-[#0d1a17]/40 hover:bg-[#0d1a17] hover:text-white"
                }`}
              >
                {album.published ? "Published (Click to Unpublish)" : "Draft (Click to Publish)"}
              </button>

              <span className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(album.releaseDate))}
              </span>
            </div>

            <button
              onClick={handleDeleteAlbum}
              disabled={saving}
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600 hover:underline disabled:opacity-50"
            >
              Delete Album
            </button>
          </div>

          <div className="mt-5">
            {editingTitle ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameAlbum();
                    if (e.key === "Escape") { setEditingTitle(false); setNewTitle(album.title); }
                  }}
                  className="flex-1 rounded-xl border border-[#0d1a17]/20 bg-white px-4 py-2 text-xl outline-none focus:border-[#c9a24b]"
                />
                <button
                  onClick={handleRenameAlbum}
                  disabled={saving}
                  className="rounded-xl bg-[#0d1a17] px-4 text-xs font-bold text-[#f2e9d8] disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => { setEditingTitle(false); setNewTitle(album.title); }}
                  className="rounded-xl border border-[#0d1a17]/20 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-4xl">{album.title}</h2>
                <button
                  onClick={() => setEditingTitle(true)}
                  className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b18a3b] hover:underline"
                >
                  Rename
                </button>
              </div>
            )}
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>

          {/* Songs */}
          <div className="mt-8 border-t border-[#0d1a17]/10">
            {album.songs.length === 0 ? (
              <p className="py-6 text-sm text-[#0d1a17]/40">
                No songs added to this album.
              </p>
            ) : (
              album.songs.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={index}
                  onDeleted={(id) =>
                    setAlbum({ ...album, songs: album.songs.filter((s) => s.id !== id) })
                  }
                />
              ))
            )}
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-wrap gap-3 border-t border-[#0d1a17]/10 pt-6">
            <a
              href={`/admin/music/${album.id}/songs/new`}
              className="rounded-full bg-[#0d1a17] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-colors hover:bg-black"
            >
              Add Song
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function SongRow({
  song,
  index,
  onDeleted,
}: {
  song: Song;
  index: number;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(song.title);
  const [published, setPublished] = useState(song.published);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/songs/${song.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, published }),
      });
      if (res.ok) {
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete song "${song.title}"?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/songs/${song.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(song.id);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#0d1a17]/10 py-5 last:border-b-0">
      <div className="flex flex-1 items-center gap-4">
        <span className="text-xs text-[#b18a3b]">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full max-w-[200px] rounded-lg border border-[#0d1a17]/20 px-3 py-1 text-sm outline-none"
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                Published
              </label>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded bg-[#0d1a17] px-2 py-1 text-[10px] font-bold uppercase text-white"
              >
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setTitle(song.title); setPublished(song.published); }}
                className="rounded border border-[#0d1a17]/20 px-2 py-1 text-[10px] font-bold uppercase"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <p className="font-serif text-xl">{title}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#0d1a17]/35">
                {published ? "Published" : "Draft"}
              </p>
            </>
          )}
        </div>
      </div>

      {!editing && (
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-xs text-[#0d1a17]/35">
            {new Intl.DateTimeFormat("en-GB", { year: "numeric" }).format(new Date(song.releaseDate))}
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b18a3b] hover:underline"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600 hover:underline disabled:opacity-50"
            >
              Del
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
