import { prisma } from "@/lib/prisma";
import MusicCatalogue, {
  type MusicAlbum,
  type MusicSong,
} from "@/components/music/MusicCatalogue";

export const dynamic = "force-dynamic";

function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  
  const trimmed = url.trim();
  if (!trimmed) return false;
  
  // Check if it's a local path
  if (trimmed.startsWith("/")) return true;
  
  // Check if it's a valid absolute URL
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default async function MusicPage() {
  const albums = await prisma.album.findMany({
    where: {
      published: true,
    },
    orderBy: {
      releaseDate: "desc",
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

  const albumCards: MusicAlbum[] = albums.map((album) => ({
    id: album.id,
    title: album.title,
    artworkUrl: album.artworkUrl,
    releaseDate: album.releaseDate.toISOString(),
  }));

  const catalogueSongs: MusicSong[] = songs.map((song) => ({
    id: song.id,
    title: song.title,
    audioUrl: song.audioUrl,
    artworkUrl: song.artworkUrl,
    releaseDate: song.releaseDate.toISOString(),
    album: song.album
      ? {
          id: song.album.id,
          title: song.album.title,
          artworkUrl: song.album.artworkUrl,
        }
      : null,
  }));

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

      {(albums.length > 0 || songs.length > 0) && (
        <MusicCatalogue albums={albumCards} songs={catalogueSongs} />
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