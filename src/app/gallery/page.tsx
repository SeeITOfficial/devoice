const galleryItems = [
  {
    title: "De Voice",
    category: "Portraits",
    image: "/hero.jpeg",
    size: "large",
  },
  {
    title: "On Stage",
    category: "Performance",
    image: "/hero.jpeg",
    size: "normal",
  },
  {
    title: "The Artist",
    category: "Portraits",
    image: "/hero.jpeg",
    size: "normal",
  },
  {
    title: "Behind the Music",
    category: "Behind the Scenes",
    image: "/hero.jpeg",
    size: "normal",
  },
  {
    title: "Da Diva",
    category: "Portraits",
    image: "/hero.jpeg",
    size: "normal",
  },
];

export default function GalleryPage() {
  return (
    <main className="bg-[#f2e9d8] text-[#0d1a17]">
      {/* Header */}
      <section className="px-6 pb-20 pt-28 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
            Visuals
          </p>

          <h1 className="font-serif text-6xl leading-[0.9] tracking-tight sm:text-7xl lg:text-9xl">
            The
            <br />
            Gallery
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-[#0d1a17]/60 sm:text-lg">
            Portraits, performances and moments from the world of De Voice.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6 pb-24 sm:px-10 lg:px-20">
        <div className="mx-auto grid max-w-[1440px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className={`group relative overflow-hidden rounded-[1.5rem] bg-[#16241f] ${
                index === 0
                  ? "min-h-[620px] sm:col-span-2 lg:col-span-2 lg:row-span-2"
                  : "min-h-[300px]"
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a17]/85 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a24b]">
                  {item.category}
                </p>

                <h2 className="mt-2 font-serif text-3xl text-[#f2e9d8]">
                  {item.title}
                </h2>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="bg-[#0d1a17] px-6 py-24 text-center text-[#f2e9d8] sm:px-10">
        <p className="text-xs uppercase tracking-[0.35em] text-[#c9a24b]">
          De Voice
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
          Every moment tells part of the story.
        </h2>
      </section>
    </main>
  );
}