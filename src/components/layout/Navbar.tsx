"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/music", label: "Music" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--teal-100)] bg-[var(--off-white)]/95 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex flex-col leading-none"
        >
          <span className="text-xl font-bold tracking-tight text-[var(--teal-950)]">
            JONATHAN
          </span>

          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--teal-600)]">
            De Voice
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--teal-600)]"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/book"
            className="rounded-full bg-[var(--teal-900)] px-5 py-2.5 text-sm font-semibold text-[var(--warm-white)] transition-colors hover:bg-[var(--teal-800)]"
          >
            Book Now
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--teal-950)] md:hidden"
        >
          <span className="text-2xl">{open ? "×" : "☰"}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-[var(--teal-100)] bg-[var(--off-white)] px-5 py-5 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-[var(--text)] hover:bg-[var(--teal-100)]"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-xl bg-[var(--teal-900)] px-4 py-3 text-center font-semibold text-[var(--warm-white)]"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}