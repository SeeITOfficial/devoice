import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminApiRequest } from "@/lib/adminAuth";
import { validateMediaUrl } from "@/lib/urlValidator";

export async function GET(request: Request) {
  if (!await validateAdminApiRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
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
  if (!await validateAdminApiRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
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

    const validHeroImage = body.heroImage ? validateMediaUrl(body.heroImage, "image") : null;
    const validHeroVideo = body.heroVideo ? validateMediaUrl(body.heroVideo, "any") : null;

    if (body.heroImage && !validHeroImage) {
      return NextResponse.json({ success: false, message: "Invalid hero image URL (must be R2 hosted)." }, { status: 400 });
    }

    const existing = await prisma.artistProfile.findFirst();

    const data = {
      name: body.name.trim(),
      tagline: body.tagline?.trim() || null,
      bio: body.bio?.trim() || null,
      heroImage: validHeroImage,
      heroVideo: validHeroVideo,
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