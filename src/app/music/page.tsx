const tracks = [
  {
    number: "01",
    title: "Nankinga",
    year: "2026",
    label: "Lead Single",
  },
  {
    number: "02",
    title: "Imelda",
    year: "2026",
    label: "Lead Single",
  },
  {
    number: "03",
    title: "Nsonyi",
    year: "2025",
    label: "Afro Soul · Zouk",
  },
  {
    number: "04",
    title: "Disco",
    year: "2024",
    label: "Single",
  },
  {
    number: "05",
    title: "Love",
    year: "2024",
    label: "Single",
  },
  {
    number: "06",
    title: "Mr and Mrs",
    year: "2024",
    label: "Single",
  },
  {
    number: "07",
    title: "Nakawunde",
    year: "2024",
    label: "Single",
  },
];

export default function MusicPage() {
  return (
    <main className="bg-[#f2e9d8] text-[#0d1a17]">
      {/* Header */}
      <section className="px-6 pb-20 pt-28 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Music
          </p>

          <h1 className="max-w-4xl font-serif text-6xl leading-[0.9] tracking-tight sm:text-7xl lg:text-9xl">
            De Voice
            <br />
            My Soul
          </h1>

          <div className="mt-8 flex flex-col gap-4 border-l border-[#b18a3b] pl-5 sm:flex-row sm:items-center sm:gap-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#0d1a17]/55">
              Debut Album · 03 June 2026
            </p>

            <span className="hidden h-1 w-1 rounded-full bg-[#b18a3b] sm:block" />

            <p className="text-sm text-[#0d1a17]/55">
              Soul · R&amp;B · Jazz · Blues · Gospel
            </p>
          </div>
        </div>
      </section>

      {/* Album */}
      <section className="bg-[#0d1a17] px-6 py-20 text-[#f2e9d8] sm:px-10 lg:px-20">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          {/* Album artwork */}
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#16241f]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-[70%] w-[70%] items-center justify-center rounded-full border border-[#c9a24b]/40">
                <div className="absolute inset-5 rounded-full border border-[#c9a24b]/20" />
                <div className="absolute inset-12 rounded-full border border-[#c9a24b]/10" />

                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#c9a24b]">
                    De Voice
                  </p>

                  <p className="mt-3 font-serif text-4xl sm:text-5xl">
                    My Soul
                  </p>

                  <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[#f2e9d8]/40">
                    Jonathan · 2026
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,75,0.16),transparent_60%)]" />
          </div>

          {/* Album information */}
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9a24b]">
              The debut
            </p>

            <h2 className="mt-5 font-serif text-5xl leading-none sm:text-6xl">
              De Voice
              <br />
              My Soul
            </h2>

            <p className="mt-8 max-w-2xl text-base leading-8 text-[#f2e9d8]/65 sm:text-lg">
              A vocal-driven body of work moving through soul, jazz, R&amp;B,
              blues and gospel. The album places Jonathan's remarkable range,
              melismatic style and high register at the centre.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {["Soul", "R&B", "Jazz", "Blues", "Gospel"].map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-[#f2e9d8]/15 px-4 py-2 text-xs uppercase tracking-[0.15em] text-[#f2e9d8]/60"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tracklist */}
      <section className="px-6 py-24 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-10 flex items-end justify-between border-b border-[#0d1a17]/15 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
                Selected releases
              </p>

              <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
                The music
              </h2>
            </div>

            <span className="hidden text-xs uppercase tracking-[0.2em] text-[#0d1a17]/40 sm:block">
              2018 — 2026
            </span>
          </div>

          <div>
            {tracks.map((track) => (
              <article
                key={track.title}
                className="group grid grid-cols-[45px_1fr_auto] items-center gap-4 border-b border-[#0d1a17]/10 py-6 transition-colors hover:bg-[#0d1a17]/[0.025] sm:grid-cols-[60px_1fr_150px_auto]"
              >
                <span className="text-xs text-[#b18a3b]">
                  {track.number}
                </span>

                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl">
                    {track.title}
                  </h3>

                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/40 sm:hidden">
                    {track.label}
                  </p>
                </div>

                <span className="hidden text-xs uppercase tracking-[0.15em] text-[#0d1a17]/40 sm:block">
                  {track.label}
                </span>

                <span className="text-xs text-[#0d1a17]/40">
                  {track.year}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0d1a17] px-6 py-20 text-center text-[#f2e9d8] sm:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-[#c9a24b]">
          More music
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
          Hear the voice.
          <br />
          Experience the soul.
        </h2>
      </section>
    </main>
  );
}