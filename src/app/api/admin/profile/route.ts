import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profile = await prisma.artistProfile.findFirst();

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load artist profile.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Artist name is required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.artistProfile.findFirst();

    const data = {
      name: body.name.trim(),
      tagline: body.tagline?.trim() || null,
      bio: body.bio?.trim() || null,
      heroImage: body.heroImage?.trim() || null,
      heroVideo: body.heroVideo?.trim() || null,
    };

    const profile = existing
      ? await prisma.artistProfile.update({
          where: {
            id: existing.id,
          },
          data,
        })
      : await prisma.artistProfile.create({
          data,
        });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update artist profile.",
      },
      { status: 500 }
    );
  }
}