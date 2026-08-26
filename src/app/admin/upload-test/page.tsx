"use client";

import { useState } from "react";

export default function UploadTestPage() {
  const [status, setStatus] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  async function handleFile(file: File) {
    try {
      setUploadedUrl("");
      setStatus(`Preparing ${file.name}...`);

      const mediaType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("audio/")
          ? "audio"
          : file.type.startsWith("video/")
            ? "video"
            : null;

      if (!mediaType) {
        setStatus("Unsupported file type.");
        return;
      }

      // 1. Ask our server for a signed R2 upload URL
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          mediaType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus(result.message || "Could not prepare upload.");
        return;
      }

      // 2. Upload the actual file directly to R2
      setStatus(`Uploading ${file.name}...`);

      const uploadResponse = await fetch(result.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        setStatus(
          `R2 upload failed: ${uploadResponse.status}`
        );
        return;
      }

      // 3. Done
      setUploadedUrl(result.publicUrl);
      setStatus("Upload complete.");
    } catch (error) {
      console.error(error);
      setStatus("Upload failed.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
          Media Management
        </p>

        <h1 className="mt-4 font-serif text-6xl">
          Upload Test
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-7 text-[#0d1a17]/55">
          Choose an image, audio file or video directly from your
          device.
        </p>

        {/* File picker */}
        <label
          htmlFor="media"
          className="mt-12 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#0d1a17]/20 bg-white/40 px-6 text-center transition-colors hover:border-[#c9a24b] hover:bg-white/60"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0d1a17] text-2xl text-[#f2e9d8]">
            ↑
          </div>

          <p className="mt-6 font-serif text-2xl">
            Choose media
          </p>

          <p className="mt-2 text-xs text-[#0d1a17]/45">
            Images · Audio · Video
          </p>

          <span className="mt-6 rounded-full bg-[#0d1a17] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f2e9d8]">
            Browse Device
          </span>

          <input
            id="media"
            type="file"
            accept="image/*,audio/*,video/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                handleFile(file);
              }
            }}
          />
        </label>

        {/* Status */}
        {status && (
          <div className="mt-8 rounded-2xl border border-[#0d1a17]/10 bg-white/50 p-6">
            <p className="text-sm">
              {status}
            </p>
          </div>
        )}

        {/* Uploaded URL */}
        {uploadedUrl && (
          <div className="mt-5 rounded-2xl bg-[#0d1a17] p-6 text-[#f2e9d8]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a24b]">
              Uploaded successfully
            </p>

            <a
              href={uploadedUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block break-all text-sm underline"
            >
              {uploadedUrl}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}