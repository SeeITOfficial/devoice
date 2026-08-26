import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (typeof body.read !== "boolean") {
      return NextResponse.json(
        {
          message: "Read status must be a boolean.",
        },
        { status: 400 }
      );
    }

    const message = await prisma.contactMessage.update({
      where: {
        id,
      },
      data: {
        read: body.read,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Message update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update message.",
      },
      { status: 500 }
    );
  }
}