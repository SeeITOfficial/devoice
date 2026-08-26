import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.type || !body.url || !body.categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Type, media URL and category are required.",
        },
        { status: 400 }
      );
    }

    if (!["IMAGE", "VIDEO"].includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid media type.",
        },
        { status: 400 }
      );
    }

    const category = await prisma.galleryCategory.findUnique({
      where: {
        id: body.categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Gallery category not found.",
        },
        { status: 404 }
      );
    }

    const item = await prisma.galleryItem.create({
      data: {
        type: body.type,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl || null,
        title: body.title || null,
        categoryId: body.categoryId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        item,
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