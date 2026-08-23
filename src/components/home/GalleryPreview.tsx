import Link from "next/link";

const galleryItems = [
  {
    title: "Portraits",
    image: "/hero.jpeg",
    size: "large",
  },
  {
    title: "On Stage",
    image: "/hero.jpeg",
    size: "small",
  },
  {
    title: "Behind the Music",
    image: "/hero.jpeg",
    size: "small",
  },
];

export default function GalleryPreview() {
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
          {/* Large image */}
          <Link
            href="/gallery"
            className="group relative min-h-[520px] overflow-hidden rounded-[1.5rem] bg-[#16241f] md:row-span-2"
          >
            <img
              src={galleryItems[0].image}
              alt={galleryItems[0].title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a17]/80 via-transparent to-transparent" />

            <div className="absolute bottom-7 left-7">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
                Gallery
              </p>

              <h3 className="mt-2 font-serif text-3xl text-[#f2e9d8]">
                {galleryItems[0].title}
              </h3>
            </div>
          </Link>

          {/* Smaller images */}
          {galleryItems.slice(1).map((item) => (
            <Link
              key={item.title}
              href="/gallery"
              className="group relative min-h-[250px] overflow-hidden rounded-[1.5rem] bg-[#16241f]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a17]/75 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6">
                <h3 className="font-serif text-2xl text-[#f2e9d8]">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}