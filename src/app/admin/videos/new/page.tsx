"use client";

import { useState } from "react";
import Link from "next/link";
import MultipleMediaUploader from "@/components/admin/MultipleMediaUploader";

type VideoMode = "UPLOAD" | "EXTERNAL";

export default function NewVideoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [videoMode, setVideoMode] = useState<VideoMode>("UPLOAD");
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [externalUrl, setExternalUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [title, setTitle] = useState("");

  const effectiveUrls =
    videoMode === "EXTERNAL"
      ? externalUrl.trim()
        ? [externalUrl.trim()]
        : []
      : videoUrls;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (effectiveUrls.length === 0) {
      setError("Please upload a video or provide an external video URL.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // For single upload, keep original API shape; for multiple, send all
      const results = await Promise.all(
        effectiveUrls.map((url) =>
          fetch("/api/admin/videos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title.trim() || null,
              thumbnailUrl: thumbnailUrl.trim() || null,
              source: videoMode,
              videoUrl: url,
            }),
          }).then((r) => r.json())
        )
      );

      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        throw new Error(failed[0]?.message ?? "Unable to create video.");
      }

      const count = results.length;
      setSuccess(
        `${count} video${count > 1 ? "s" : ""} added successfully!`
      );
      setVideoUrls([]);
      setExternalUrl("");
      setTitle("");
      setThumbnailUrl("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create video."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/videos"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18a3b]"
        >
          ← Back to Videos
        </Link>

        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
          Video Management
        </p>

        <h1 className="mt-4 font-serif text-6xl leading-none">New Video</h1>

        <p className="mt-5 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
          Add an uploaded performance, music video, interview or external video.
          You can select multiple files at once when uploading.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-8 rounded-[2rem] bg-white/50 p-7 sm:p-10"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
            >
              Video title (Optional)
            </label>

            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nankinga — Official Music Video"
              className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          {/* Video source */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
              Video source
            </label>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setVideoMode("UPLOAD");
                  setExternalUrl("");
                }}
                className={`rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  videoMode === "UPLOAD"
                    ? "bg-[#0d1a17] text-[#f2e9d8]"
                    : "border border-[#0d1a17]/15"
                }`}
              >
                Upload from Device
              </button>

              <button
                type="button"
                onClick={() => {
                  setVideoMode("EXTERNAL");
                  setVideoUrls([]);
                }}
                className={`rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  videoMode === "EXTERNAL"
                    ? "bg-[#0d1a17] text-[#f2e9d8]"
                    : "border border-[#0d1a17]/15"
                }`}
              >
                YouTube / Vimeo / URL
              </button>
            </div>

            <div className="mt-5">
              {videoMode === "UPLOAD" ? (
                <MultipleMediaUploader
                  mediaType="video"
                  onUploadComplete={(urls) => setVideoUrls(urls)}
                  label="Choose videos from device (select multiple)"
                  accept="video/mp4,video/webm,video/quicktime"
                />
              ) : (
                <div>
                  <p className="mb-3 text-xs leading-5 text-[#0d1a17]/45">
                    Paste the video URL. YouTube and Vimeo links can be stored
                    here for externally hosted videos.
                  </p>

                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail — optional, no uploader forced */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
              Thumbnail URL (Optional)
            </label>

            <p className="mt-2 text-xs leading-5 text-[#0d1a17]/45">
              Leave blank to use the video&apos;s own built-in thumbnail.
            </p>

            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://... (optional)"
              className="mt-4 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
            />
          </div>

          {/* Ready indicator */}
          {effectiveUrls.length > 0 && (
            <div className="rounded-xl bg-[#0d1a17] p-5 text-[#f2e9d8]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a24b]">
                {effectiveUrls.length}{" "}
                {effectiveUrls.length === 1 ? "video" : "videos"} ready
              </p>
              <div className="mt-2 space-y-1">
                {effectiveUrls.slice(0, 5).map((u, i) => (
                  <p key={i} className="break-all text-xs text-[#f2e9d8]/60">
                    {u}
                  </p>
                ))}
                {effectiveUrls.length > 5 && (
                  <p className="text-xs text-[#f2e9d8]/40">
                    +{effectiveUrls.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-xl border border-green-700/20 bg-green-50 px-5 py-4 text-sm text-green-800">
              {success}{" "}
              <Link href="/admin/videos" className="underline">
                View videos
              </Link>
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
            disabled={loading || effectiveUrls.length === 0}
            className="w-full rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : effectiveUrls.length > 1
                ? `Create ${effectiveUrls.length} Videos`
                : "Create Video"}
          </button>
        </form>
      </div>
    </main>
  );
}