import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        ticketTypes: {
          orderBy: {
            price: "asc",
          },
        },
      },
    });

    if (!event || event.cancelled) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found.",
        },
        { status: 404 }
      );
    }

    if (event.date < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "This event has already taken place.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
        ticketTypes: event.ticketTypes.map((ticket) => ({
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          quantity: ticket.quantity,
          unlimited: ticket.unlimited,
        })),
      },
    });
  } catch (error) {
    console.error("Event API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load event.",
      },
      { status: 500 }
    );
  }
}