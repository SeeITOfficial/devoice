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

    if (!["IMAGE", "VIDEO"].includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid media type.",
        },
        { status: 400 }
      );
    }

    const urls = Array.isArray(body.urls) ? body.urls : [body.url].filter(Boolean);
    
    if (urls.length === 0 || !body.type) {
      return NextResponse.json(
        {
          success: false,
          message: "Type and at least one valid media URL are required.",
        },
        { status: 400 }
      );
    }

    const validThumbnail = body.thumbnailUrl ? validateMediaUrl(body.thumbnailUrl, "image") : null;
    if (body.thumbnailUrl && !validThumbnail) {
      return NextResponse.json({ success: false, message: "Invalid thumbnail URL (must be R2 hosted)." }, { status: 400 });
    }

    if (body.categoryId) {
      const category = await prisma.galleryCategory.findUnique({
        where: { id: body.categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { success: false, message: "Gallery category not found." },
          { status: 404 }
        );
      }
    }

    const createdItems = [];
    for (const rawUrl of urls) {
      const validUrl = validateMediaUrl(rawUrl, body.type === "IMAGE" ? "image" : "any");
      if (validUrl) {
        const item = await prisma.galleryItem.create({
          data: {
            type: body.type,
            url: validUrl,
            thumbnailUrl: validThumbnail,
            title: body.title || null,
            categoryId: body.categoryId || null,
          },
        });
        createdItems.push(item);
      }
    }

    return NextResponse.json(
      {
        success: true,
        items: createdItems,
        item: createdItems[0], // for backwards compatibility
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gallery item creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add gallery media.",
      },
      { status: 500 }
    );
  }
}