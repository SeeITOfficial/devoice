const events = [
  {
    day: "03",
    month: "JUN",
    year: "2026",
    title: "De Voice Album Experience",
    location: "Kampala, Uganda",
    description:
      "A celebration of De Voice My Soul and Jonathan's debut album journey.",
    tickets: [
      {
        name: "Regular",
        price: "UGX 50,000",
      },
      {
        name: "VIP",
        price: "UGX 150,000",
      },
    ],
  },
  {
    day: "—",
    month: "TBA",
    year: "2026",
    title: "De Voice Live",
    location: "Uganda",
    description:
      "An intimate live experience featuring soul, R&B, jazz, blues and gospel.",
    tickets: [
      {
        name: "Tickets",
        price: "Coming Soon",
      },
    ],
  },
];

export default function EventsPage() {
  return (
    <main className="bg-[#f2e9d8] text-[#0d1a17]">
      {/* Header */}
      <section className="px-6 pb-20 pt-28 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Live
          </p>

          <h1 className="font-serif text-6xl leading-[0.9] tracking-tight sm:text-7xl lg:text-9xl">
            Upcoming
            <br />
            Events
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-[#0d1a17]/60 sm:text-lg">
            Experience De Voice live. Discover upcoming performances,
            appearances and special events.
          </p>
        </div>
      </section>

      {/* Events */}
      <section className="bg-[#0d1a17] px-6 py-20 text-[#f2e9d8] sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1200px]">
          {events.map((event, index) => (
            <article
              key={`${event.title}-${index}`}
              className="border-b border-[#f2e9d8]/15 py-12 first:pt-0 last:border-b-0"
            >
              <div className="grid gap-10 lg:grid-cols-[150px_1fr]">
                {/* Date */}
                <div className="flex gap-3 lg:block">
                  <p className="font-serif text-6xl leading-none text-[#c9a24b]">
                    {event.day}
                  </p>

                  <div>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-[#c9a24b]">
                      {event.month}
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#f2e9d8]/35">
                      {event.year}
                    </p>
                  </div>
                </div>

                {/* Event */}
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
                    Live Performance
                  </p>

                  <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                    {event.title}
                  </h2>

                  <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[#f2e9d8]/45">
                    {event.location}
                  </p>

                  <p className="mt-6 max-w-2xl text-base leading-7 text-[#f2e9d8]/60">
                    {event.description}
                  </p>

                  {/* Tickets */}
                  <div className="mt-10 grid gap-3 sm:grid-cols-2">
                    {event.tickets.map((ticket) => (
                      <div
                        key={ticket.name}
                        className="flex items-center justify-between rounded-2xl border border-[#f2e9d8]/10 bg-[#f2e9d8]/[0.025] p-5"
                      >
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f2e9d8]/50">
                            {ticket.name}
                          </p>

                          <p className="mt-2 font-serif text-xl">
                            {ticket.price}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="rounded-full border border-[#c9a24b]/50 px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#c9a24b] transition-colors hover:bg-[#c9a24b]/10"
                        >
                          Get Tickets
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* No events */}
      <section className="px-6 py-20 text-center sm:px-10">
        <p className="text-xs uppercase tracking-[0.35em] text-[#b18a3b]">
          Stay connected
        </p>

        <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
          More dates are coming.
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-[#0d1a17]/55">
          Follow De Voice for announcements about upcoming performances,
          appearances and ticket releases.
        </p>
      </section>
    </main>
  );
}