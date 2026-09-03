import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { validateAdminApiRequest } from "@/lib/adminAuth";
import { getServerConfig } from "@/lib/config";

const ALLOWED_TYPES = {
  image: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ],
  audio: [
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/x-wav",
    "audio/aac",
    "audio/ogg",
    "audio/webm",
  ],
  video: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
} as const;

const MAX_SIZE = {
  image: 15 * 1024 * 1024,
  audio: 100 * 1024 * 1024,
  video: 500 * 1024 * 1024,
};

export async function POST(request: Request) {
  if (!await validateAdminApiRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const body = await request.json();

    const {
      fileName,
      contentType,
      size,
      mediaType,
    } = body;

    if (!fileName || !contentType || !size || !mediaType) {
      return NextResponse.json(
        {
          success: false,
          message:
            "fileName, contentType, size and mediaType are required.",
        },
        { status: 400 }
      );
    }

    // Validate size is a positive integer
    const sizeNum = typeof size === "number" ? size : NaN;
    if (!Number.isFinite(sizeNum) || sizeNum <= 0) {
      return NextResponse.json(
        { success: false, message: "size must be a positive number." },
        { status: 400 }
      );
    }

    if (!["image", "audio", "video"].includes(mediaType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid media type.",
        },
        { status: 400 }
      );
    }

    const allowedTypes =
      ALLOWED_TYPES[mediaType as keyof typeof ALLOWED_TYPES];

    if (!allowedTypes.includes(contentType as never)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported ${mediaType} format.`,
        },
        { status: 400 }
      );
    }

    const maxSize =
      MAX_SIZE[mediaType as keyof typeof MAX_SIZE];

    if (sizeNum > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: `File is too large. Maximum size is ${Math.round(
            maxSize / 1024 / 1024
          )}MB.`,
        },
        { status: 400 }
      );
    }

    // Sanitize filename: keep only safe characters, strip leading dots from each segment
    const rawBaseName = String(fileName)
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .split(".")
      .map((seg) => seg.replace(/^\.+/, "") || "x")
      .join(".");

    const extension = rawBaseName.includes(".")
      ? rawBaseName.split(".").pop()?.toLowerCase() ?? "bin"
      : "bin";

    const safeName = rawBaseName;

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const folder =
      mediaType === "image"
        ? "images"
        : mediaType === "audio"
          ? "audio"
          : "videos";

    const key = `${folder}/${uniqueName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: sizeNum,
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 60 * 10,
    });

    const publicUrl = `${getServerConfig().r2PublicUrl}/${key}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
      contentType,
      extension,
    });
  } catch (error) {
    console.error("R2 upload URL error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create upload URL.",
      },
      { status: 500 }
    );
  }
}