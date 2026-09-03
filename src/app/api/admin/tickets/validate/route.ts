import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminApiRequest } from "@/lib/adminAuth";

export async function POST(request: Request) {
  try {
    const isAdmin = await validateAdminApiRequest(request);

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorised." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const code = (body.ticketCode ?? body.qrToken ?? "").trim();
    const eventId =
      typeof body.eventId === "string" ? body.eventId.trim() : "";

    if (!code) {
      return NextResponse.json(
        { message: "Provide a ticketCode or qrToken." },
        { status: 400 }
      );
    }

    // Look up by ticketCode or qrToken
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ ticketCode: code }, { qrToken: code }],
      },
      include: {
        ticketType: {
          select: { id: true, name: true, price: true, unlimited: true, quantity: true },
        },
        order: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                date: true,
                cancelled: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, result: "NOT_FOUND", message: "Ticket not found." },
        { status: 404 }
      );
    }

    if (eventId && ticket.order.event.id !== eventId) {
      return NextResponse.json(
        {
          success: false,
          result: "EVENT_MISMATCH",
          message: "This ticket does not belong to the selected event.",
          ticket: null,
        },
        { status: 409 }
      );
    }

    const isWalkIn = ticket.order.paymentMethod === "CASH";

    // Reserved / Unpaid
    if (ticket.status === "RESERVED") {
      if (!isWalkIn) {
        return NextResponse.json({
          success: false,
          result: "RESERVED",
          message: "Payment has not been confirmed for this ticket.",
          ticket: {
            id: ticket.id,
            ticketCode: ticket.ticketCode,
            status: ticket.status,
            ticketType: ticket.ticketType,
            customerName: ticket.order.customerName,
            phone: ticket.order.phone,
            email: ticket.order.email,
            event: ticket.order.event,
          },
        });
      }

      // CASH Walk-in logic: Check inventory and validate atomic
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Claim the scanned ticket before confirming the order.
          const consumedTicket = await tx.ticket.updateMany({
            where: { id: ticket.id, status: "RESERVED" },
            data: { status: "USED" },
          });

          if (consumedTicket.count === 0) {
            const error = new Error("Ticket is already used or unavailable.");
            error.name = "AlreadyConsumed";
            throw error;
          }

          if (!ticket.ticketType.unlimited && ticket.ticketType.quantity !== null) {
            const confirmedCount = await tx.ticket.count({
              where: {
                ticketTypeId: ticket.ticketType.id,
                order: { status: "CONFIRMED" },
              },
            });

            // Make sure we have inventory for the ENTIRE order since we confirm the whole order
            if (confirmedCount + ticket.order.quantity > ticket.ticketType.quantity) {
              throw new Error("SOLD_OUT");
            }
          }

          // Confirm the order
          await tx.ticketOrder.update({
            where: { id: ticket.orderId },
            data: { status: "CONFIRMED" },
          });

          // Mark all tickets in the order as VALID
          await tx.ticket.updateMany({
            where: { orderId: ticket.orderId, status: "RESERVED" },
            data: { status: "VALID" },
          });

          return true;
        });

        return NextResponse.json({
          success: true,
          result: "CHECKED_IN",
          message: "CASH / WALK-IN - ENTRY ACCEPTED",
          ticket: {
            id: ticket.id,
            ticketCode: ticket.ticketCode,
            status: "USED",
            ticketType: ticket.ticketType,
            customerName: ticket.order.customerName,
            phone: ticket.order.phone,
            email: ticket.order.email,
            event: ticket.order.event,
          },
        });
      } catch (err) {
        if (err instanceof Error && err.message === "SOLD_OUT") {
          return NextResponse.json({
            success: false,
            result: "SOLD_OUT",
            message: "Tickets are sold out. Cannot accept this walk-in.",
            ticket: null
          });
        }
        if (err instanceof Error && err.name === "AlreadyConsumed") {
          return NextResponse.json({
            success: false,
            result: "ALREADY_USED",
            message: "This ticket was already used or is no longer available.",
            ticket: null,
          });
        }
        throw err;
      }
    }

    // Already consumed
    if (ticket.status === "USED") {
      return NextResponse.json({
        success: false,
        result: "ALREADY_USED",
        message: "This ticket has already been used.",
        ticket: {
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          status: ticket.status,
          ticketType: ticket.ticketType,
          customerName: ticket.order.customerName,
          phone: ticket.order.phone,
          email: ticket.order.email,
          event: ticket.order.event,
        },
      });
    }

    // Invalidated
    if (ticket.status === "INVALID") {
      return NextResponse.json({
        success: false,
        result: "INVALID",
        message: "This ticket is invalid.",
        ticket: {
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          status: ticket.status,
          ticketType: ticket.ticketType,
          customerName: ticket.order.customerName,
          phone: ticket.order.phone,
          email: ticket.order.email,
          event: ticket.order.event,
        },
      });
    }

    // VALID — attempt atomic VALID → USED transition
    const updated = await prisma.ticket.updateMany({
      where: {
        id: ticket.id,
        status: "VALID",
      },
      data: { status: "USED" },
    });

    if (updated.count === 0) {
      return NextResponse.json({
        success: false,
        result: "ALREADY_USED",
        message: "This ticket was just used by another check-in attempt.",
        ticket: {
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          status: "USED",
          ticketType: ticket.ticketType,
          customerName: ticket.order.customerName,
          phone: ticket.order.phone,
          email: ticket.order.email,
          event: ticket.order.event,
        },
      });
    }

    return NextResponse.json({
      success: true,
      result: "CHECKED_IN",
      message: isWalkIn ? "CASH / WALK-IN - ENTRY ACCEPTED" : "ONLINE / PAID - ENTRY ACCEPTED",
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        status: "USED",
        ticketType: ticket.ticketType,
        customerName: ticket.order.customerName,
        phone: ticket.order.phone,
        email: ticket.order.email,
        event: ticket.order.event,
      },
    });
  } catch (error) {
    console.error("Ticket validation error:", error);
    return NextResponse.json(
      { message: "Unable to validate ticket." },
      { status: 500 }
    );
  }
}
