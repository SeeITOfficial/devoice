"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/admin" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Music", href: "/admin/music" },
  { label: "Events", href: "/admin/events" },
  { label: "Tickets", href: "/admin/tickets" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Videos", href: "/admin/videos" },
  { label: "Artist Profile", href: "/admin/profile" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-[#f2e9d8]/10 bg-[#0a1412] text-[#f2e9d8] lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="border-b border-[#f2e9d8]/10 px-6 py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#c9a24b]">
            De Voice
          </p>

          <p className="mt-2 font-serif text-2xl">
            Management
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-x-auto px-3 py-5 lg:overflow-y-auto">
          <div className="flex gap-1 lg:block">
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block whitespace-nowrap rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                    active
                      ? "bg-[#c9a24b] text-[#0d1a17]"
                      : "text-[#f2e9d8]/50 hover:bg-[#f2e9d8]/5 hover:text-[#f2e9d8]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="hidden border-t border-[#f2e9d8]/10 p-5 lg:block">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#f2e9d8]/25">
            Management Portal
          </p>

          <p className="mt-2 text-xs text-[#f2e9d8]/40">
            De Voice · Da Diva
          </p>
        </div>
      </div>
    </aside>
  );
}