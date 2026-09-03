import Link from "next/link";

type HeroProps = {
  name: string;
  tagline: string | null;
  image?: string | null;
};

export default function Hero({ name, tagline, image }: HeroProps) {
  const nameParts = name.trim().split(" ");
  const firstLine = nameParts.slice(0, 2).join(" ");
  const secondLine = nameParts.slice(2).join(" ");

  return (
    <section className="relative overflow-hidden bg-[#0d1a17] text-[#f2e9d8]">
      {/* film grain */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] mix-blend-overlay">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      <div className="grid min-h-[calc(100vh-5rem)] md:grid-cols-[55fr_45fr]">
        {/* Content */}
        <div className="relative z-10 order-last flex items-center px-6 py-16 sm:px-10 md:order-first lg:px-20">
          <div className="relative max-w-xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.4em] text-[#c9a24b]">
              {tagline || "De Voice · Da Diva"}
            </p>

            <h1
              className="text-[3.25rem] font-medium leading-[0.92] tracking-tight sm:text-6xl lg:text-[5.5rem]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              <span className="block">{firstLine}</span>
              {secondLine && <span className="block">{secondLine}</span>}
            </h1>

            {/* ornate divider */}
            <div className="my-8 flex items-center justify-start gap-0 text-[#c9a24b]">
            <svg width="220" height="24" viewBox="0 0 220 24" fill="none">
                {/* left line, tapered */}
                <path d="M0 12 H70" stroke="currentColor" strokeWidth="1" opacity="0.7" />
                {/* left curl */}
                <path
                d="M70 12c6-8 14-8 14 0s-8 8-14 0"
                stroke="currentColor"
                
                strokeWidth="1"
                fill="none"
                opacity="0.9"
                />
                {/* center diamond */}
                <path
                d="M110 4 L118 12 L110 20 L102 12 Z"
                fill="currentColor"
                />
                {/* right curl */}
                <path
                d="M150 12c-6-8-14-8-14 0s8 8 14 0"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.9"
                />
                {/* right line, tapered */}
                <path d="M150 12 H220" stroke="currentColor" strokeWidth="1" opacity="0.7" />
            </svg>
            </div>
            <p className="max-w-md text-[1.05rem] leading-[1.7] text-[#f2e9d8]/80">
              A voice shaped by soul, R&amp;B, jazz, blues and gospel. Known
              for remarkable vocal range, melisma and a signature high
              register.
            </p>

            <div className="mt-10 flex w-full gap-4">
              <Link
                href="/music"
                className="group flex flex-1 items-center justify-center gap-3 rounded-full bg-[#f2e9d8] py-4 pl-4 pr-6 text-sm font-bold uppercase tracking-wide text-[#0d1a17] transition-transform hover:scale-[1.02]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d1a17] text-[#f2e9d8]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" opacity="0.25" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
                Listen to Music
              </Link>

              <Link
                href="/book"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#c9a24b]/60 px-6 py-4 text-sm font-bold uppercase tracking-wide text-[#c9a24b] transition-colors hover:bg-[#c9a24b]/10"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 256 256"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <circle cx="128" cy="52" r="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                  <circle cx="220" cy="80" r="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                  <circle cx="36" cy="80" r="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                  <polyline points="120.02 70.35 88 144 48.61 95.52" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                  <polyline points="207.39 95.52 168 144 135.98 70.35" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                  <path d="M39.29,99.73l15.6,93.59A8,8,0,0,0,62.78,200H193.22a8,8,0,0,0,7.89-6.68l15.6-93.59" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                </svg>
                Book De Voice
              </Link>
            </div>

            <div className="mt-16 flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f2e9d8]/50">
                Follow De Voice
              </span>
              <div className="flex gap-3">
                {[
                  {
                    key: "ig",
                    label: "Instagram",
                    path: "M12 2c2.7 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.55.55.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.42.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.42.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.7 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76A4.9 4.9 0 0 1 5.44 2.54c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.3 2 12 2zm0 3.5A6.5 6.5 0 1 0 12 18.5 6.5 6.5 0 0 0 12 5.5zm0 2A4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 0 1 12 7.5zm6.75-2.13a1.13 1.13 0 1 1-2.25 0 1.13 1.13 0 0 1 2.25 0z",
                  },
                  {
                    key: "yt",
                    label: "YouTube",
                    path: "M23 12s0-3.6-.46-5.3a2.9 2.9 0 0 0-2.04-2.05C18.8 4.2 12 4.2 12 4.2s-6.8 0-8.5.45A2.9 2.9 0 0 0 1.46 6.7C1 8.4 1 12 1 12s0 3.6.46 5.3a2.9 2.9 0 0 0 2.04 2.05c1.7.45 8.5.45 8.5.45s6.8 0 8.5-.45a2.9 2.9 0 0 0 2.04-2.05C23 15.6 23 12 23 12zM9.75 15.5v-7l6 3.5-6 3.5z",
                  },
                  {
                    key: "sc",
                    label: "SoundCloud",
                    path: "M2 14.5c.28 0 .5.22.5.5v3c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-3c0-.28.22-.5.5-.5zm2.5-1.5c.28 0 .5.22.5.5v4.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V13.5c0-.28.22-.5.5-.5zm2.5-1c.28 0 .5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5zm2.5.5c.28 0 .5.22.5.5v6.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V13c0-.28.22-.5.5-.5zm2.75-3.5a4.75 4.75 0 0 1 4.7 4.05 3.5 3.5 0 1 1-.45 6.95H10a.5.5 0 0 1-.5-.5V9.6c.36-.68.99-1.1 1.75-1.1z",
                  },
                  {
                    key: "sp",
                    label: "Spotify",
                    path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.59 14.4a.6.6 0 0 1-.83.2c-2.27-1.39-5.13-1.7-8.5-.93a.6.6 0 1 1-.27-1.17c3.69-.84 6.86-.48 9.4 1.07.29.18.38.55.2.83zm1.22-2.72a.75.75 0 0 1-1.03.25c-2.6-1.6-6.56-2.06-9.64-1.13a.75.75 0 1 1-.43-1.44c3.52-1.06 7.9-.54 10.86 1.29.35.22.46.68.24 1.03zm.1-2.84C14.87 9.06 9.42 8.86 6.3 9.86a.9.9 0 1 1-.55-1.72c3.58-1.14 9.6-.9 13.05 1.16a.9.9 0 1 1-.89 1.56z",
                  },
                ].map((social) => (
                  <a
                    key={social.key}
                    href="#"
                    aria-label={social.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c9a24b]/40 text-[#c9a24b]/80 transition-colors hover:border-[#c9a24b] hover:bg-[#c9a24b]/10 hover:text-[#c9a24b]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Image, duotone-treated */}
        <div className="relative order-first min-h-[50vh] overflow-hidden md:order-last md:min-h-[calc(100vh-5rem)]">
          {image ? (
            <img
              src={image}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover object-top sepia-[0.35] contrast-[1.05] saturate-[1.1]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#16241f]">
              <span className="text-sm uppercase tracking-[0.3em] text-[#c9a24b]/60">
                Artist Image
              </span>
            </div>
          )}

          {/* Deep teal blend on the left edge */}
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#0d1a17] via-[#0d1a17]/65 to-transparent md:w-56" />

          {/* Soft atmospheric glow over the image */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_48%_48%,transparent_35%,rgba(13,26,23,0.18)_65%,rgba(13,26,23,0.7)_100%)]" />

          {/* Warm vintage glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_25%,rgba(201,162,75,0.12),transparent_45%)]" />

          {/* Bottom fade into the dark hero */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d1a17]/80 to-transparent" />

          {/* Subtle image shadow / depth */}
          <div className="absolute inset-y-0 left-0 w-24 shadow-[inset_25px_0_45px_rgba(13,26,23,0.45)]" />

          {/* vinyl record accent, bottom-left of image, half-hidden */}
          <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full border-8 border-[#0d1a17] bg-[radial-gradient(circle,#1a1a18_0%,#1a1a18_20%,#0d1a17_21%,#0d1a17_40%,#1a1a18_41%,#1a1a18_100%)] opacity-90" />
        </div>
      </div>
    </section>
  );
}