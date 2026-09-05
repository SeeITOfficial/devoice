const platforms = [
  {
    name: "Spotify",
    href: "https://open.spotify.com/album/6cug9sC8Nkqh6iGIXiz61V",
    color: "#1DB954",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm4.59 14.4a.6.6 0 0 1-.83.2c-2.27-1.39-5.13-1.7-8.5-.93a.6.6 0 1 1-.27-1.17c3.69-.84 6.86-.48 9.4 1.07.29.18.38.55.2.83zm1.22-2.72a.75.75 0 0 1-1.03.25c-2.6-1.6-6.56-2.06-9.64-1.13a.75.75 0 1 1-.43-1.44c3.52-1.06 7.9-.54 10.86 1.29.35.22.46.68.24 1.03zm.1-2.84C14.87 9.06 9.42 8.86 6.3 9.86a.9.9 0 1 1-.55-1.72c3.58-1.14 9.6-.9 13.05 1.16a.9.9 0 1 1-.89 1.56z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/playlist?list=OLAK5uy_lr6kHEdXzInQol-1hbqbeWLZgWA-5rqng",
    color: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M23 12s0-3.6-.46-5.3a2.9 2.9 0 0 0-2.04-2.05C18.8 4.2 12 4.2 12 4.2s-6.8 0-8.5.45A2.9 2.9 0 0 0 1.46 6.7C1 8.4 1 12 1 12s0 3.6.46 5.3a2.9 2.9 0 0 0 2.04 2.05c1.7.45 8.5.45 8.5.45s6.8 0 8.5-.45a2.9 2.9 0 0 0 2.04-2.05C23 15.6 23 12 23 12zM9.75 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    ),
  },
  {
    name: "Apple Music",
    href: "https://ffm.to/devoice-my-soul",
    color: "#FA243C",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.064-2.31-2.05-2.81A5.022 5.022 0 0 0 19.13.7c-.69-.15-1.4-.2-2.1-.19H6.97C6.27.52 5.56.57 4.87.71 3.52 1.01 2.46 1.94 1.95 3.09A8.77 8.77 0 0 0 1.604 5.9c-.02.38-.03.76-.03 1.14v9.92c0 .38.01.76.03 1.14.1 1.45.68 2.77 1.63 3.68.96.91 2.22 1.38 3.53 1.38h13.47c1.31 0 2.57-.47 3.53-1.38.95-.91 1.53-2.23 1.63-3.68.02-.38.03-.76.03-1.14V7.04c0-.38-.01-.76-.03-1.14v.234zM12.003 5.1c.17 0 .33.007.495.02 1.67.14 3.14 1.07 3.92 2.54.2.38.06.86-.32 1.06-.38.2-.86.06-1.06-.32-.55-1.04-1.63-1.7-2.84-1.73-.39-.01-.7-.34-.69-.73.01-.38.33-.69.71-.69l-.21.02zm-5.2 9.7V8.26l7.22 3.27-7.22 3.27z" />
      </svg>
    ),
  },
  {
    name: "Tidal",
    href: "https://www.tidal.com/album/526257505",
    color: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004 4.004-4.004 4.004 4.004 4.004-4.004zm4.004 4.004l-4.004 4.004 4.004 4.004L20.016 12l-4.004-4.004zM8.008 12l-4.004 4.004 4.004 4.004 4.004-4.004z" />
      </svg>
    ),
  },
  {
    name: "Deezer",
    href: "https://www.deezer.com/album/987024531",
    color: "#A238FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M18.944 18.77h3.412v-1.47h-3.412zm-4.887 0h3.412v-1.47h-3.412zm-4.886 0h3.411v-1.47H9.17zm-4.886 0h3.411v-1.47H4.284zM18.944 16.3h3.412v-1.47h-3.412zm-4.887 0h3.412v-1.47h-3.412zm-4.886 0h3.411v-1.47H9.17zm-4.886 0h3.411v-1.47H4.284zM18.944 13.832h3.412V12.36h-3.412zm-4.887 0h3.412V12.36h-3.412zm-4.886 0h3.411V12.36H9.17zm4.887-2.468h3.412V9.891h-3.412zm-4.887 0h3.411V9.891H9.17zm4.887-2.467h3.412V7.423h-3.412zm4.886-2.469h3.412V4.96h-3.412zm-4.886 0h3.412V4.96h-3.412z" />
      </svg>
    ),
  },
  {
    name: "Amazon Music",
    href: "https://ffm.to/devoice-my-soul",
    color: "#25D1DA",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705a.661.661 0 0 1-.75.074c-1.053-.875-1.241-1.28-1.819-2.113-1.738 1.773-2.971 2.304-5.23 2.304-2.668 0-4.747-1.648-4.747-4.947 0-2.575 1.395-4.328 3.38-5.186 1.72-.76 4.12-.895 5.954-1.105v-.41c0-.753.058-1.642-.384-2.294-.385-.581-1.124-.821-1.773-.821-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.076-.333c-.259-.057-.547-.266-.472-.66C5.948 2.951 8.873 2 11.497 2c1.341 0 3.093.357 4.151 1.372C16.989 4.571 16.9 6.18 16.9 7.934v4.978c0 1.497.621 2.155 1.206 2.963.207.29.251.633-.01.849-.652.543-1.81 1.556-2.446 2.124l-.506-.053z" />
      </svg>
    ),
  },
  {
    name: "Boomplay",
    href: "https://ffm.to/devoice-my-soul",
    color: "#FF6600",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 14.5v-9l7 4.5-7 4.5z" />
      </svg>
    ),
  },
  {
    name: "SoundCloud",
    href: "https://ffm.to/devoice-my-soul",
    color: "#FF5500",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M2 14.5c.28 0 .5.22.5.5v3c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-3c0-.28.22-.5.5-.5zm2.5-1.5c.28 0 .5.22.5.5v4.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V13.5c0-.28.22-.5.5-.5zm2.5-1c.28 0 .5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5zm2.5.5c.28 0 .5.22.5.5v6.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V13c0-.28.22-.5.5-.5zm2.75-3.5a4.75 4.75 0 0 1 4.7 4.05 3.5 3.5 0 1 1-.45 6.95H10a.5.5 0 0 1-.5-.5V9.6c.36-.68.99-1.1 1.75-1.1z" />
      </svg>
    ),
  },
];

