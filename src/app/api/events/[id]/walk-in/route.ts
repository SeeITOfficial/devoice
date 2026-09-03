import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

type WalkInRequest = {
  eventId?: string;
  ticketTypeId?: string;
  quantity?: number;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = (await request.json()) as WalkInRequest;
    
    const { id: eventId } = await params;
    const ticketTypeId = body.ticketTypeId?.trim();
    const quantity = Number(body.quantity);

    if (
      !eventId ||
      !ticketTypeId ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid ticket type and quantity.",
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

    // A Walk-in generation does not consume inventory yet, so no strict check is performed here.
    // However, we could do a soft check to provide better UX if already sold out.
    if (!ticketType.unlimited && ticketType.quantity !== null) {
      const soldTickets = await prisma.ticket.count({
        where: {
          ticketTypeId: ticketType.id,
          order: {
            status: "CONFIRMED",
          },
        },
      });

      if (soldTickets + quantity > ticketType.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: "Not enough tickets are available for this quantity.",
          },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create a PENDING order with CASH payment method
      const order = await tx.ticketOrder.create({
        data: {
          customerName: "Walk-in",
          phone: "WALK-IN",
          email: null,
          quantity,
          unitPrice: ticketType.price,
          totalAmount: ticketType.price * quantity,
          eventId: event.id,
          status: "PENDING",
          paymentMethod: "CASH",
        },
      });

      const tickets = [];

      for (let index = 0; index < quantity; index++) {
        const ticket = await tx.ticket.create({
          data: {
            ticketCode: `DV-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`,
            qrToken: randomUUID(),
            orderId: order.id,
            ticketTypeId: ticketType.id,
            status: "RESERVED",
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
      message: "Walk-in ticket generated.",
      order: {
        id: result.order.id,
        quantity: result.order.quantity,
        status: result.order.status,
      },
      // Pass back the details needed to show the QR code
      ticketData: {
        ticketType: ticketType.name,
        price: ticketType.price,
        quantity: quantity,
        total: ticketType.price * quantity,
        // Using the order's first ticket's qrToken for the order summary QR.
        // Wait, does the walk-in UX want one QR per ticket, or one QR for the order?
        // The prompt says: "The admin is effectively confirming payment and entry together. After successful validation: ticket/order becomes confirmed/entered, ticket becomes USED." 
        // We will show a QR for each ticket in the UI.
      },
      tickets: result.tickets.map((ticket) => ({
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        qrToken: ticket.qrToken,
      })),
    });
  } catch (error) {
    console.error("Walk-in ticket generation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to generate ticket.",
      },
      { status: 500 }
    );
  }
}
