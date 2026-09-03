import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/app/api/ticket/verify-code/route";

/**
 * GET /api/ticket/orders
 *
 * Returns all ticket orders for the verified phone number.
 * Requires a valid ticket_session cookie.
 *
 * Returns CONFIRMED and PENDING orders (not REJECTED).
 * Only CONFIRMED order tickets expose the qrToken.
 */

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ticket_session")?.value ?? "";

    const session = verifySession(token);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session expired. Please verify again." },
        { status: 401 }
      );
    }

    const orders = await prisma.ticketOrder.findMany({
      where: {
        phone: session.phone,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        event: {
          select: { id: true, title: true, date: true },
        },
        tickets: {
          include: {
            ticketType: {
              select: { id: true, name: true, price: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // For PENDING orders, strip qrToken from tickets (payment not confirmed)
    const sanitized = orders.map((order) => ({
      id: order.id,
      status: order.status,
      quantity: order.quantity,
      customerName: order.customerName,
      createdAt: order.createdAt.toISOString(),
      event: {
        id: order.event.id,
        title: order.event.title,
        date: order.event.date.toISOString(),
      },
      tickets: order.tickets.map((t) => ({
        id: t.id,
        ticketCode: t.ticketCode,
        // Only expose qrToken for confirmed, valid/used tickets
        qrToken:
          order.status === "CONFIRMED" && t.status !== "INVALID"
            ? t.qrToken
            : null,
        status: t.status,
        ticketType: t.ticketType,
      })),
    }));

    return NextResponse.json({ success: true, orders: sanitized });
  } catch (error) {
    console.error("[ticket/orders] error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load tickets." },
      { status: 500 }
    );
  }
}
