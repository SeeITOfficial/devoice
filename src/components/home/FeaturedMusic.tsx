import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

function isValidImageUrl(url: string | null | undefined) {
  if (!url || !url.trim()) {
    return false;
  }

  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    );
  } catch {
    return false;
  }
}

export default async function FeaturedMusic() {
  const album = await prisma.album.findFirst({
    where: {
      published: true,
    },
    orderBy: {
      releaseDate: "desc",
    },
    include: {
      songs: {
        where: {
          published: true,
        },
        orderBy: {
          releaseDate: "asc",
        },
      },
    },
  });

  return (
    <section className="relative overflow-hidden bg-[#f2e9d8] px-6 py-24 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
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
            Jonathan&apos;s debut album — a collection shaped by soul, jazz,
            R&amp;B, blues and gospel, with the voice at the centre of it all.
          </p>
        </div>

        {!album ? (
          <div className="rounded-[2rem] bg-[#0d1a17] px-8 py-20 text-center text-[#f2e9d8]">
            <p className="font-serif text-4xl">
              Music is coming.
            </p>

            <p className="mt-4 text-sm text-[#f2e9d8]/50">
              New releases from De Voice will appear here.
            </p>

            <Link
              href="/music"
              className="mt-8 inline-flex rounded-full bg-[#f2e9d8] px-7 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#0d1a17]"
            >
              Explore Music
            </Link>
          </div>
        ) : (
          <div className="grid overflow-hidden rounded-[2rem] bg-[#0d1a17] lg:grid-cols-[0.9fr_1.1fr]">
            {/* Album artwork */}
            <div className="relative aspect-square min-h-[360px] overflow-hidden bg-[#16241f] lg:aspect-auto lg:min-h-[620px]">
              {isValidImageUrl(album.artworkUrl) ? (
                <Image
                  src={album.artworkUrl}
                  alt={album.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-[#c9a24b]/40 bg-[#101d19] shadow-2xl sm:h-80 sm:w-80">
                    <div className="absolute inset-5 rounded-full border border-[#c9a24b]/20" />
                    <div className="absolute inset-12 rounded-full border border-[#c9a24b]/10" />

                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.4em] text-[#c9a24b]">
                        De Voice
                      </p>

                      <p className="mt-3 font-serif text-4xl text-[#f2e9d8] sm:text-5xl">
                        {album.title}
                      </p>

                      <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[#f2e9d8]/40">
                        {album.releaseDate.getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,75,0.14),transparent_55%)]" />

              <div className="absolute bottom-8 left-8 text-[10px] uppercase tracking-[0.35em] text-[#f2e9d8]/40">
                {album.title}
              </div>
            </div>

            {/* Album information */}
            <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#c9a24b]">
                  Released ·{" "}
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(album.releaseDate)}
                </p>

                <h3 className="mt-6 font-serif text-4xl text-[#f2e9d8] sm:text-5xl">
                  {album.title}
                </h3>

                <p className="mt-6 max-w-xl text-base leading-7 text-[#f2e9d8]/65">
                  A debut album built around vocal expression — moving through
                  soul, jazz, R&amp;B, blues and gospel with Jonathan&apos;s
                  signature high register and melismatic style.
                </p>
              </div>

              {/* Tracks */}
              {album.songs.length > 0 && (
                <div className="mt-12">
                  <div className="border-t border-[#f2e9d8]/15">
                    {album.songs.slice(0, 5).map((song, index) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between border-b border-[#f2e9d8]/15 py-5"
                      >
                        <div className="flex items-center gap-5">
                          <span className="text-xs text-[#c9a24b]/60">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <div>
                            <p className="font-serif text-xl text-[#f2e9d8]">
                              {song.title}
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#f2e9d8]/35">
                              {album.title}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs text-[#f2e9d8]/35">
                          {song.releaseDate.getFullYear()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
        )}
      </div>
    </section>
  );
}