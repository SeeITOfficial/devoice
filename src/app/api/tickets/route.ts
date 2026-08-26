import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

type TicketRequest = {
  eventId?: string;
  ticketTypeId?: string;
  quantity?: number;
  customerName?: string;
  phone?: string;
  email?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TicketRequest;

    const eventId = body.eventId?.trim();
    const ticketTypeId = body.ticketTypeId?.trim();
    const customerName = body.customerName?.trim();
    const phone = body.phone?.trim();
    const email = body.email?.trim() || null;
    const quantity = Number(body.quantity);

    if (
      !eventId ||
      !ticketTypeId ||
      !customerName ||
      !phone ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide valid ticket and customer details.",
        },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        ticketTypes: {
          where: {
            id: ticketTypeId,
          },
        },
      },
    });

    if (!event || event.cancelled) {
      return NextResponse.json(
        {
          success: false,
          message: "This event is no longer available.",
        },
        { status: 404 }
      );
    }

    if (event.date < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Tickets are no longer available for this event.",
        },
        { status: 400 }
      );
    }

    const ticketType = event.ticketTypes[0];

    if (!ticketType) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected ticket type does not exist.",
        },
        { status: 404 }
      );
    }

    /*
     * SQLite does not give us a convenient atomic inventory
     * operation through Prisma here, so calculate sold tickets
     * inside the transaction and create the order/tickets together.
     */
    const result = await prisma.$transaction(async (tx) => {
      const soldTickets = await tx.ticket.count({
        where: {
          ticketTypeId: ticketType.id,
          order: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        },
      });

      if (
        !ticketType.unlimited &&
        ticketType.quantity !== null &&
        soldTickets + quantity > ticketType.quantity
      ) {
        throw new Error(
          `Only ${
            ticketType.quantity - soldTickets
          } tickets are available.`
        );
      }

      const order = await tx.ticketOrder.create({
        data: {
          customerName,
          phone,
          email,
          quantity,
          eventId: event.id,
          status: "CONFIRMED",
        },
      });

      const tickets = [];

      for (let index = 0; index < quantity; index++) {
        const ticket = await tx.ticket.create({
          data: {
            ticketCode: `DV-${randomUUID()
              .replace(/-/g, "")
              .slice(0, 10)
              .toUpperCase()}`,
            qrToken: randomUUID(),
            orderId: order.id,
            ticketTypeId: ticketType.id,
          },
        });

        tickets.push(ticket);
      }

      return {
        order,
        tickets,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Tickets booked successfully.",
      order: {
        id: result.order.id,
        customerName: result.order.customerName,
        quantity: result.order.quantity,
        status: result.order.status,
      },
      tickets: result.tickets.map((ticket) => ({
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        qrToken: ticket.qrToken,
      })),
    });
  } catch (error) {
    console.error("Ticket creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create tickets.",
      },
      { status: 500 }
    );
  }
}