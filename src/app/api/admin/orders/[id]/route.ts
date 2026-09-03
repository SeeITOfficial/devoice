import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateAdminApiRequest } from "@/lib/adminAuth";


export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await validateAdminApiRequest(request);

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorised." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.action || !["CONFIRM_PAYMENT", "REJECT"].includes(body.action)) {
      return NextResponse.json(
        { message: "Invalid action." },
        { status: 400 }
      );
    }

    const order = await prisma.ticketOrder.findUnique({
      where: { id },
      include: {
        tickets: {
          include: {
            ticketType: { select: { id: true, name: true, price: true } },
          },
        },
        event: { select: { id: true, title: true, date: true } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { message: `Order is already ${order.status}.` },
        { status: 400 }
      );
    }

    if (body.action === "REJECT") {
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const transition = await tx.ticketOrder.updateMany({
          where: { id, status: "PENDING" },
          data: { status: "REJECTED" },
        });

        if (transition.count === 0) {
          const error = new Error("Order is no longer pending.");
          error.name = "OrderStateError";
          throw error;
        }

        await tx.ticket.updateMany({
          where: { orderId: id },
          data: { status: "INVALID" },
        });

        return tx.ticketOrder.findUniqueOrThrow({ where: { id } });
      });

      return NextResponse.json({ success: true, order: updatedOrder });
    }

    // ── CONFIRM_PAYMENT ──────────────────────────────────────────────────────

    const ticketTypeId = order.tickets[0]?.ticketTypeId;

    if (!ticketTypeId) {
      return NextResponse.json(
        { message: "Order has no tickets." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Lock the TicketType row for the duration of this transaction.
      // Under PostgreSQL Read Committed isolation this is the minimum required
      // change to prevent TOCTOU overselling: concurrent confirmation requests
      // for the same ticket type will queue on this row lock, and each will
      // re-read the accurate post-commit count before deciding whether to proceed.
      const [ticketType] = await tx.$queryRaw<
        Array<{
          id: string;
          unlimited: boolean;
          quantity: number | null;
        }>
      >(
        Prisma.sql`SELECT id, unlimited, quantity FROM "TicketType" WHERE id = ${ticketTypeId} FOR UPDATE`
      );

      if (!ticketType) {
        throw new Error("Ticket type not found.");
      }

      if (!ticketType.unlimited && ticketType.quantity !== null) {
        const confirmedTicketsCount = await tx.ticket.count({
          where: {
            ticketTypeId,
            order: { status: "CONFIRMED" },
          },
        });

        if (confirmedTicketsCount + order.quantity > ticketType.quantity) {
          const error = new Error("SOLD_OUT");
          error.name = "InventoryError";
          throw error;
        }
      }

      const transition = await tx.ticketOrder.updateMany({
        where: { id, status: "PENDING" },
        data: { status: "CONFIRMED" },
      });

      if (transition.count === 0) {
        const error = new Error("Order is no longer pending.");
        error.name = "OrderStateError";
        throw error;
      }

      await tx.ticket.updateMany({
        where: { orderId: id, status: "RESERVED" },
        data: { status: "VALID" },
      });

      return tx.ticketOrder.findUniqueOrThrow({ where: { id } });
    });

    // ── Send confirmation email (after transaction succeeds) ─────────────────
    // Payment is already confirmed — email failure must NOT roll it back.

    let emailSent = false;
    let emailError: string | undefined;

    if (order.email) {
      try {
        const { sendPaymentConfirmedEmail } = await import("@/lib/email");
        
        const emailResult = await sendPaymentConfirmedEmail({
          to: order.email,
          customerName: order.customerName,
          eventTitle: order.event.title,
          eventDate: order.event.date,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          tickets: order.tickets.map((t) => ({
            ticketCode: t.ticketCode,
            qrToken: t.qrToken,
            ticketTypeName: t.ticketType.name,
          })),
        });

        emailSent = emailResult.ok;
        emailError = emailResult.error;
      } catch (err) {
        emailError = err instanceof Error ? err.message : "Email build failed";
        console.error("[order confirm] email build error:", emailError);
      }
    } else {
      emailError = "No email address on file for this order.";
    }

    return NextResponse.json({
      success: true,
      order: result,
      emailSent,
      emailError: emailSent ? undefined : emailError,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "InventoryError") {
      return NextResponse.json(
        {
          success: false,
          result: "SOLD_OUT",
          message:
            "Sold out — another confirmed payment took the remaining tickets.",
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === "OrderStateError") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    console.error("Admin order confirmation error:", error);
    return NextResponse.json(
      { message: "Unable to process order." },
      { status: 500 }
    );
  }
}
