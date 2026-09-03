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
    
    const validAudioUrl = validateMediaUrl(body.audioUrl, "any");
    const validArtworkUrl = body.artworkUrl ? validateMediaUrl(body.artworkUrl, "image") : null;

    if (
      !body.title ||
      !validAudioUrl ||
      !body.releaseDate ||
      !body.albumId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, valid audio URL, release date and album are required. Artwork URL must be valid if provided.",
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
        audioUrl: validAudioUrl,
        artworkUrl: validArtworkUrl,
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