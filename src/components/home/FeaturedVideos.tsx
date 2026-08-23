import Link from "next/link";

const videos = [
  {
    title: "Nankinga",
    type: "Official Video",
    featured: true,
  },
  {
    title: "Imelda",
    type: "Music",
    featured: false,
  },
  {
    title: "Nsonyi",
    type: "Music",
    featured: false,
  },
];

export default function FeaturedVideos() {
  return (
    <section className="bg-[#0d1a17] px-6 py-24 text-[#f2e9d8] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-[#c9a24b]">
              Watch De Voice
            </p>

            <h2 className="font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
              In motion.
              <br />
              In sound.
            </h2>
          </div>

          <Link
            href="/videos"
            className="w-fit rounded-full border border-[#c9a24b]/50 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#c9a24b] transition-colors hover:bg-[#c9a24b]/10"
          >
            View All Videos
          </Link>
        </div>

        {/* Video grid */}
        <div className="mt-14 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* Featured video */}
          <article className="group relative aspect-video overflow-hidden rounded-[1.5rem] bg-[#16241f]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,75,0.16),transparent_55%)]" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c9a24b]/60 bg-[#0d1a17]/70 text-[#c9a24b] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1a17] via-[#0d1a17]/60 to-transparent p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a24b]">
                {videos[0].type}
              </p>

              <h3 className="mt-2 font-serif text-3xl sm:text-4xl">
                {videos[0].title}
              </h3>
            </div>
          </article>

          {/* Smaller videos */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {videos.slice(1).map((video) => (
              <article
                key={video.title}
                className="group relative min-h-[220px] overflow-hidden rounded-[1.5rem] bg-[#16241f]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,75,0.1),transparent_60%)]" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a24b]/50 bg-[#0d1a17]/70 text-[#c9a24b] transition-transform duration-300 group-hover:scale-110">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1a17] to-transparent p-6">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a24b]/80">
                    {video.type}
                  </p>

                  <h3 className="mt-1 font-serif text-2xl">
                    {video.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}