import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function GalleryPage() {
  const categories = await prisma.galleryCategory.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      items: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

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
          {categories.length === 0 ? (
            <div className="rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 px-6 py-20 text-center">
              <p className="font-serif text-4xl">
                The gallery is coming.
              </p>

              <p className="mt-4 text-sm text-[#0d1a17]/50">
                Photos and videos from De Voice will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-20">
              {categories.map((category) => (
                <section key={category.id}>
                  {/* Category heading */}
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

                  {category.items.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-[#0d1a17]/15 px-6 py-12 text-center">
                      <p className="text-sm text-[#0d1a17]/40">
                        No media in this collection yet.
                      </p>
                    </div>
                  ) : (
                    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
                      {category.items.map((item) => (
                        <article
                          key={item.id}
                          className="mb-5 break-inside-avoid overflow-hidden rounded-[1.5rem] bg-[#16241f]"
                        >
                          <div className="relative">
                            {item.type === "IMAGE" ? (
                              <div className="relative">
                                <Image
                                  src={item.url}
                                  alt={item.title ?? category.name}
                                  width={1200}
                                  height={1200}
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  className="block h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                                />

                                {item.title && (
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-5 pb-5 pt-12">
                                    <p className="text-sm font-medium text-white">
                                      {item.title}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <video
                                  src={item.url}
                                  poster={item.thumbnailUrl ?? undefined}
                                  controls
                                  preload="metadata"
                                  playsInline
                                  className="block w-full"
                                />

                                {item.title && (
                                  <div className="bg-[#0d1a17] px-5 py-4">
                                    <p className="text-sm font-medium text-[#f2e9d8]">
                                      {item.title}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}