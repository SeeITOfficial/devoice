import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export default async function AdminVideosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const videos = await prisma.video.findMany({
    orderBy: {
      createdAt: "desc",
    },
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

            <h1 className="mt-4 font-serif text-6xl leading-none">
              Videos
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
              Manage music videos, performances, interviews and external
              video content.
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
            <p className="font-serif text-3xl">
              No videos yet.
            </p>

            <p className="mt-3 text-sm text-[#0d1a17]/50">
              Add a video to start building the artist's video library.
            </p>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-[2rem] border border-[#0d1a17]/10 bg-white/50"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-[#16241f]">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title || ""}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#c9a24b]/50 text-[#c9a24b]">
                        ▶
                      </div>
                    </div>
                  )}

                  <div className="absolute left-4 top-4 rounded-full bg-[#0d1a17]/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#f2e9d8]">
                    {video.source}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <h2 className="font-serif text-2xl">
                    {video.title || null}
                  </h2>

                  <p className="mt-3 truncate text-xs text-[#0d1a17]/40">
                    {video.videoUrl}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-[#0d1a17]/10 pt-5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#0d1a17]/35">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(video.createdAt)}
                    </span>

                    <a
                      href={`/admin/videos/${video.id}`}
                      className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b18a3b]"
                    >
                      Edit →
                    </a>
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