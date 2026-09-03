import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import TicketActions from "@/components/admin/TicketActions";
import OrderActions from "@/components/admin/OrderActions";

export default async function AdminOrdersPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const orders = await prisma.ticketOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: { id: true, title: true, date: true },
      },
      tickets: {
        include: {
          ticketType: {
            select: { id: true, name: true, price: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
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
              Ticket Orders
            </h1>

            <p className="mt-4 text-sm text-[#0d1a17]/50">
              View and manage all ticket orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/tickets/validate"
              className="rounded-full bg-[#0d1a17] px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#f2e9d8] transition-all hover:bg-[#0d1a17]/80 focus:outline-none focus:ring-2 focus:ring-[#c9a24b]/50"
              title="Open check-in scanner"
            >
              Check-in Scanner
            </Link>

            <div className="rounded-full border border-[#0d1a17]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.15em]">
              {orders.length}{" "}
              {orders.length === 1 ? "Order" : "Orders"}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="mt-12 rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 p-16 text-center">
            <p className="font-serif text-3xl">No ticket orders yet.</p>

            <p className="mt-3 text-sm text-[#0d1a17]/50">
              Orders will appear here when customers purchase tickets.
            </p>
          </div>
        )}

        {/* Order list */}
        {orders.length > 0 && (
          <div className="mt-12 space-y-6">
            {orders.map((order) => {
              const validCount = order.tickets.filter(
                (t) => t.status === "VALID"
              ).length;
              const usedCount = order.tickets.filter(
                (t) => t.status === "USED"
              ).length;
              const invalidCount = order.tickets.filter(
                (t) => t.status === "INVALID"
              ).length;

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[2rem] border border-[#0d1a17]/10 bg-white/50"
                >
                  {/* Order header */}
                  <div className="grid lg:grid-cols-[1fr_auto]">
                    <div className="p-7 sm:p-9">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
                            order.status === "CONFIRMED"
                              ? "bg-[#0d1a17] text-[#f2e9d8] border border-[#0d1a17]/50"
                              : "bg-[#c9a24b]/15 text-[#8c6b25] border border-[#c9a24b]/30"
                          }`}
                          aria-label={`Order status: ${order.status}`}
                        >
                          {order.status}
                        </span>

                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                          {order.event.title}
                        </span>
                      </div>

                      <h2 className="mt-5 font-serif text-4xl">
                        {order.customerName}
                      </h2>

                      <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                            Phone
                          </p>
                          <p className="mt-2 text-sm">{order.phone}</p>
                        </div>

                        {order.email && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                              Email
                            </p>
                            <p className="mt-2 text-sm">{order.email}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                            Qty
                          </p>
                          <p className="mt-2 text-sm">{order.quantity}</p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                            Ticket summary
                          </p>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm">
                            {validCount > 0 && (
                              <span className="flex items-center gap-2 text-emerald-700" role="img" aria-label="Valid tickets">
                                <span aria-hidden="true" className="font-bold">✓</span>
                                {validCount} valid
                              </span>
                            )}
                            {usedCount > 0 && (
                              <span className="flex items-center gap-2 text-[#0d1a17]/50" role="img" aria-label="Used tickets">
                                <span aria-hidden="true" className="font-bold">–</span>
                                {usedCount} used
                              </span>
                            )}
                            {invalidCount > 0 && (
                              <span className="flex items-center gap-2 text-red-700" role="img" aria-label="Invalid tickets">
                                <span aria-hidden="true" className="font-bold">✕</span>
                                {invalidCount} invalid
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {order.status === "PENDING" && order.tickets.length > 0 && (
                        <OrderActions 
                          orderId={order.id} 
                          totalAmount={order.totalAmount}
                          unitPrice={order.unitPrice}
                        />
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-end border-t border-[#0d1a17]/10 p-7 lg:w-52 lg:border-l lg:border-t-0">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                          Ordered
                        </p>
                        <p className="mt-2 text-xs text-[#0d1a17]/55">
                          {new Intl.DateTimeFormat("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Individual tickets */}
                  {order.tickets.length > 0 && (
                    <div className="border-t border-[#0d1a17]/10 px-7 py-6 sm:px-9">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0d1a17]/35">
                        Tickets
                      </p>

                      <div className="mt-4 space-y-3">
                        {order.tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex flex-col gap-3 rounded-xl border border-[#0d1a17]/8 bg-white/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-5">
                              <span className="font-mono text-xs font-bold tracking-wider text-[#0d1a17]">
                                {ticket.ticketCode}
                              </span>

                              <span className="rounded-full border border-[#0d1a17]/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[#0d1a17]/50">
                                {ticket.ticketType.name}
                              </span>
                            </div>

                            <TicketActions
                              ticketId={ticket.id}
                              initialStatus={ticket.status}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
