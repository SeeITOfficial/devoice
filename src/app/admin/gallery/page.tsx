import { prisma } from "@/lib/prisma";

export default async function AdminGalleryPage() {
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

  const itemCount = categories.reduce(
    (total, category) => total + category.items.length,
    0
  );

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
              Gallery
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
              Manage photographs, appearances and visual media.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/gallery/categories/new"
              className="rounded-full border border-[#0d1a17]/15 px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:border-[#c9a24b]"
            >
              New Category
            </a>

            <a
              href="/admin/gallery/new"
              className="rounded-full bg-[#0d1a17] px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#f2e9d8]"
            >
              Add Media
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] bg-[#0d1a17] p-6 text-[#f2e9d8]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#f2e9d8]/40">
              Categories
            </p>

            <p className="mt-3 font-serif text-4xl">
              {categories.length}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[#0d1a17]/10 bg-white/50 p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
              Media items
            </p>

            <p className="mt-3 font-serif text-4xl">
              {itemCount}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {categories.length === 0 && (
          <div className="mt-10 rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 p-16 text-center">
            <p className="font-serif text-3xl">
              No gallery categories yet.
            </p>

            <p className="mt-3 text-sm text-[#0d1a17]/50">
              Create a category before adding photographs.
            </p>
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mt-10 space-y-10">
            {categories.map((category) => (
              <section key={category.id}>
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#b18a3b]">
                      Gallery category
                    </p>

                    <h2 className="mt-2 font-serif text-3xl">
                      {category.name}
                    </h2>
                  </div>

                  <span className="text-xs text-[#0d1a17]/40">
                    {category.items.length}{" "}
                    {category.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {category.items.length === 0 ? (
                  <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#0d1a17]/15 p-10 text-center">
                    <p className="text-sm text-[#0d1a17]/40">
                      This category is empty.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {category.items.map((item) => (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-[1.5rem] border border-[#0d1a17]/10 bg-white/50"
                      >
                        <div className="relative aspect-square bg-[#16241f]">
                          {item.type === "IMAGE" ? (
                            <img
                              src={item.thumbnailUrl || item.url}
                              alt={item.title || category.name}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a24b]/50 text-[#c9a24b]">
                                  ▶
                                </div>

                                <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#f2e9d8]/50">
                                  Video
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="absolute left-3 top-3 rounded-full bg-[#0d1a17]/75 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#f2e9d8]">
                            {item.type}
                          </div>
                        </div>

                        <div className="p-5">
                          <p className="font-serif text-xl">
                            {item.title || "Untitled"}
                          </p>

                          <p className="mt-2 truncate text-xs text-[#0d1a17]/40">
                            {item.url}
                          </p>

                          <div className="mt-5 border-t border-[#0d1a17]/10 pt-4">
                            <a
                              href={`/admin/gallery/${item.id}`}
                              className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b18a3b]"
                            >
                              Edit Media →
                            </a>
                          </div>
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
    </main>
  );
}