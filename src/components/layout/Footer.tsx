import Link from "next/link";

const links = [
  { label: "Music", href: "/music" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Book De Voice", href: "/book" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a1412] px-6 py-16 text-[#f2e9d8] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-b border-[#f2e9d8]/10 pb-14 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <p className="font-serif text-4xl">De Voice</p>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[#f2e9d8]/45">
              Kigula Jonathan Sedrak — Ugandan soul singer known for his
              remarkable vocal range, melismatic style and signature high
              register.
            </p>

            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#c9a24b]">
              De Voice · Da Diva
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a24b]">
              Explore
            </p>

            <nav className="flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-sm text-[#f2e9d8]/60 transition-colors hover:text-[#f2e9d8]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a24b]">
              Management
            </p>

            <div className="space-y-3 text-sm text-[#f2e9d8]/60">
              <a
                href="https://wa.me/256703008952?text=Hello%2C%20I%20am%20reaching%20out%20to%20De%20Voice%20Management%20regarding%20an%20inquiry%20for%20Jonathan%20(De%20Voice)."
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-[#f2e9d8]"
              >
                WhatsApp Management
              </a>

              <Link
                href="/contact"
                className="block transition-colors hover:text-[#f2e9d8]"
              >
                Contact Management
              </Link>

              <Link
                href="/book"
                className="block transition-colors hover:text-[#f2e9d8]"
              >
                Booking Enquiries
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col justify-between gap-4 pt-8 text-[10px] uppercase tracking-[0.2em] text-[#f2e9d8]/30 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Kigula Jonathan Sedrak. All rights
            reserved.
          </p>

          <p>Uganda · Africa · The World</p>
        </div>
      </div>
    </footer>
  );
}