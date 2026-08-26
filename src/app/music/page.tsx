import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MusicPage() {
  const albums = await prisma.album.findMany({
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

  const songs = await prisma.song.findMany({
    where: {
      published: true,
    },
    orderBy: {
      releaseDate: "desc",
    },
    include: {
      album: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#f2e9d8] text-[#0d1a17]">
      {/* Header */}
      <section className="px-6 pb-16 pt-24 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            De Voice · Da Diva
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">
            The Music
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-[#0d1a17]/60 sm:text-lg">
            Soul, R&amp;B, jazz, blues and gospel — shaped by voice,
            expression and a signature high register.
          </p>
        </div>
      </section>

      {/* Albums */}
      {albums.length > 0 && (
        <section className="px-6 pb-20 sm:px-10 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
                  Releases
                </p>

                <h2 className="mt-2 font-serif text-4xl">
                  Albums
                </h2>
              </div>

              <span className="text-xs text-[#0d1a17]/40">
                {albums.length}{" "}
                {albums.length === 1 ? "release" : "releases"}
              </span>
            </div>

            <div className="space-y-10">
              {albums.map((album) => (
                <article
                  key={album.id}
                  className="overflow-hidden rounded-[2rem] bg-[#0d1a17] text-[#f2e9d8]"
                >
                  <div className="grid md:grid-cols-[360px_1fr]">
                    {/* Artwork */}
                    <div className="relative aspect-square overflow-hidden bg-[#16241f] md:aspect-auto">
                      {album.artworkUrl ? (
                        <img
                          src={album.artworkUrl}
                          alt={album.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
                            Artwork
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Album information */}
                    <div className="p-8 sm:p-10 lg:p-12">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a24b]">
                        Album
                      </p>

                      <h3 className="mt-4 font-serif text-5xl leading-none sm:text-6xl">
                        {album.title}
                      </h3>

                      <p className="mt-5 text-sm text-[#f2e9d8]/50">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(album.releaseDate)}
                      </p>

                      {/* Tracklist */}
                      {album.songs.length > 0 && (
                        <div className="mt-10 border-t border-[#f2e9d8]/10">
                          {album.songs.map((song, index) => (
                            <div
                              key={song.id}
                              className="flex items-center gap-4 border-b border-[#f2e9d8]/10 py-5"
                            >
                              <span className="w-6 text-xs text-[#c9a24b]">
                                {String(index + 1).padStart(2, "0")}
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {song.title}
                                </p>
                              </div>

                              <Link
                                href={`/music/${song.id}`}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c9a24b]/40 text-[#c9a24b] transition-colors hover:bg-[#c9a24b] hover:text-[#0d1a17]"
                                aria-label={`Play ${song.title}`}
                              >
                                ▶
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Singles / all songs */}
      {songs.length > 0 && (
        <section className="px-6 pb-24 sm:px-10 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
                Catalogue
              </p>

              <h2 className="mt-2 font-serif text-4xl">
                All Music
              </h2>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[#0d1a17]/10 bg-white/40">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-5 border-b border-[#0d1a17]/10 px-6 py-5 last:border-0 sm:px-8"
                >
                  <span className="w-8 text-xs text-[#b18a3b]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {song.artworkUrl && (
                    <img
                      src={song.artworkUrl}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {song.title}
                    </p>

                    {song.album && (
                      <p className="mt-1 truncate text-xs text-[#0d1a17]/40">
                        {song.album.title}
                      </p>
                    )}
                  </div>

                  <span className="hidden text-xs text-[#0d1a17]/35 sm:block">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(song.releaseDate)}
                  </span>

                  <a
                    href={song.audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d1a17] text-xs text-[#f2e9d8] transition-transform hover:scale-105"
                    aria-label={`Listen to ${song.title}`}
                  >
                    ▶
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {albums.length === 0 && songs.length === 0 && (
        <section className="px-6 pb-24 sm:px-10 lg:px-20">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 px-6 py-20 text-center">
            <p className="font-serif text-4xl">
              Music is coming.
            </p>

            <p className="mt-4 text-sm text-[#0d1a17]/50">
              New releases from De Voice will appear here.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}