import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export default async function AdminEventsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const events = await prisma.event.findMany({
    orderBy: {
      date: "asc",
    },
    include: {
      info: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      ticketTypes: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
              Management
            </p>

            <h1 className="mt-4 font-serif text-6xl leading-none">
              Events
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
              Manage performances, appearances and upcoming events.
            </p>
          </div>

          <a
            href="/admin/events/new"
            className="rounded-full bg-[#0d1a17] px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#f2e9d8]"
          >
            Add Event
          </a>
        </div>

        {events.length === 0 && (
          <div className="mt-12 rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 p-16 text-center">
            <p className="font-serif text-3xl">
              No events yet.
            </p>

            <p className="mt-3 text-sm text-[#0d1a17]/50">
              Upcoming performances will appear here.
            </p>
          </div>
        )}

        {events.length > 0 && (
          <div className="mt-12 space-y-6">
            {events.map((event) => (
              <article
                key={event.id}
                className={`overflow-hidden rounded-[2rem] border bg-white/50 ${
                  event.cancelled
                    ? "border-red-500/20"
                    : "border-[#0d1a17]/10"
                }`}
              >
                <div className="grid lg:grid-cols-[240px_1fr]">
                  {/* Poster */}
                  <div className="relative aspect-[4/3] bg-[#16241f] lg:aspect-auto">
                    {event.posterUrl ? (
                      <img
                        src={event.posterUrl}
                        alt={event.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs uppercase tracking-[0.25em] text-[#c9a24b]">
                          Event
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-7 sm:p-9">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
                          event.cancelled
                            ? "bg-red-500/10 text-red-700"
                            : "bg-[#0d1a17] text-[#f2e9d8]"
                        }`}
                      >
                        {event.cancelled ? "Cancelled" : "Upcoming"}
                      </span>

                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(event.date)}
                      </span>
                    </div>

                    <h2 className="mt-5 font-serif text-4xl">
                      {event.title}
                    </h2>

                    {event.description && (
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#0d1a17]/60">
                        {event.description}
                      </p>
                    )}

                    {/* Event information */}
                    {event.info.length > 0 && (
                      <div className="mt-7 grid gap-5 border-t border-[#0d1a17]/10 pt-6 sm:grid-cols-2">
                        {event.info.map((item) => (
                          <div key={item.id}>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                              {item.label}
                            </p>

                            <p className="mt-2 text-sm">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ticket types */}
                    {event.ticketTypes.length > 0 && (
                      <div className="mt-7 border-t border-[#0d1a17]/10 pt-6">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                          Ticket types
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          {event.ticketTypes.map((ticket) => (
                            <span
                              key={ticket.id}
                              className="rounded-full border border-[#0d1a17]/10 px-4 py-2 text-xs"
                            >
                              {ticket.name} ·{" "}
                              {ticket.price.toLocaleString()} UGX
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-7 flex flex-wrap gap-3 border-t border-[#0d1a17]/10 pt-6">
                      <a
                        href={`/admin/events/${event.id}`}
                        className="rounded-full border border-[#0d1a17]/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:border-[#c9a24b]"
                      >
                        Edit Event
                      </a>

                      <a
                        href={`/events/${event.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[#0d1a17]/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:border-[#c9a24b]"
                      >
                        View Public Page
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}