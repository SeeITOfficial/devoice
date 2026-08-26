import Link from "next/link";

export default function BookingCTA() {
  return (
    <section className="bg-[#0d1a17] px-6 py-24 text-[#f2e9d8] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#c9a24b]/20 bg-[#16241f] px-8 py-16 sm:px-12 lg:px-20 lg:py-20">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#c9a24b]/10 blur-3xl" />

          <div className="relative max-w-4xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-[#c9a24b]">
              Bring De Voice to your stage
            </p>

            <h2 className="font-serif text-5xl leading-[0.95] sm:text-6xl lg:text-8xl">
              Let the voice
              <br />
              tell the story.
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-[#f2e9d8]/60 sm:text-lg">
              Available for live performances, private events, corporate
              engagements, collaborations and selected international
              opportunities.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/book"
                className="rounded-full bg-[#f2e9d8] px-8 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#0d1a17] transition-transform hover:-translate-y-1"
              >
                Book De Voice
              </Link>

              <Link
                href="/contact"
                className="rounded-full border border-[#c9a24b]/60 px-8 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#c9a24b] transition-colors hover:bg-[#c9a24b]/10"
              >
                Contact Management
              </Link>
            </div>
          </div>

          {/* Decorative typography */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-2rem] right-[-1rem] hidden select-none font-serif text-[11rem] leading-none text-[#f2e9d8]/[0.025] lg:block"
          >
            DV
          </div>
        </div>
      </div>
    </section>
  );
}