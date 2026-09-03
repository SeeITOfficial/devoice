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

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const posterUrl = body.posterUrl
        ? validateMediaUrl(body.posterUrl, "image")
        : null;

    if (body.posterUrl && !posterUrl) {
      return NextResponse.json({ success: false, message: "Invalid poster URL (must be R2 hosted)." }, { status: 400 });
    }

    const date =
      typeof body.date === "string"
        ? new Date(body.date)
        : null;

    if (!title || !body.date) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and date are required.",
        },
        { status: 400 }
      );
    }

    if (!date || Number.isNaN(date.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event date.",
        },
        { status: 400 }
      );
    }

    if (date <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Event date must be in the future.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.ticketTypes) || body.ticketTypes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one ticket type is required.",
        },
        { status: 400 }
      );
    }

    const ticketTypes = [];

    for (const ticket of body.ticketTypes) {
      if (!ticket || typeof ticket !== "object" || Array.isArray(ticket)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid ticket type data.",
          },
          { status: 400 }
        );
      }

      const name = typeof ticket.name === "string" ? ticket.name.trim() : "";
      const price = Number(ticket.price);
      const unlimited = ticket.unlimited;
      const quantity = Number(ticket.quantity);

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Ticket name cannot be empty.",
          },
          { status: 400 }
        );
      }

      if (
        ticket.price === "" ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Ticket price must be a valid non-negative number.",
          },
          { status: 400 }
        );
      }

      if (typeof unlimited !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message: "Ticket unlimited setting must be a boolean.",
          },
          { status: 400 }
        );
      }

      if (
        !unlimited &&
        (ticket.quantity === "" ||
          !Number.isInteger(quantity) ||
          quantity < 1)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Ticket quantity must be a valid positive integer for finite tickets.",
          },
          { status: 400 }
        );
      }

      ticketTypes.push({
        name,
        price,
        quantity: unlimited ? null : quantity,
        unlimited,
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        date,
        description: description || null,
        posterUrl: posterUrl || null,
        ticketTypes: {
          create: ticketTypes,
        },
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