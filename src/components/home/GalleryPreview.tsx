import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function GalleryPreview() {
  const items = await prisma.galleryItem.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
    include: {
      category: true,
    },
  });

  return (
    <section className="bg-[#f2e9d8] px-6 py-24 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
              Behind De Voice
            </p>

            <h2 className="font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
              The
              <br />
              Gallery
            </h2>
          </div>

          <Link
            href="/gallery"
            className="w-fit rounded-full border border-[#0d1a17]/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:border-[#b18a3b] hover:bg-[#b18a3b]/10"
          >
            View Gallery
          </Link>
        </div>

        {/* Gallery */}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {items.length === 0 ? (
            <div className="rounded-[1.5rem] bg-[#16241f] px-8 py-20 text-center md:col-span-2">
              <p className="font-serif text-3xl text-[#f2e9d8]">
                The gallery is coming.
              </p>

              <p className="mt-3 text-sm text-[#f2e9d8]/45">
                Photos and moments from De Voice will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Large image */}
              {items[0] && (
                <Link
                  href="/gallery"
                  className="group relative min-h-[520px] overflow-hidden rounded-[1.5rem] bg-[#16241f] md:row-span-2"
                >
                  {items[0].type === "IMAGE" ? (
                    <img
                      src={items[0].url}
                      alt={items[0].title ?? items[0].category.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={items[0].url}
                      poster={items[0].thumbnailUrl ?? undefined}
                      muted
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a17]/80 via-transparent to-transparent" />

                  <div className="absolute bottom-7 left-7">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
                      {items[0].category.name}
                    </p>

                    <h3 className="mt-2 font-serif text-3xl text-[#f2e9d8]">
                      {items[0].title ?? "Gallery"}
                    </h3>
                  </div>
                </Link>
              )}

              {/* Smaller images */}
              {items.slice(1).map((item) => (
                <Link
                  key={item.id}
                  href="/gallery"
                  className="group relative min-h-[250px] overflow-hidden rounded-[1.5rem] bg-[#16241f]"
                >
                  {item.type === "IMAGE" ? (
                    <img
                      src={item.url}
                      alt={item.title ?? item.category.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={item.url}
                      poster={item.thumbnailUrl ?? undefined}
                      muted
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a17]/75 via-transparent to-transparent" />

                  <div className="absolute bottom-6 left-6">
                    <p className="mb-1 text-[9px] uppercase tracking-[0.25em] text-[#c9a24b]">
                      {item.category.name}
                    </p>

                    <h3 className="font-serif text-2xl text-[#f2e9d8]">
                      {item.title ?? "Gallery"}
                    </h3>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}