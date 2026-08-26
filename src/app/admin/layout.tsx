"use client";

import { usePathname } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#f2e9d8] lg:pl-64">
      <AdminNav />

      <div className="min-h-screen">
        {children}
      </div>
    </div>
  );
}