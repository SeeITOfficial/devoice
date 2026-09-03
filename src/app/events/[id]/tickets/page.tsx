import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TicketPurchaseForm from "./TicketPurchaseForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventTicketsPage({ params }: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      ticketTypes: {
        orderBy: { price: "asc" },
      },
    },
  });

  if (!event || event.cancelled) {
    notFound();
  }

  const isPast = event.date < new Date();

  if (isPast) {
    return (
      <main className="min-h-screen bg-[#f2e9d8] px-6 py-24 text-[#0d1a17] sm:px-10 lg:px-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-red-700">
            Tickets are no longer available for this event.
          </p>
          <a
            href={`/events/${id}`}
            className="mt-8 inline-flex rounded-full bg-[#0d1a17] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8]"
          >
            Back to Event
          </a>
        </div>
      </main>
    );
  }

  // Calculate available quantity for finite tickets
  // SQLite doesn't have a great way to do this in one query with relation counts easily matching status
  // So we calculate it per ticket type here if needed, or we can just pass the total quantity and rely on the API for strict validation as requested.
  // The requirement says: "Respect finite inventory shown by the ticket type. For finite ticket types: If quantity is 100, do not allow the customer UI to select more than 100 based solely on the displayed availability."
  // To get the exact available quantity, we should subtract sold tickets.
  const ticketTypesWithAvailability = await Promise.all(
    event.ticketTypes.map(async (ticket) => {
      if (ticket.unlimited || ticket.quantity === null) {
        return {
          ...ticket,
          availableQuantity: null,
        };
      }

      const soldTickets = await prisma.ticket.count({
        where: {
          ticketTypeId: ticket.id,
          order: {
            status: "CONFIRMED",
          },
        },
      });

      return {
        ...ticket,
        availableQuantity: Math.max(0, ticket.quantity - soldTickets),
      };
    })
  );

  const settings = await prisma.siteSettings.findFirst();

  return (
    <TicketPurchaseForm
      event={{
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
      }}
      ticketTypes={ticketTypesWithAvailability}
      paymentInstructions={{
        provider: settings?.paymentProvider || "MTN Mobile Money",
        accountNumber: settings?.paymentAccountNumber || "0770000000",
        accountName: settings?.paymentAccountName || "De Voice",
      }}
    />
  );
}