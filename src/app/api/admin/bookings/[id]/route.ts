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

    if (!body.status) {
      return NextResponse.json(
        { message: "Status is required." },
        { status: 400 }
      );
    }

    if (!["PENDING", "CONFIRMED"].includes(body.status)) {
      return NextResponse.json(
        { message: "Invalid booking status." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Booking update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update booking.",
      },
      { status: 500 }
    );
  }
}