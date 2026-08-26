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

    const ticketTypes = Array.isArray(body.ticketTypes)
      ? body.ticketTypes
      : [];

    for (const ticket of ticketTypes) {
      if (!ticket.name?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Every ticket type needs a name.",
          },
          { status: 400 }
        );
      }

      const price = Number(ticket.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid price for ticket "${ticket.name}".`,
          },
          { status: 400 }
        );
      }

      if (!ticket.unlimited) {
        const quantity = Number(ticket.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid quantity for ticket "${ticket.name}".`,
            },
            { status: 400 }
          );
        }
      }
    }

    const event = await prisma.event.create({
      data: {
        title: body.title.trim(),
        date: new Date(body.date),
        description: body.description?.trim() || null,
        posterUrl: body.posterUrl?.trim() || null,

        ticketTypes: {
          create: ticketTypes.map(
            (ticket: {
              name: string;
              price: string | number;
              quantity: string | number;
              unlimited: boolean;
            }) => ({
              name: ticket.name.trim(),
              price: Number(ticket.price),
              quantity: ticket.unlimited
                ? null
                : Number(ticket.quantity),
              unlimited: Boolean(ticket.unlimited),
            })
          ),
        },
      },

      include: {
        ticketTypes: true,
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