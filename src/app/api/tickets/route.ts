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
    let phone = body.phone?.trim() ?? "";
    let email = body.email?.trim().toLowerCase() || "";
    const quantity = Number(body.quantity);

    // Strict Uganda phone validation: exactly 10 digits starting with 07, no spaces allowed.
    // Only surrounding whitespace is stripped (via .trim() above).
    // Internal spaces, dashes, or any non-digit characters make the number invalid.
    const phoneValid = /^07\d{8}$/.test(phone);

    // Strict email format check
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (
      !eventId ||
      !ticketTypeId ||
      !customerName ||
      !phone ||
      !phoneValid ||
      !email ||
      !emailValid ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: !phoneValid
            ? "Please provide a valid 10-digit Uganda phone number starting with 07."
            : !email || !emailValid
            ? "A valid email address is required to receive your ticket confirmation."
            : "Please provide valid ticket and customer details.",
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
            status: "CONFIRMED",
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
          email: email || null,
          quantity,
          unitPrice: ticketType.price,
          totalAmount: ticketType.price * quantity,
          eventId: event.id,
          status: "PENDING",
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

    // Send Email 1: Payment Required (if email exists)
    if (email) {
      try {
        const { sendPaymentRequiredEmail } = await import("@/lib/email");
        await sendPaymentRequiredEmail({
          to: email,
          customerName,
          eventTitle: event.title,
          eventDate: event.date,
          ticketTypeName: ticketType.name,
          quantity,
          totalAmount: result.order.totalAmount,
          orderId: result.order.id,
        });
      } catch (err) {
        console.error("Initial payment email failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Ticket request received. Please complete your payment.",
      order: {
        id: result.order.id,
        status: result.order.status,
      },
      paymentInstructions: true,
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