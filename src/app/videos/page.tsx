import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function isValidUrl(url: string | null | undefined) {
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

function isYouTubeUrl(url: string) {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  );
}

function isVimeoUrl(url: string) {
  return url.includes("vimeo.com");
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    const videoId = parsed.searchParams.get("v");

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  } catch {
    return url;
  }
}

function getVimeoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const id = parsed.pathname.split("/").filter(Boolean).pop();

    if (id) {
      return `https://player.vimeo.com/video/${id}`;
    }

    return url;
  } catch {
    return url;
  }
}

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

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
          {videos.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif text-4xl">
                Videos are coming.
              </p>

              <p className="mt-4 text-sm text-[#f2e9d8]/45">
                Performances and music videos from De Voice will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-8">
              {videos.map((video, index) => {
                const validVideoUrl = isValidUrl(video.videoUrl);
                const youtube = validVideoUrl
                  ? isYouTubeUrl(video.videoUrl)
                  : false;
                const vimeo = validVideoUrl
                  ? isVimeoUrl(video.videoUrl)
                  : false;

                return (
                  <article
                    key={video.id}
                    className={`grid overflow-hidden rounded-[2rem] bg-[#16241f] ${
                      index === 0
                        ? "lg:grid-cols-[1.5fr_1fr]"
                        : "lg:grid-cols-[1fr_1fr]"
                    }`}
                  >
                    {/* Video */}
                    <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[#111d19]">
                      {video.source === "UPLOAD" &&
                      validVideoUrl ? (
                        <video
                          src={video.videoUrl}
                          poster={
                            video.thumbnailUrl || undefined
                          }
                          controls
                          preload="metadata"
                          playsInline
                          className="w-full h-auto max-h-[70vh] object-contain"
                        />
                      ) : youtube ? (
                        <div className="w-full aspect-video">
                          <iframe
                            src={getYouTubeEmbedUrl(
                              video.videoUrl
                            )}
                            title={video.title || "Video"}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      ) : vimeo ? (
                        <div className="w-full aspect-video">
                          <iframe
                            src={getVimeoEmbedUrl(
                              video.videoUrl
                            )}
                            title={video.title || "Video"}
                            className="h-full w-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isValidUrl(
                            video.thumbnailUrl
                          ) ? (
                            <Image
                              src={video.thumbnailUrl!}
                              alt={video.title || "Thumbnail"}
                              fill
                              sizes="(max-width: 1024px) 100vw, 60vw"
                              className="object-contain opacity-60"
                            />
                          ) : null}

                          <div className="relative z-10 text-center">
                            <p className="text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
                              Video unavailable
                            </p>
                          </div>
                        </div>
                      )}

                      <span className="pointer-events-none absolute left-6 top-6 z-10 text-[10px] uppercase tracking-[0.3em] text-[#c9a24b]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Information */}
                    <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                      <p className="text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
                        {video.source === "UPLOAD"
                          ? "Video"
                          : "External Video"}
                      </p>

                      <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
                        {video.title || null}
                      </h2>

                      <p className="mt-5 max-w-md text-sm leading-7 text-[#f2e9d8]/55">
                        Watch performances, music videos and
                        moments from De Voice.
                      </p>

                      <div className="mt-8">
                        {video.source === "UPLOAD" ? (
                          <a
                            href={video.videoUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-full bg-[#f2e9d8]/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#f2e9d8] transition-colors hover:bg-[#c9a24b] hover:text-[#0d1a17]"
                          >
                            Download Video
                          </a>
                        ) : (
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-full border border-[#f2e9d8]/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#f2e9d8] transition-colors hover:border-[#c9a24b] hover:text-[#c9a24b]"
                          >
                            Watch Original
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
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