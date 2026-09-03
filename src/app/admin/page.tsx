import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [bookings, messages] = await Promise.all([
    prisma.booking.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.contactMessage.count({
      where: {
        read: false,
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
          De Voice
        </p>

        <h1 className="mt-4 font-serif text-6xl">
          Management
        </h1>

        <p className="mt-4 text-sm text-[#0d1a17]/50">
          Welcome to the management dashboard.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.5rem] bg-[#0d1a17] p-7 text-[#f2e9d8]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#f2e9d8]/40">
              Pending bookings
            </p>

            <p className="mt-5 font-serif text-5xl">
              {bookings}
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-[#0d1a17] p-7 text-[#f2e9d8]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#f2e9d8]/40">
              Unread messages
            </p>

            <p className="mt-5 font-serif text-5xl">
              {messages}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}