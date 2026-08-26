import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.galleryCategory.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Gallery categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load categories.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.galleryCategory.findUnique({
      where: {
        name,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "That category already exists.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.galleryCategory.create({
      data: {
        name,
      },
    });

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gallery category creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create category.",
      },
      { status: 500 }
    );
  }
}