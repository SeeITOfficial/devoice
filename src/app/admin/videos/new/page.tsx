"use client";

import { useState } from "react";
import Link from "next/link";
import MediaUploader from "@/components/admin/MediaUploader";

type VideoMode = "UPLOAD" | "EXTERNAL";

export default function NewVideoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [videoMode, setVideoMode] =
    useState<VideoMode>("UPLOAD");

  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!videoUrl.trim()) {
      setError(
        "Please upload a video or provide an external video URL."
      );
      setLoading(false);
      return;
    }

    if (!thumbnailUrl.trim()) {
      setError("Please add a video thumbnail.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          thumbnailUrl: thumbnailUrl.trim(),
          source: videoMode,
          videoUrl: videoUrl.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to create video."
        );
      }

      window.location.href = "/admin/videos";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create video."
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

        <h1 className="mt-4 font-serif text-6xl leading-none">
          New Video
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
          Add an uploaded performance, music video, interview
          or external video.
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
              Video title
            </label>

            <input
              id="title"
              name="title"
              required
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
                  setVideoUrl("");
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
                  setVideoUrl("");
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
                <MediaUploader
                  mediaType="video"
                  onUploadComplete={(url) => {
                    setVideoUrl(url);
                  }}
                  label="Choose video from device"
                  accept="video/mp4,video/webm,video/quicktime"
                />
              ) : (
                <div>
                  <p className="mb-3 text-xs leading-5 text-[#0d1a17]/45">
                    Paste the video URL. YouTube and Vimeo
                    links can be stored here for externally
                    hosted videos.
                  </p>

                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(event) =>
                      setVideoUrl(event.target.value)
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40">
              Thumbnail
            </label>

            <p className="mt-2 text-xs leading-5 text-[#0d1a17]/45">
              Upload a lightweight image that will appear
              before the video loads.
            </p>

            <div className="mt-5">
              <MediaUploader
                mediaType="image"
                onUploadComplete={(url) => {
                  setThumbnailUrl(url);
                }}
                label="Choose thumbnail from device"
                accept="image/*"
              />
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[#0d1a17]/35">
                Or use thumbnail URL
              </p>

              <input
                type="url"
                value={thumbnailUrl}
                onChange={(event) =>
                  setThumbnailUrl(event.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
              />
            </div>
          </div>

          {/* Video ready */}
          {videoUrl && (
            <div className="rounded-xl bg-[#0d1a17] p-5 text-[#f2e9d8]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a24b]">
                Video ready
              </p>

              <p className="mt-2 break-all text-xs text-[#f2e9d8]/60">
                {videoUrl}
              </p>
            </div>
          )}

          {/* Thumbnail ready */}
          {thumbnailUrl && (
            <div className="rounded-xl border border-[#0d1a17]/10 bg-white/50 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#b18a3b]">
                Thumbnail ready
              </p>

              <p className="mt-2 break-all text-xs text-[#0d1a17]/45">
                {thumbnailUrl}
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
            disabled={
              loading ||
              !videoUrl ||
              !thumbnailUrl
            }
            className="w-full rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Video..." : "Create Video"}
          </button>
        </form>
      </div>
    </main>
  );
}