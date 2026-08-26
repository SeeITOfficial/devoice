import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.artworkUrl || !body.releaseDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, artwork and release date are required.",
        },
        { status: 400 }
      );
    }

    const album = await prisma.album.create({
      data: {
        title: body.title,
        artworkUrl: body.artworkUrl,
        releaseDate: new Date(body.releaseDate),
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