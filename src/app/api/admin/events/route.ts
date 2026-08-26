import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.date) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and date are required.",
        },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title: body.title,
        date: new Date(body.date),
        description: body.description || null,
        posterUrl: body.posterUrl || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Event creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create event.",
      },
      { status: 500 }
    );
  }
}