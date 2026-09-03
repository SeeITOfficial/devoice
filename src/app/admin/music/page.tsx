import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export default async function AdminMusicPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const albums = await prisma.album.findMany({
    orderBy: {
      releaseDate: "desc",
    },
    include: {
      songs: {
        orderBy: {
          releaseDate: "desc",
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
              Management
            </p>

            <h1 className="mt-4 font-serif text-6xl leading-none">
              Music
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
              Manage albums, songs, artwork and publishing status.
            </p>
          </div>

          <a
            href="/admin/music/new"
            className="rounded-full bg-[#0d1a17] px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#f2e9d8]"
          >
            Add Album
          </a>
        </div>

        {/* Empty state */}
        {albums.length === 0 && (
          <div className="mt-12 rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 p-16 text-center">
            <p className="font-serif text-3xl">
              No albums yet.
            </p>

            <p className="mt-3 text-sm text-[#0d1a17]/50">
              Add an album to start building the artist's music library.
            </p>
          </div>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <div className="mt-12 space-y-8">
            {albums.map((album) => (
              <article
                key={album.id}
                className="overflow-hidden rounded-[2rem] border border-[#0d1a17]/10 bg-white/50"
              >
                <div className="grid lg:grid-cols-[260px_1fr]">
                  {/* Artwork */}
                  <div className="relative aspect-square bg-[#16241f] lg:aspect-auto">
                    {album.artworkUrl ? (
                      <img
                        src={album.artworkUrl}
                        alt={album.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs uppercase tracking-[0.25em] text-[#c9a24b]">
                          No Artwork
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Album */}
                  <div className="p-7 sm:p-9">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
                          album.published
                            ? "bg-[#0d1a17] text-[#f2e9d8]"
                            : "bg-[#0d1a17]/5 text-[#0d1a17]/40"
                        }`}
                      >
                        {album.published ? "Published" : "Draft"}
                      </span>

                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(album.releaseDate)}
                      </span>
                    </div>

                    <h2 className="mt-5 font-serif text-4xl">
                      {album.title}
                    </h2>

                    {/* Songs */}
                    <div className="mt-8 border-t border-[#0d1a17]/10">
                      {album.songs.length === 0 ? (
                        <p className="py-6 text-sm text-[#0d1a17]/40">
                          No songs added to this album.
                        </p>
                      ) : (
                        album.songs.map((song, index) => (
                          <div
                            key={song.id}
                            className="flex items-center justify-between gap-4 border-b border-[#0d1a17]/10 py-5 last:border-b-0"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-[#b18a3b]">
                                {String(index + 1).padStart(2, "0")}
                              </span>

                              <div>
                                <p className="font-serif text-xl">
                                  {song.title}
                                </p>

                                <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#0d1a17]/35">
                                  {song.published
                                    ? "Published"
                                    : "Draft"}
                                </p>
                              </div>
                            </div>

                            <span className="text-xs text-[#0d1a17]/35">
                              {new Intl.DateTimeFormat("en-GB", {
                                year: "numeric",
                              }).format(song.releaseDate)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-7 flex flex-wrap gap-3 border-t border-[#0d1a17]/10 pt-6">
                      <button
                        type="button"
                        className="rounded-full border border-[#0d1a17]/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:border-[#c9a24b]"
                      >
                        Edit Album
                      </button>

                      <a
                        href={`/admin/music/${album.id}/songs/new`}
                        className="rounded-full border border-[#0d1a17]/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:border-[#c9a24b]"
                      >
                        Add Song
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}