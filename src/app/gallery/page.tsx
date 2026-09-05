import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

function getYouTubeEmbedUrl(url: string) {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

function getVimeoEmbedUrl(url: string) {
  const id = getVimeoId(url);
  return id ? `https://player.vimeo.com/video/${id}` : url;
}

export default async function GalleryPage() {
  const categories = await prisma.galleryCategory.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      items: { orderBy: { createdAt: "desc" } },
    },
  });

  // Items with no category — filter in JS after fetching all
  const allItems = await prisma.galleryItem.findMany({
    orderBy: { createdAt: "desc" },
  });
  const uncategorized = allItems.filter((item) => !item.categoryId);

  const hasContent =
    categories.some((c) => c.items.length > 0) ||
    uncategorized.length > 0;

  return (
    <main className="min-h-screen bg-[#f2e9d8] text-[#0d1a17]">
      {/* Header */}
      <section className="px-6 pb-16 pt-24 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Behind the voice
          </p>

          <h1 className="mt-5 font-serif text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">
            Gallery
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-[#0d1a17]/60 sm:text-lg">
            Moments from the music, the stage and the journey of De Voice.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6 pb-24 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          {!hasContent ? (
            <div className="rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 px-6 py-20 text-center">
              <p className="font-serif text-4xl">The gallery is coming.</p>
              <p className="mt-4 text-sm text-[#0d1a17]/50">
                Photos and videos from De Voice will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-20">
              {/* Categorized sections */}
              {categories
                .filter((c) => c.items.length > 0)
                .map((category) => (
                  <section key={category.id}>
                    <div className="mb-8 flex items-end justify-between gap-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
                          Collection
                        </p>
                        <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
                          {category.name}
                        </h2>
                      </div>
                      <span className="hidden text-xs text-[#0d1a17]/35 sm:block">
                        {category.items.length}{" "}
                        {category.items.length === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <GalleryGrid items={category.items} />
                  </section>
                ))}

              {/* Uncategorized */}
              {uncategorized.length > 0 && (
                <section>
                  <div className="mb-8 flex items-end justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b18a3b]">
                        Collection
                      </p>
                      <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
                        All Media
                      </h2>
                    </div>
                    <span className="hidden text-xs text-[#0d1a17]/35 sm:block">
                      {uncategorized.length}{" "}
                      {uncategorized.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <GalleryGrid items={uncategorized} />
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

type GalleryItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
};

function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="mb-5 break-inside-avoid overflow-hidden rounded-[1.5rem] bg-[#16241f]"
        >
          {item.type === "IMAGE" ? (
            <div className="relative">
              <Image
                src={item.url}
                alt={item.title ?? "Gallery photo"}
                width={1200}
                height={1200}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="block h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
              {item.title && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-5 pb-5 pt-12">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                </div>
              )}
            </div>
          ) : (
            <GalleryVideo item={item} />
          )}
        </article>
      ))}
    </div>
  );
}

function GalleryVideo({ item }: { item: GalleryItem }) {
  const youtubeId = getYouTubeId(item.url);
  const vimeoId = getVimeoId(item.url);
  const isEmbed = !!(youtubeId || vimeoId);

  return (
    <div>
      {isEmbed ? (
        <div className="aspect-video w-full">
          <iframe
            src={
              youtubeId
                ? getYouTubeEmbedUrl(item.url)
                : getVimeoEmbedUrl(item.url)
            }
            title={item.title ?? "Video"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <video
          src={item.url}
          poster={item.thumbnailUrl ?? undefined}
          controls
          preload="metadata"
          playsInline
          className="block w-full"
        />
      )}

      {item.title && (
        <div className="bg-[#0d1a17] px-5 py-4">
          <p className="text-sm font-medium text-[#f2e9d8]">{item.title}</p>
        </div>
      )}
    </div>
  );
}