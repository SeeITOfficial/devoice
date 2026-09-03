import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminApiRequest } from "@/lib/adminAuth";
import { validateMediaUrl } from "@/lib/urlValidator";

export async function POST(request: Request) {
  if (!await validateAdminApiRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const body = await request.json();

    const validThumbnailUrl = body.thumbnailUrl ? validateMediaUrl(body.thumbnailUrl, "image") : null;
    const validVideoUrl = validateMediaUrl(body.videoUrl, "any");

    if (
      !validVideoUrl ||
      !body.source
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Source and valid video URL are required.",
        },
        { status: 400 }
      );
    }

    if (body.thumbnailUrl && !validThumbnailUrl) {
      return NextResponse.json({ success: false, message: "Invalid thumbnail URL (must be R2 hosted)." }, { status: 400 });
    }

    if (!["UPLOAD", "EXTERNAL"].includes(body.source)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid video source.",
        },
        { status: 400 }
      );
    }

    const video = await prisma.video.create({
      data: {
        title: body.title?.trim() || null,
        thumbnailUrl: validThumbnailUrl,
        source: body.source,
        videoUrl: validVideoUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        video,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Video creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create video.",
      },
      { status: 500 }
    );
  }
}