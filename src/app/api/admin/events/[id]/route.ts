import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminApiRequest } from "@/lib/adminAuth";
import { validateMediaUrl } from "@/lib/urlValidator";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await validateAdminApiRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
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
        orders: {
          where: {
            status: "CONFIRMED",
          },
          include: {
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found." },
        { status: 404 }
      );
    }

    // Calculate accounting statistics
    const stats = {
      totalEntered: 0,
      totalRevenue: 0,
      byTicketType: {} as Record<string, { entered: number; revenue: number }>,
      byPaymentMethod: {
        ONLINE: { entered: 0, revenue: 0 },
        WALK_IN: { entered: 0, revenue: 0 },
      },
    };

    // Initialize ticket types
    event.ticketTypes.forEach(tt => {
      stats.byTicketType[tt.name] = { entered: 0, revenue: 0 };
    });

    event.orders.forEach((order) => {
      const isOnline = order.paymentMethod === "MOBILE_MONEY";
      const paymentKey = isOnline ? "ONLINE" : "WALK_IN";

      // Revenue belongs to the confirmed order, regardless of ticket status.
      stats.totalRevenue += order.totalAmount;
      stats.byPaymentMethod[paymentKey].revenue += order.totalAmount;

      order.tickets.forEach((ticket) => {
        const type = event.ticketTypes.find(t => t.id === ticket.ticketTypeId);
        if (!type) return;

        // Use the immutable order price for the ticket-type breakdown.
        stats.byTicketType[type.name].revenue += order.unitPrice;

        if (ticket.status === "USED") {
          stats.totalEntered += 1;
          stats.byTicketType[type.name].entered += 1;
          stats.byPaymentMethod[paymentKey].entered += 1;
        }
      });
    });

    // Strip orders from the response body to avoid huge payloads
    const { orders, ...eventWithoutOrders } = event;

    return NextResponse.json({ 
      success: true, 
      event: eventWithoutOrders,
      stats 
    });
  } catch (error) {
    console.error("Event fetch error:", error);

    return NextResponse.json(
      { message: "Unable to load event." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await validateAdminApiRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    const data: {
      title?: string;
      date?: Date;
      description?: string | null;
      posterUrl?: string | null;
      cancelled?: boolean;
    } = {};

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return NextResponse.json(
          { message: "Event title cannot be empty." },
          { status: 400 }
        );
      }

      data.title = body.title.trim();
    }

    if (body.date !== undefined) {
      const date = new Date(body.date);

      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { message: "Invalid event date." },
          { status: 400 }
        );
      }

      if (date <= new Date()) {
        return NextResponse.json(
          { message: "Event date must be in the future." },
          { status: 400 }
        );
      }

      data.date = date;
    }

    if (body.description !== undefined) {
      data.description = body.description || null;
    }

    if (body.posterUrl !== undefined) {
      if (body.posterUrl) {
        const validated = validateMediaUrl(body.posterUrl, "image");
        if (!validated) {
           return NextResponse.json({ message: "Invalid poster URL (must be R2 hosted)." }, { status: 400 });
        }
        data.posterUrl = validated;
      } else {
        data.posterUrl = null;
      }
    }

    if (body.cancelled !== undefined) {
      data.cancelled = Boolean(body.cancelled);
    }

    const event = await prisma.$transaction(async (transaction) => {
      if (body.ticketTypes !== undefined) {
        if (!Array.isArray(body.ticketTypes)) {
          throw new Error("Invalid ticket types data.");
        }

        for (const ticket of body.ticketTypes) {
          if (!ticket.name || !ticket.name.trim()) {
            throw new Error("Ticket name cannot be empty.");
          }
          if (Number.isNaN(Number(ticket.price)) || Number(ticket.price) < 0) {
            throw new Error("Ticket price must be a valid non-negative number.");
          }
          if (!ticket.unlimited && (Number.isNaN(Number(ticket.quantity)) || Number(ticket.quantity) < 1)) {
            throw new Error("Ticket quantity must be at least 1 for finite tickets.");
          }
        }

        const existingTicketTypes = await transaction.ticketType.findMany({
          where: { eventId: id },
          include: {
            _count: { select: { tickets: true } }
          }
        });

        const incomingIds = new Set(
          body.ticketTypes
            .map((t: any) => t.id)
            .filter((i: any) => i)
        );

        const toDelete = existingTicketTypes.filter(et => !incomingIds.has(et.id));
        for (const ticket of toDelete) {
          if (ticket._count.tickets > 0) {
            throw new Error(`Cannot delete ticket type '${ticket.name}' because it has issued tickets.`);
          }
          await transaction.ticketType.delete({
            where: { id: ticket.id }
          });
        }

        for (const ticket of body.ticketTypes) {
          const ticketData = {
            name: ticket.name.trim(),
            price: Number(ticket.price),
            quantity: ticket.unlimited ? null : Number(ticket.quantity),
            unlimited: Boolean(ticket.unlimited),
          };

          if (ticket.id) {
            const existing = existingTicketTypes.find(et => et.id === ticket.id);
            if (!existing) {
              throw new Error(`Ticket type ${ticket.id} not found.`);
            }

            // Validate the resulting finite quantity against confirmed tickets
            if (!ticket.unlimited) {
              const confirmedCount = await transaction.ticket.count({
                where: {
                  ticketTypeId: ticket.id,
                  order: {
                    status: "CONFIRMED",
                  },
                },
              });
              
              if (Number(ticket.quantity) < confirmedCount) {
                throw new Error(
                  `Cannot set quantity to ${ticket.quantity} for ticket type '${ticket.name}': ${confirmedCount} confirmed tickets already exist.`
                );
              }
            }

            await transaction.ticketType.update({
              where: { id: ticket.id },
              data: ticketData,
            });
          } else {
            await transaction.ticketType.create({
              data: {
                ...ticketData,
                eventId: id,
              },
            });
          }
        }
      }

      const updatedEvent = await transaction.event.update({
        where: { id },
        data,
      });

      return transaction.event.findUnique({
        where: { id: updatedEvent.id },
        include: { ticketTypes: true },
      });
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Event update error:", error);

    const isClientError = error instanceof Error && (
      error.message.includes("Cannot delete") ||
      error.message.includes("Cannot set quantity")
    );
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to update event.",
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
