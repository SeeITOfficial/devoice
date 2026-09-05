import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import AlbumCard from "@/components/admin/AlbumCard";

export const dynamic = "force-dynamic";

export default async function AdminMusicPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const albums = await prisma.album.findMany({
    orderBy: { releaseDate: "desc" },
    include: {
      songs: {
        orderBy: { releaseDate: "desc" },
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
            <h1 className="mt-4 font-serif text-6xl leading-none">Music</h1>
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
            <p className="font-serif text-3xl">No albums yet.</p>
            <p className="mt-3 text-sm text-[#0d1a17]/50">
              Add an album to start building the artist's music library.
            </p>
          </div>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <div className="mt-12 space-y-8">
            {albums.map((album) => (
              <AlbumCard key={album.id} initialAlbum={album} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}