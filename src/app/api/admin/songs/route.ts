import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.title ||
      !body.audioUrl ||
      !body.releaseDate ||
      !body.albumId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, audio, release date and album are required.",
        },
        { status: 400 }
      );
    }

    const album = await prisma.album.findUnique({
      where: {
        id: body.albumId,
      },
    });

    if (!album) {
      return NextResponse.json(
        {
          success: false,
          message: "Album not found.",
        },
        { status: 404 }
      );
    }

    const song = await prisma.song.create({
      data: {
        title: body.title,
        audioUrl: body.audioUrl,
        artworkUrl: body.artworkUrl || null,
        releaseDate: new Date(body.releaseDate),
        published: Boolean(body.published),
        albumId: body.albumId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        song,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Song creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create song.",
      },
      { status: 500 }
    );
  }
}