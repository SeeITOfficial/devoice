import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import VideoCard from "@/components/admin/VideoCard";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
              Management
            </p>

            <h1 className="mt-4 font-serif text-6xl leading-none">Videos</h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
              Manage music videos, performances, interviews and external video content.
              Click Rename or Delete on any video.
            </p>
          </div>

          <a
            href="/admin/videos/new"
            className="rounded-full bg-[#0d1a17] px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#f2e9d8]"
          >
            Add Video
          </a>
        </div>

        {/* Empty state */}
        {videos.length === 0 && (
          <div className="mt-12 rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 p-16 text-center">
            <p className="font-serif text-3xl">No videos yet.</p>
            <p className="mt-3 text-sm text-[#0d1a17]/50">
              Add a video to start building the artist&apos;s video library.
            </p>
          </div>
        )}

        {/* Video grid */}
        {videos.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}