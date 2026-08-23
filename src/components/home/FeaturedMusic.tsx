import Link from "next/link";

const tracks = [
  {
    title: "Nankinga",
    year: "2026",
    type: "Lead Single",
  },
  {
    title: "Imelda",
    year: "2026",
    type: "Lead Single",
  },
  {
    title: "Nsonyi",
    year: "2025",
    type: "Single",
  },
];

export default function FeaturedMusic() {
  return (
    <section className="relative overflow-hidden bg-[#f2e9d8] px-6 py-24 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        {/* Section heading */}
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
              The latest chapter
            </p>

            <h2 className="font-serif text-5xl leading-none tracking-tight sm:text-6xl lg:text-7xl">
              De Voice
              <br />
              My Soul
            </h2>
          </div>

          <p className="max-w-md font-serif text-lg leading-8 text-[#0d1a17]/65">
            Jonathan's debut album — a collection shaped by soul, jazz,
            R&amp;B, blues and gospel, with the voice at the centre of it all.
          </p>
        </div>

        {/* Album feature */}
        <div className="grid overflow-hidden rounded-[2rem] bg-[#0d1a17] lg:grid-cols-[0.9fr_1.1fr]">
          {/* Artwork placeholder */}
          <div className="relative aspect-square min-h-[360px] overflow-hidden bg-[#16241f] lg:aspect-auto lg:min-h-[620px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-[#c9a24b]/40 bg-[#101d19] shadow-2xl sm:h-80 sm:w-80">
                <div className="absolute inset-5 rounded-full border border-[#c9a24b]/20" />
                <div className="absolute inset-12 rounded-full border border-[#c9a24b]/10" />

                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#c9a24b]">
                    De Voice
                  </p>

                  <p className="mt-3 font-serif text-4xl text-[#f2e9d8] sm:text-5xl">
                    My Soul
                  </p>

                  <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[#f2e9d8]/40">
                    2026
                  </p>
                </div>
              </div>
            </div>

            {/* Vintage glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,75,0.14),transparent_55%)]" />

            <div className="absolute bottom-8 left-8 text-[10px] uppercase tracking-[0.35em] text-[#f2e9d8]/40">
              Debut Album
            </div>
          </div>

          {/* Album information */}
          <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#c9a24b]">
                Released · 03 June 2026
              </p>

              <h3 className="mt-6 font-serif text-4xl text-[#f2e9d8] sm:text-5xl">
                De Voice My Soul
              </h3>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#f2e9d8]/65">
                A debut album built around vocal expression — moving through
                soul, jazz, R&amp;B, blues and gospel with Jonathan's signature
                high register and melismatic style.
              </p>
            </div>

            {/* Tracks */}
            <div className="mt-12">
              <div className="border-t border-[#f2e9d8]/15">
                {tracks.map((track, index) => (
                  <div
                    key={track.title}
                    className="flex items-center justify-between border-b border-[#f2e9d8]/15 py-5"
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-xs text-[#c9a24b]/60">
                        0{index + 1}
                      </span>

                      <div>
                        <p className="font-serif text-xl text-[#f2e9d8]">
                          {track.title}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#f2e9d8]/35">
                          {track.type}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-[#f2e9d8]/35">
                      {track.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/music"
                className="inline-flex rounded-full bg-[#f2e9d8] px-7 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#0d1a17] transition-transform hover:-translate-y-1"
              >
                Explore Music
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}