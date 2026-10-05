import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone || !body.date || !body.location) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, phone, date and location are required.",
        },
        { status: 400 }
      );
    }

    let service = await prisma.bookingService.findFirst({
      where: {
        active: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    if (!service) {
      service = await prisma.bookingService.create({
        data: {
          name: "Live Performance",
          active: true,
          sortOrder: 1,
        },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        eventDate: new Date(body.date),
        location: body.location,
        details: [
          body.eventType ? `Event type: ${body.eventType}` : "",
          body.guestSize ? `Expected attendance: ${body.guestSize}` : "",
          body.message ? `Message: ${body.message}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        serviceId: service.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: booking.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit booking.",
      },
      { status: 500 }
    );
  }
}