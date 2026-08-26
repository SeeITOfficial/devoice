import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.title ||
      !body.thumbnailUrl ||
      !body.videoUrl ||
      !body.source
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, thumbnail, source and video URL are required.",
        },
        { status: 400 }
      );
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
        title: body.title.trim(),
        thumbnailUrl: body.thumbnailUrl.trim(),
        source: body.source,
        videoUrl: body.videoUrl.trim(),
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