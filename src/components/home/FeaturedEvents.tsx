import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function FeaturedEvents() {
  const events = await prisma.event.findMany({
    where: {
      cancelled: false,
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: "asc",
    },
    take: 2,
  });

  return (
    <section className="bg-[#0d1a17] px-6 py-24 text-[#f2e9d8] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-[#c9a24b]">
              On the stage
            </p>

            <h2 className="font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
              Upcoming
              <br />
              Events
            </h2>
          </div>

          <Link
            href="/events"
            className="w-fit rounded-full border border-[#c9a24b]/50 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#c9a24b] transition-colors hover:bg-[#c9a24b]/10"
          >
            View All Events
          </Link>
        </div>

        {/* Events */}
        <div className="mt-14 border-t border-[#f2e9d8]/15">
          {events.length === 0 ? (
            <div className="py-16">
              <p className="font-serif text-3xl text-[#f2e9d8]">
                No upcoming events.
              </p>

              <p className="mt-3 text-sm text-[#f2e9d8]/45">
                New performances will appear here when they are announced.
              </p>
            </div>
          ) : (
            events.map((event) => (
              <article
                key={event.id}
                className="grid gap-6 border-b border-[#f2e9d8]/15 py-8 md:grid-cols-[180px_1fr_auto] md:items-center"
              >
                {/* Date */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c9a24b]">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(event.date)}
                  </p>
                </div>

                {/* Event details */}
                <div>
                  <h3 className="font-serif text-3xl text-[#f2e9d8] sm:text-4xl">
                    {event.title}
                  </h3>

                  <p className="mt-2 text-sm uppercase tracking-[0.15em] text-[#f2e9d8]/45">
                    Upcoming Performance
                  </p>

                  {event.description && (
                    <p className="mt-4 max-w-xl text-sm leading-6 text-[#f2e9d8]/60">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Action */}
                <Link
                  href={`/events/${event.id}`}
                  className="w-fit rounded-full border border-[#f2e9d8]/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#f2e9d8] transition-all hover:border-[#c9a24b] hover:text-[#c9a24b]"
                >
                  Event Details
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}