import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.ticketOrder.findUnique({
      where: { id },
      include: {
        event: {
          select: { id: true, title: true, date: true, posterUrl: true },
        },
        tickets: {
          include: {
            ticketType: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    // Only allow viewing instructions if it's PENDING and MOBILE_MONEY
    // If it's CONFIRMED, the customer should go to /ticket
    // If it's CASH (Walk-in), they pay at the door.

    const settings = await prisma.siteSettings.findFirst();

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        quantity: order.quantity,
        customerName: order.customerName,
        paymentMethod: order.paymentMethod,
        event: order.event,
        ticketType: order.tickets[0]?.ticketType || null,
        totalAmount: order.totalAmount,
      },
      paymentDetails: {
        provider: settings?.paymentProvider || "MTN / Airtel Money",
        accountNumber: settings?.paymentAccountNumber || "Not configured",
        accountName: settings?.paymentAccountName || "Not configured",
      },
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { message: "Unable to load order." },
      { status: 500 }
    );
  }
}
