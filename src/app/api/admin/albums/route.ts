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

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const releaseDate = body.releaseDate ? new Date(body.releaseDate) : null;
    const validArtworkUrl = validateMediaUrl(body.artworkUrl, "image");

    if (!title || !validArtworkUrl || !body.releaseDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, valid artwork URL from uploads, and release date are required.",
        },
        { status: 400 }
      );
    }

    if (isNaN(releaseDate?.getTime() ?? NaN)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid release date format.",
        },
        { status: 400 }
      );
    }

    const album = await prisma.album.create({
      data: {
        title: title,
        artworkUrl: validArtworkUrl,
        releaseDate: releaseDate as Date,
        published: Boolean(body.published),
      },
    });

    return NextResponse.json(
      {
        success: true,
        album,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Album creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create album.",
      },
      { status: 500 }
    );
  }
}