export default function StreamingPlatforms() {
  return (
    <section className="bg-[#0a1412] px-6 py-20 text-[#f2e9d8] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-[#c9a24b]">
              Now Streaming
            </p>
            <h2 className="font-serif text-4xl leading-none sm:text-5xl">
              DeVoice My Soul
            </h2>
            <p className="mt-3 text-sm text-[#f2e9d8]/45">
              Available on all major platforms — pick yours and start listening.
            </p>
          </div>

          <a
            href="https://ffm.to/devoice-my-soul"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#c9a24b]/40 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-[#c9a24b] transition-colors hover:border-[#c9a24b] hover:bg-[#c9a24b]/10"
          >
            All Platforms →
          </a>
        </div>

        {/* Platform grid */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-[#f2e9d8]/8 bg-white/4 px-5 py-4 transition-all duration-200 hover:border-[#f2e9d8]/20 hover:bg-white/8"
            >
              {/* coloured icon dot */}
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${p.color}20`, color: p.color }}
              >
                {p.icon}
              </span>

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#f2e9d8]/35">
                  Listen on
                </p>
                <p className="truncate text-sm font-semibold text-[#f2e9d8] group-hover:text-[#c9a24b]">
                  {p.name}
                </p>
              </div>

              {/* arrow */}
              <svg
                className="ml-auto shrink-0 text-[#f2e9d8]/20 transition-colors group-hover:text-[#c9a24b]"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
