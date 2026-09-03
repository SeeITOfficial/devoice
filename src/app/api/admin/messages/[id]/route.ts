import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminApiRequest } from "@/lib/adminAuth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await validateAdminApiRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
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