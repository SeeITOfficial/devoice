import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Event fetch error:", error);

    return NextResponse.json(
      { message: "Unable to load event." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: {
      title?: string;
      date?: Date;
      description?: string | null;
      posterUrl?: string | null;
      cancelled?: boolean;
    } = {};

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return NextResponse.json(
          { message: "Event title cannot be empty." },
          { status: 400 }
        );
      }

      data.title = body.title.trim();
    }

    if (body.date !== undefined) {
      const date = new Date(body.date);

      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { message: "Invalid event date." },
          { status: 400 }
        );
      }

      data.date = date;
    }

    if (body.description !== undefined) {
      data.description = body.description || null;
    }

    if (body.posterUrl !== undefined) {
      data.posterUrl = body.posterUrl || null;
    }

    if (body.cancelled !== undefined) {
      data.cancelled = Boolean(body.cancelled);
    }

    const event = await prisma.event.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Event update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update event.",
      },
      { status: 500 }
    );
  }
}
