import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

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

    if (!allowedTypes.includes(contentType)) {
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

    if (size > maxSize) {
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

    const extension =
      fileName.includes(".")
        ? fileName.split(".").pop()?.toLowerCase()
        : "bin";

    const safeName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");

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
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 60 * 10,
    });

    const publicUrl =
      `${process.env.R2_PUBLIC_URL}/${key}`;

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