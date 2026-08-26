const videos = [
  {
    title: "Nankinga",
    type: "Official Video",
    description:
      "A fan favourite and one of the lead singles from De Voice My Soul.",
  },
  {
    title: "Imelda",
    type: "Music",
    description:
      "One of the lead singles from Jonathan's debut album.",
  },
  {
    title: "Nsonyi",
    type: "Music",
    description:
      "The 2025 Afro-soul zouk classic.",
  },
];

export default function VideosPage() {
  return (
    <main className="bg-[#f2e9d8] text-[#0d1a17]">
      {/* Header */}
      <section className="px-6 pb-20 pt-28 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Watch De Voice
          </p>

          <h1 className="font-serif text-6xl leading-[0.9] tracking-tight sm:text-7xl lg:text-9xl">
            In motion.
            <br />
            In sound.
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-[#0d1a17]/60 sm:text-lg">
            Performances, music videos and moments from the world of De Voice.
          </p>
        </div>
      </section>

      {/* Videos */}
      <section className="bg-[#0d1a17] px-6 py-20 text-[#f2e9d8] sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8">
            {videos.map((video, index) => (
              <article
                key={video.title}
                className={`grid overflow-hidden rounded-[2rem] bg-[#16241f] ${
                  index === 0
                    ? "lg:grid-cols-[1.5fr_1fr]"
                    : "lg:grid-cols-[1fr_1fr]"
                }`}
              >
                {/* Video placeholder */}
                <div className="relative aspect-video min-h-[280px] overflow-hidden bg-[#111d19]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,75,0.14),transparent_55%)]" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      aria-label={`Play ${video.title}`}
                      className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c9a24b]/60 bg-[#0d1a17]/70 text-[#c9a24b] backdrop-blur-sm transition-transform hover:scale-110"
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M8 5v14l11-7L8 5z" />
                      </svg>
                    </button>
                  </div>

                  <span className="absolute left-6 top-6 text-[10px] uppercase tracking-[0.3em] text-[#c9a24b]">
                    0{index + 1}
                  </span>
                </div>

                {/* Information */}
                <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
                    {video.type}
                  </p>

                  <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
                    {video.title}
                  </h2>

                  <p className="mt-5 max-w-md text-sm leading-7 text-[#f2e9d8]/55">
                    {video.description}
                  </p>

                  <div className="mt-8">
                    <button
                      type="button"
                      className="rounded-full border border-[#f2e9d8]/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#f2e9d8] transition-colors hover:border-[#c9a24b] hover:text-[#c9a24b]"
                    >
                      Watch Video
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="px-6 py-24 text-center sm:px-10">
        <p className="text-xs uppercase tracking-[0.35em] text-[#b18a3b]">
          De Voice
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
          More performances coming soon.
        </h2>
      </section>
    </main>
  );
}