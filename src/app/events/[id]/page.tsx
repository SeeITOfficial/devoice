import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailsPage({ params }: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      info: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      ticketTypes: {
        orderBy: {
          price: "asc",
        },
      },
    },
  });

  if (!event || event.cancelled) {
    notFound();
  }

  const isPast = event.date < new Date();

  return (
    <main className="min-h-screen bg-[#f2e9d8] text-[#0d1a17]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0d1a17] text-[#f2e9d8]">
        <div className="mx-auto grid min-h-[70vh] max-w-[1440px] md:grid-cols-2">
          {/* Poster */}
          <div className="relative min-h-[50vh] md:min-h-[70vh]">
            {event.posterUrl ? (
              <img
                src={event.posterUrl}
                alt={event.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#16241f]">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#c9a24b]">
                    De Voice
                  </p>

                  <p className="mt-4 font-serif text-6xl">
                    Live
                  </p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1a17]/20 to-[#0d1a17]/80 md:bg-gradient-to-r" />
          </div>

          {/* Information */}
          <div className="flex items-center px-6 py-16 sm:px-10 lg:px-16">
            <div className="max-w-xl">
              <Link
                href="/events"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a24b]"
              >
                ← All Events
              </Link>

              <p className="mt-12 text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
                {isPast ? "Past Event" : "Upcoming Event"}
              </p>

              <h1 className="mt-5 font-serif text-6xl leading-[0.9] sm:text-7xl">
                {event.title}
              </h1>

              <p className="mt-7 text-sm uppercase tracking-[0.18em] text-[#f2e9d8]/50">
                {new Intl.DateTimeFormat("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(event.date)}
              </p>

              {event.description && (
                <p className="mt-7 text-base leading-7 text-[#f2e9d8]/65">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Event information */}
      <section className="px-6 py-20 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-5xl">
          {event.info.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
                Event Information
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {event.info.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.5rem] border border-[#0d1a17]/10 bg-white/40 p-7"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                      {item.label}
                    </p>

                    <p className="mt-3 font-serif text-2xl">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets */}
          {!isPast && event.ticketTypes.length > 0 && (
            <div className="mt-20">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
                Admission
              </p>

              <h2 className="mt-3 font-serif text-4xl">
                Tickets
              </h2>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {event.ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-[1.5rem] border border-[#0d1a17]/10 bg-white/40 p-7"
                  >
                    <p className="font-serif text-2xl">
                      {ticket.name}
                    </p>

                    <p className="mt-3 text-2xl font-semibold">
                      {ticket.price.toLocaleString()} UGX
                    </p>

                    <p className="mt-3 text-xs text-[#0d1a17]/45">
                      {ticket.unlimited
                        ? "Unlimited availability"
                        : ticket.quantity !== null
                          ? `${ticket.quantity} tickets available`
                          : "Availability available on request"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href={`/events/${event.id}/tickets`}
                  className="inline-flex rounded-full bg-[#0d1a17] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-1"
                >
                  Get Tickets
                </Link>
              </div>
            </div>
          )}

          {/* No tickets */}
          {!isPast && event.ticketTypes.length === 0 && (
            <div className="mt-20 rounded-[2rem] bg-[#0d1a17] p-8 text-[#f2e9d8] sm:p-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a24b]">
                Admission
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Ticket information coming soon.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-[#f2e9d8]/50">
                Ticketing details will be announced when they are available.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}