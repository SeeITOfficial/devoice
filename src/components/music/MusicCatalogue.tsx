"use client";

import Image from "next/image";
import { useState } from "react";
import AudioPlayer from "@/components/music/AudioPlayer";

export type MusicAlbum = {
  id: string;
  title: string;
  artworkUrl: string | null;
  releaseDate: string;
};

export type MusicSong = {
  id: string;
  title: string;
  audioUrl: string;
  artworkUrl: string | null;
  releaseDate: string;
  album: {
    id: string;
    title: string;
    artworkUrl: string | null;
  } | null;
};

type MusicCatalogueProps = {
  albums: MusicAlbum[];
  songs: MusicSong[];
};

function isValidImageUrl(url: string | null | undefined) {
  if (!url || !url.trim()) {
    return false;
  }

  if (url.trim().startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", options).format(new Date(date));
}

export default function MusicCatalogue({
  albums,
  songs,
}: MusicCatalogueProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const selectedAlbum = albums.find((album) => album.id === selectedAlbumId);
  const visibleSongs = selectedAlbumId
    ? songs.filter((song) => song.album?.id === selectedAlbumId)
    : songs;

  async function handleDownloadSong(
    audioUrl: string,
    title: string,
    id?: string
  ) {
    if (id) setDownloadingId(id);
    try {
      const downloadEndpoint = `/api/music/download?url=${encodeURIComponent(
        audioUrl
      )}&title=${encodeURIComponent(title)}`;

      const response = await fetch(downloadEndpoint);
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = blobUrl;

      const extMatch = audioUrl.split("?")[0].match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i);
      const ext = extMatch ? extMatch[1] : "mp3";
      const safeTitle = title.replace(/[/\\?%*:|"<>]/g, "_").trim() || "song";
      link.download = safeTitle.toLowerCase().endsWith(`.${ext.toLowerCase()}`)
        ? safeTitle
        : `${safeTitle}.${ext}`;

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 200);
    } catch (error) {
      console.error("Direct blob download error, triggering native download:", error);
      const fallbackEndpoint = `/api/music/download?url=${encodeURIComponent(
        audioUrl
      )}&title=${encodeURIComponent(title)}`;
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = fallbackEndpoint;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 200);
    } finally {
      if (id) setDownloadingId(null);
    }
  }

  return (
    <>
      {albums.length > 0 && (
        <section className="px-6 pb-20 sm:px-10 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
                  Releases
                </p>

                <h2 className="mt-2 font-serif text-4xl">Albums</h2>
              </div>

              <span className="text-xs text-[#0d1a17]/40">
                {albums.length} {albums.length === 1 ? "release" : "releases"}
              </span>
            </div>

            <div className="space-y-10">
              {albums.map((album, index) => {
                const selected = album.id === selectedAlbumId;

                return (
                  <button
                    key={album.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedAlbumId(selected ? null : album.id)}
                    className={`group grid w-full overflow-hidden rounded-[2rem] bg-[#0d1a17] text-left text-[#f2e9d8] transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b18a3b] ${
                      selected
                        ? "ring-2 ring-[#c9a24b]"
                        : "hover:ring-2 hover:ring-[#c9a24b]/60"
                    } md:grid-cols-[360px_1fr]`}
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#16241f] md:aspect-auto">
                      {isValidImageUrl(album.artworkUrl) ? (
                        <Image
                          src={album.artworkUrl as string}
                          alt={album.title}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 768px) 100vw, 360px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
                            Artwork
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-8 sm:p-10 lg:p-12">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a24b]">
                        Album {selected && "· Selected"}
                      </p>

                      <h3 className="mt-4 font-serif text-5xl leading-none sm:text-6xl">
                        {album.title}
                      </h3>

                      <p className="mt-5 text-sm text-[#f2e9d8]/50">
                        {formatDate(album.releaseDate, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {songs.length > 0 && (
        <section className="px-6 pb-24 sm:px-10 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
                  Catalogue
                </p>

                <h2 className="mt-2 font-serif text-4xl">
                  {selectedAlbum ? selectedAlbum.title : "All Music"}
                </h2>

                {selectedAlbum && (
                  <p className="mt-2 text-sm text-[#0d1a17]/45">
                    {visibleSongs.length} {visibleSongs.length === 1 ? "song" : "songs"}
                  </p>
                )}
              </div>

              {selectedAlbum && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Download all ${visibleSongs.length} songs from this album?`)) {
                        for (const song of visibleSongs) {
                          await handleDownloadSong(song.audioUrl, song.title, song.id);
                          await new Promise((resolve) => setTimeout(resolve, 500));
                        }
                      }
                    }}
                    className="flex items-center gap-2 rounded-full bg-[#c9a24b] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0d1a17] transition-colors hover:bg-[#b18a3b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b18a3b]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Album
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAlbumId(null)}
                    className="rounded-full border border-[#0d1a17]/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:border-[#b18a3b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b18a3b]"
                  >
                    ← All Music
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[#0d1a17]/10 bg-white/40">
              {visibleSongs.length > 0 ? (
                visibleSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="border-b border-[#0d1a17]/10 px-6 py-5 last:border-0 sm:px-8"
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <span className="w-8 shrink-0 text-xs text-[#b18a3b]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {isValidImageUrl(song.artworkUrl ?? song.album?.artworkUrl) && (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={(song.artworkUrl ?? song.album?.artworkUrl) as string}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{song.title}</p>

                        {song.album && (
                          <p className="mt-1 truncate text-xs text-[#0d1a17]/40">
                            {song.album.title}
                          </p>
                        )}
                      </div>

                      <span className="hidden shrink-0 text-xs text-[#0d1a17]/35 sm:block">
                        {formatDate(song.releaseDate, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="mt-4 pl-12 sm:pl-13 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <AudioPlayer audioUrl={song.audioUrl} title={song.title} />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadSong(song.audioUrl, song.title, song.id)}
                        disabled={downloadingId === song.id}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d1a17]/5 text-[#0d1a17]/60 transition-colors hover:bg-[#0d1a17]/10 hover:text-[#0d1a17] disabled:opacity-60"
                        title={`Download ${song.title}`}
                        aria-label={`Download ${song.title}`}
                      >
                        {downloadingId === song.id ? (
                          <svg
                            className="h-4 w-4 animate-spin text-[#b18a3b]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-6 py-12 text-center text-sm text-[#0d1a17]/50 sm:px-8">
                  No published songs in this album yet.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}