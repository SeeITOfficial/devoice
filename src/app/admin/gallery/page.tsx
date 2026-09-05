import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import GalleryItemCard from "@/components/admin/GalleryItemCard";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const categories = await prisma.galleryCategory.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      items: { orderBy: { createdAt: "desc" } },
    },
  });

  const allItems = await prisma.galleryItem.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const uncategorized = allItems.filter((item) => !item.categoryId);
  const totalCount = allItems.length;

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
              Management
            </p>

            <h1 className="mt-4 font-serif text-6xl leading-none">Gallery</h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
              Manage photographs, appearances and visual media. Click Rename or Delete on any item.
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
            <p className="mt-3 font-serif text-4xl">{categories.length}</p>
          </div>

          <div className="rounded-[1.5rem] border border-[#0d1a17]/10 bg-white/50 p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
              Media items
            </p>
            <p className="mt-3 font-serif text-4xl">{totalCount}</p>
          </div>
        </div>

        {totalCount === 0 && (
          <div className="mt-10 rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 p-16 text-center">
            <p className="font-serif text-3xl">No gallery media yet.</p>
            <p className="mt-3 text-sm text-[#0d1a17]/50">
              Add images or videos to get started.
            </p>
          </div>
        )}

        {/* Categorised sections */}
        {categories.filter((c) => c.items.length > 0).length > 0 && (
          <div className="mt-10 space-y-10">
            {categories
              .filter((c) => c.items.length > 0)
              .map((category) => (
                <section key={category.id}>
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#b18a3b]">
                        Gallery category
                      </p>
                      <h2 className="mt-2 font-serif text-3xl">{category.name}</h2>
                    </div>
                    <span className="text-xs text-[#0d1a17]/40">
                      {category.items.length}{" "}
                      {category.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {category.items.map((item) => (
                      <GalleryItemCard
                        key={item.id}
                        item={{ ...item, category: { name: category.name } }}
                      />
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}

        {/* Uncategorised */}
        {uncategorized.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#b18a3b]">
                  No category
                </p>
                <h2 className="mt-2 font-serif text-3xl">Uncategorised</h2>
              </div>
              <span className="text-xs text-[#0d1a17]/40">
                {uncategorized.length}{" "}
                {uncategorized.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {uncategorized.map((item) => (
                <GalleryItemCard key={item.id} item={{ ...item, category: null }} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}