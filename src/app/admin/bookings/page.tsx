import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import BookingActions from "@/components/admin/BookingActions";

export default async function AdminBookingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const bookings = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      service: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
              Management
            </p>

            <h1 className="mt-4 font-serif text-6xl leading-none">
              Bookings
            </h1>

            <p className="mt-4 text-sm text-[#0d1a17]/50">
              Manage performance and event requests.
            </p>
          </div>

          <div className="rounded-full bg-[#0d1a17] px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8]">
            {bookings.length}{" "}
            {bookings.length === 1 ? "Booking" : "Bookings"}
          </div>
        </div>

        {/* Empty state */}
        {bookings.length === 0 && (
          <div className="mt-12 rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 p-16 text-center">
            <p className="font-serif text-3xl">
              No bookings yet.
            </p>

            <p className="mt-3 text-sm text-[#0d1a17]/50">
              New booking requests will appear here.
            </p>
          </div>
        )}

        {/* Booking list */}
        {bookings.length > 0 && (
          <div className="mt-12 space-y-5">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="overflow-hidden rounded-[2rem] border border-[#0d1a17]/10 bg-white/50"
              >
                <div className="grid lg:grid-cols-[1fr_auto]">
                  {/* Main information */}
                  <div className="p-7 sm:p-9">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
                          booking.status === "CONFIRMED"
                            ? "bg-[#0d1a17] text-[#f2e9d8]"
                            : "bg-[#c9a24b]/15 text-[#8c6b25]"
                        }`}
                      >
                        {booking.status}
                      </span>

                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                        {booking.service.name}
                      </span>
                    </div>

                    <h2 className="mt-5 font-serif text-4xl">
                      {booking.name}
                    </h2>

                    <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                          Event date
                        </p>

                        <p className="mt-2 text-sm">
                          {new Intl.DateTimeFormat("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).format(booking.eventDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                          Location
                        </p>

                        <p className="mt-2 text-sm">
                          {booking.location}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                          Contact
                        </p>

                        <p className="mt-2 text-sm">
                          {booking.phone}
                        </p>

                        {booking.email && (
                          <p className="mt-1 text-xs text-[#0d1a17]/50">
                            {booking.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {booking.details && (
                      <div className="mt-7 border-t border-[#0d1a17]/10 pt-6">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                          Event details
                        </p>

                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#0d1a17]/65">
                          {booking.details}
                        </p>
                      </div>
                    )}

                    <div className="mt-8 flex justify-end border-t border-[#0d1a17]/10 pt-6">
                      <BookingActions
                        bookingId={booking.id}
                        status={booking.status}
                      />
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-end border-t border-[#0d1a17]/10 p-7 lg:w-52 lg:border-l lg:border-t-0">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                        Submitted
                      </p>

                      <p className="mt-2 text-xs text-[#0d1a17]/55">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(booking.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}