import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: {
      cancelled: false,
    },
    orderBy: {
      date: "asc",
    },
    include: {
      info: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  const upcomingEvents = events.filter(
    (event) => event.date >= new Date()
  );

  const pastEvents = events.filter(
    (event) => event.date < new Date()
  );

  return (
    <main className="min-h-screen bg-[#f2e9d8] text-[#0d1a17]">
      {/* Header */}
      <section className="px-6 pb-16 pt-24 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            On the stage
          </p>

          <h1 className="mt-5 font-serif text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">
            Events
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-[#0d1a17]/60 sm:text-lg">
            Performances, appearances and special experiences with
            De Voice.
          </p>
        </div>
      </section>

      {/* Upcoming */}
      <section className="px-6 pb-24 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
              What&apos;s next
            </p>

            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
              Upcoming
            </h2>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 px-6 py-20 text-center">
              <p className="font-serif text-3xl">
                No upcoming events.
              </p>

              <p className="mt-4 text-sm text-[#0d1a17]/50">
                New performances will be announced here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Past events */}
      {pastEvents.length > 0 && (
        <section className="border-t border-[#0d1a17]/10 bg-white/20 px-6 py-24 sm:px-10 lg:px-20">
          <div className="mx-auto max-w-[1440px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
              Archive
            </p>

            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
              Past Events
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {pastEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  past
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function EventCard({
  event,
  past = false,
}: {
  event: {
    id: string;
    title: string;
    date: Date;
    description: string | null;
    posterUrl: string | null;
    info: {
      id: string;
      label: string;
      value: string;
    }[];
  };
  past?: boolean;
}) {
  return (
    <article
      className={`overflow-hidden rounded-[2rem] border border-[#0d1a17]/10 bg-white/50 ${
        past ? "opacity-75" : ""
      }`}
    >
      <div className="grid md:grid-cols-[320px_1fr]">
        {/* Poster */}
        <div className="relative aspect-[4/3] bg-[#16241f] md:aspect-auto">
          {event.posterUrl ? (
            <Image
              src={event.posterUrl}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a24b]">
                  De Voice
                </p>

                <p className="mt-3 font-serif text-4xl text-[#f2e9d8]">
                  Live
                </p>
              </div>
            </div>
          )}

          <div className="absolute left-5 top-5 rounded-full bg-[#0d1a17]/80 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#f2e9d8]">
            {past ? "Past Event" : "Upcoming"}
          </div>
        </div>

        {/* Details */}
        <div className="p-7 sm:p-9 lg:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b18a3b]">
            {new Intl.DateTimeFormat("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(event.date)}
          </p>

          <h3 className="mt-4 font-serif text-4xl sm:text-5xl">
            {event.title}
          </h3>

          {event.description && (
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#0d1a17]/60">
              {event.description}
            </p>
          )}

          {event.info.length > 0 && (
            <div className="mt-7 grid gap-4 border-t border-[#0d1a17]/10 pt-6 sm:grid-cols-2">
              {event.info.map((item) => (
                <div key={item.id}>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                    {item.label}
                  </p>

                  <p className="mt-1 text-sm">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Link
            href={`/events/${event.id}`}
            className="mt-8 inline-flex rounded-full bg-[#0d1a17] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5"
          >
            Event Details
          </Link>
        </div>
      </div>
    </article>
  );
}