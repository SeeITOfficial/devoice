import Link from "next/link";

export default function AboutPreview() {
  return (
    <section className="bg-[#f2e9d8] px-6 py-24 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        {/* Heading */}
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            The artist
          </p>

          <h2 className="font-serif text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            The voice
            <br />
            behind
            <br />
            De Voice.
          </h2>
        </div>

        {/* Biography */}
        <div className="max-w-2xl">
          <p className="font-serif text-2xl leading-[1.4] text-[#0d1a17] sm:text-3xl">
            Kigula Jonathan Sedrak is a Ugandan soul singer known for his
            remarkable vocal range, melismatic singing style and signature
            use of the high register.
          </p>

          <div className="mt-8 space-y-5 text-base leading-7 text-[#0d1a17]/65">
            <p>
              His musical journey began in church as a choir leader before he
              explored Acapella and eventually chose to pursue a solo career.
            </p>

            <p>
              His sound moves across soul, R&amp;B, pop, blues, jazz and
              gospel, with vocal expression at the heart of his music.
            </p>

            <p>
              On 3 June 2026, Jonathan officially released his debut album,
              <span className="font-semibold text-[#0d1a17]">
                {" "}
                De Voice My Soul
              </span>
              , with <span className="font-semibold">Nankinga</span> and{" "}
              <span className="font-semibold">Imelda</span> as the lead
              singles.
            </p>
          </div>

          <Link
            href="/about"
            className="mt-9 inline-flex items-center gap-3 rounded-full border border-[#0d1a17]/25 px-7 py-4 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:border-[#b18a3b] hover:bg-[#b18a3b]/10"
          >
            Discover His Story
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}