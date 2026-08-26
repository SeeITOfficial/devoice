"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MediaUploader from "@/components/admin/MediaUploader";

type AudioMode = "UPLOAD" | "EXTERNAL";

export default function NewSongPage() {
  const params = useParams();
  const albumId = params.albumId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [audioMode, setAudioMode] =
    useState<AudioMode>("UPLOAD");

  const [audioUrl, setAudioUrl] = useState("");
  const [artworkUrl, setArtworkUrl] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!audioUrl.trim()) {
      setError(
        "Please upload an audio file or provide an external audio URL."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          audioUrl: audioUrl.trim(),
          artworkUrl: artworkUrl.trim() || null,
          releaseDate: formData.get("releaseDate"),
          published: formData.get("published") === "on",
          albumId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to create song."
        );
      }

      window.location.href = "/admin/music";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create song."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/music"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]"
        >
          ← Back to Music
        </Link>

        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
          Music Management
        </p>

        <h1 className="mt-4 font-serif text-6xl leading-none">
          New Song
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-8 rounded-[2rem] bg-white/50 p-7 sm:p-10"
        >
          {/* Song title */}
          <div>
            <label
              htmlFor="title"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Song title
            </label>

            <input
              id="title"
              name="title"
              required
              placeholder="Nakinga"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          {/* Audio */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
              Audio
            </label>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setAudioMode("UPLOAD");
                  setAudioUrl("");
                }}
                className={`rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  audioMode === "UPLOAD"
                    ? "bg-[#0d1a17] text-[#f2e9d8]"
                    : "border border-[#0d1a17]/15"
                }`}
              >
                Upload from Device
              </button>

              <button
                type="button"
                onClick={() => {
                  setAudioMode("EXTERNAL");
                  setAudioUrl("");
                }}
                className={`rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  audioMode === "EXTERNAL"
                    ? "bg-[#0d1a17] text-[#f2e9d8]"
                    : "border border-[#0d1a17]/15"
                }`}
              >
                External URL
              </button>
            </div>

            <div className="mt-5">
              {audioMode === "UPLOAD" ? (
                <MediaUploader
                  mediaType="audio"
                  onUploadComplete={(url) => {
                    setAudioUrl(url);
                  }}
                  label="Choose audio from device"
                  accept="audio/*"
                />
              ) : (
                <div>
                  <p className="mb-3 text-xs leading-5 text-[#0d1a17]/45">
                    Paste a direct audio URL, such as an MP3,
                    M4A or other playable audio file.
                    Spotify and YouTube links are not direct
                    audio files and cannot be used as the
                    song&apos;s audio source.
                  </p>

                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(event) =>
                      setAudioUrl(event.target.value)
                    }
                    placeholder="https://example.com/song.mp3"
                    className="w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Artwork */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
              Artwork
            </label>

            <div className="mt-4">
              <MediaUploader
                mediaType="image"
                onUploadComplete={(url) => {
                  setArtworkUrl(url);
                }}
                label="Choose artwork from device"
                accept="image/*"
              />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[#0d1a17]/35">
                Or use artwork URL
              </p>

              <input
                type="url"
                value={artworkUrl}
                onChange={(event) =>
                  setArtworkUrl(event.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
              />
            </div>
          </div>

          {/* Release date */}
          <div>
            <label
              htmlFor="releaseDate"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Release date
            </label>

            <input
              id="releaseDate"
              name="releaseDate"
              type="date"
              required
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          {/* Published */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="published"
              className="h-4 w-4 accent-[#c9a24b]"
            />

            <span className="text-sm">
              Publish song immediately
            </span>
          </label>

          {/* Audio URL status */}
          {audioUrl && (
            <div className="rounded-xl bg-[#0d1a17] p-5 text-[#f2e9d8]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a24b]">
                Audio ready
              </p>

              <p className="mt-2 break-all text-xs text-[#f2e9d8]/60">
                {audioUrl}
              </p>
            </div>
          )}

          {/* Artwork URL status */}
          {artworkUrl && (
            <div className="rounded-xl border border-[#0d1a17]/10 bg-white/50 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#b18a3b]">
                Artwork ready
              </p>

              <p className="mt-2 break-all text-xs text-[#0d1a17]/45">
                {artworkUrl}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !audioUrl}
            className="w-full rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Song..." : "Create Song"}
          </button>
        </form>
      </div>
    </main>
  );
}