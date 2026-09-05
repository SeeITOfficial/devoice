"use client";

import { useRef, useState } from "react";

type MediaType = "image" | "audio" | "video";

type MultipleMediaUploaderProps = {
  mediaType: MediaType;
  onUploadComplete: (urls: string[]) => void;
  accept?: string;
  label?: string;
};

const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.82;

export default function MultipleMediaUploader({
  mediaType,
  onUploadComplete,
  accept,
  label = "Choose files",
}: MultipleMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  async function optimizeImage(file: File): Promise<File> {
    const imageUrl = URL.createObjectURL(file);

    try {
      const image = new Image();

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("Could not read image."));
        image.src = imageUrl;
      });

      let width = image.naturalWidth;
      let height = image.naturalHeight;

      const largestDimension = Math.max(width, height);

      if (largestDimension > MAX_IMAGE_DIMENSION) {
        const scale =
          MAX_IMAGE_DIMENSION / largestDimension;

        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not create image processor.");
      }

      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(
          resolve,
          "image/webp",
          IMAGE_QUALITY
        )
      );

      if (!blob) {
        throw new Error("Could not convert image.");
      }

      const baseName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-");

      return new File(
        [blob],
        `${baseName}.webp`,
        {
          type: "image/webp",
        }
      );
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  async function uploadFile(originalFile: File): Promise<string> {
    let file = originalFile;

    if (mediaType === "image") {
      try {
        file = await optimizeImage(originalFile);
      } catch {
        file = originalFile;
      }
    }

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
      throw new Error(result.message || "Could not prepare upload.");
    }

    const uploadResponse = await fetch(result.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed (${uploadResponse.status}).`);
    }

    return result.publicUrl;
  }

  async function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      
      const fileArray = Array.from(files);
      setStatus(`Uploading ${fileArray.length} file(s)...`);

      if (mediaType === "image") {
        const localUrls = fileArray.map(f => URL.createObjectURL(f));
        setPreviews(localUrls);
      }

      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < fileArray.length; i++) {
        setStatus(`Uploading file ${i + 1} of ${fileArray.length}...`);
        const url = await uploadFile(fileArray[i]);
        uploadedUrls.push(url);
      }

      onUploadComplete(uploadedUrls);
      setStatus("Upload complete.");
    } catch (error) {
      console.error("Media upload error:", error);
      setStatus(
        error instanceof Error
          ? error.message
          : "Upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={
          accept ??
          (mediaType === "image"
            ? "image/*"
            : mediaType === "audio"
              ? "audio/*"
              : "video/*")
        }
        onChange={handleChange}
        className="hidden"
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[#0d1a17]/20 bg-white/40 px-6 text-center transition-colors hover:border-[#c9a24b] hover:bg-white/60 disabled:cursor-wait disabled:opacity-60"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0d1a17] text-xl text-[#f2e9d8]">
          {uploading ? "..." : "+"}
        </div>

        <p className="mt-5 font-serif text-xl">
          {uploading ? "Uploading..." : label}
        </p>

        <p className="mt-2 text-xs text-[#0d1a17]/45">
          {mediaType === "image"
            ? "JPG / PNG / WebP / HEIC"
            : mediaType === "audio"
              ? "MP3 / M4A / WAV / AAC / OGG"
              : "MP4 / WebM / MOV"}
        </p>
      </button>

      {status && (
        <p className="text-xs text-[#0d1a17]/55">
          {status}
        </p>
      )}

      {previews.length > 0 && mediaType === "image" && (
        <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-[1.5rem] bg-[#16241f] p-4">
          {previews.map((preview, i) => (
            <img
              key={i}
              src={preview}
              alt="Selected media preview"
              className="h-32 w-full object-cover rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
}