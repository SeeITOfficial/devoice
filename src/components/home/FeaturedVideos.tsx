"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type VideoSource = "UPLOAD" | "EXTERNAL";

type Video = {
  id: string;
  title: string | null;
  thumbnailUrl: string | null;
  videoUrl: string;
  source: VideoSource;
};

function getYouTubeId(url: string) {
  const m =
    url.match(/[?&]v=([^&]+)/) ??
    url.match(/youtu\.be\/([^?]+)/) ??
    url.match(/youtube\.com\/embed\/([^?]+)/);
  return m ? m[1] : null;
}

function getVimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function VideoTile({
  video,
  featured,
}: {
  video: Video;
  featured: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const youtubeId = getYouTubeId(video.videoUrl);
  const vimeoId = getVimeoId(video.videoUrl);
  const isEmbed = !!(youtubeId || vimeoId);

  function getEmbedSrc() {
    if (youtubeId)
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
    if (vimeoId)
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    return "";
  }

  function handleClick() {
    if (video.source === "UPLOAD" && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    } else if (isEmbed) {
      setPlaying(true);
    }
  }

  const thumbnailBg = video.thumbnailUrl
    ? `url(${video.thumbnailUrl})`
    : undefined;

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.5rem] bg-[#16241f] ${featured ? "aspect-video" : "min-h-[220px]"}`}
      style={
        video.thumbnailUrl && !playing
          ? {
              backgroundImage: thumbnailBg,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Radial glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,75,0.12),transparent_60%)]" />

      {/* UPLOAD: native video */}
      {video.source === "UPLOAD" && !playing && (
        <>
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnailUrl ?? undefined}
            preload="metadata"
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            className={`absolute inset-0 h-full w-full object-cover ${video.thumbnailUrl ? "opacity-0" : ""}`}
          />
          <button
            type="button"
            aria-label="Play video"
            onClick={handleClick}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className={`flex items-center justify-center rounded-full border border-[#c9a24b]/60 bg-[#0d1a17]/70 text-[#c9a24b] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 ${featured ? "h-20 w-20" : "h-14 w-14"}`}
            >
              <svg
                width={featured ? 20 : 16}
                height={featured ? 20 : 16}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </div>
          </button>
        </>
      )}

      {/* UPLOAD playing: show controls */}
      {video.source === "UPLOAD" && playing && (
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl ?? undefined}
          preload="metadata"
          playsInline
          autoPlay
          controls
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="absolute inset-0 h-full w-full object-contain bg-black"
        />
      )}

      {/* EXTERNAL: iframe on click */}
      {video.source === "EXTERNAL" && !playing && (
        <button
          type="button"
          aria-label="Play video"
          onClick={handleClick}
          className="absolute inset-0 flex items-center justify-center"
        >
          {youtubeId && !video.thumbnailUrl && (
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
              alt={video.title ?? "Video thumbnail"}
              className="absolute inset-0 h-full w-full object-cover opacity-70"
            />
          )}
          <div
            className={`relative flex items-center justify-center rounded-full border border-[#c9a24b]/60 bg-[#0d1a17]/70 text-[#c9a24b] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 ${featured ? "h-20 w-20" : "h-14 w-14"}`}
          >
            <svg
              width={featured ? 20 : 16}
              height={featured ? 20 : 16}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </div>
        </button>
      )}

      {video.source === "EXTERNAL" && playing && (
        <iframe
          src={getEmbedSrc()}
          title={video.title ?? "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}

      {/* Label overlay */}
      {!playing && video.title && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1a17] to-transparent ${featured ? "via-[#0d1a17]/60 p-7" : "p-6"}`}
        >
          <h3
            className={`font-serif ${featured ? "text-3xl sm:text-4xl" : "text-2xl"}`}
          >
            {video.title}
          </h3>
        </div>
      )}
    </article>
  );
}

export default function FeaturedVideos({
  videos,
}: {
  videos: Video[];
}) {
  if (videos.length === 0) return null;

  const [featured, ...rest] = videos;

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
          <VideoTile video={featured} featured={true} />

          {rest.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {rest.slice(0, 2).map((video) => (
                <VideoTile
                  key={video.id}
                  video={video}
                  featured={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}