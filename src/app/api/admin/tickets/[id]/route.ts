import { NextResponse } from "next/server";
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

    if (!body.status || !["INVALID"].includes(body.status)) {
      return NextResponse.json(
        {
          message:
            "Only INVALID is an accepted target status for this endpoint.",
        },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found." },
        { status: 404 }
      );
    }

    // Only allow VALID -> INVALID transition
    if (ticket.status !== "VALID") {
      return NextResponse.json(
        {
          message: `Cannot transition from ${ticket.status} to INVALID. Only VALID tickets can be invalidated.`,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: "INVALID" },
      include: {
        ticketType: { select: { id: true, name: true, price: true } },
        order: {
          select: {
            id: true,
            customerName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error("Admin ticket update error:", error);
    return NextResponse.json(
      { message: "Unable to update ticket." },
      { status: 500 }
    );
  }
}
