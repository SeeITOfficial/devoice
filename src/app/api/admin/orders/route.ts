import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminApiRequest } from "@/lib/adminAuth";

export async function GET(request: Request) {
  try {
    const isAdmin = await validateAdminApiRequest(request);

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorised." },
        { status: 401 }
      );
    }

    const orders = await prisma.ticketOrder.findMany({
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
        },
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json(
      { message: "Unable to load orders." },
      { status: 500 }
    );
  }
}
