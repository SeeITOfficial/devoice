import Link from "next/link";

const events = [
  {
    date: "COMING SOON",
    title: "Live with De Voice",
    location: "Kampala, Uganda",
    description:
      "An intimate live experience featuring soul, R&B, jazz and gospel.",
  },
  {
    date: "COMING SOON",
    title: "De Voice Live",
    location: "Uganda",
    description:
      "A special performance bringing Jonathan's signature vocals to the stage.",
  },
];

export default function FeaturedEvents() {
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
          {events.map((event, index) => (
            <article
              key={`${event.title}-${index}`}
              className="grid gap-6 border-b border-[#f2e9d8]/15 py-8 md:grid-cols-[180px_1fr_auto] md:items-center"
            >
              {/* Date */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c9a24b]">
                  {event.date}
                </p>
              </div>

              {/* Event details */}
              <div>
                <h3 className="font-serif text-3xl text-[#f2e9d8] sm:text-4xl">
                  {event.title}
                </h3>

                <p className="mt-2 text-sm uppercase tracking-[0.15em] text-[#f2e9d8]/45">
                  {event.location}
                </p>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[#f2e9d8]/60">
                  {event.description}
                </p>
              </div>

              {/* Action */}
              <Link
                href="/events"
                className="w-fit rounded-full border border-[#f2e9d8]/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#f2e9d8] transition-all hover:border-[#c9a24b] hover:text-[#c9a24b]"
              >
                Event Details
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}