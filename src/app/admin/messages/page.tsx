import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import MessageActions from "@/components/admin/MessageActions";

export default async function AdminMessagesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const messages = await prisma.contactMessage.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
              Management
            </p>

            <h1 className="mt-4 font-serif text-6xl leading-none">
              Messages
            </h1>

            <p className="mt-4 text-sm text-[#0d1a17]/50">
              Contact enquiries from the website.
            </p>
          </div>

          <div className="rounded-full bg-[#0d1a17] px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8]">
            {messages.length}{" "}
            {messages.length === 1 ? "Message" : "Messages"}
          </div>
        </div>

        {messages.length === 0 && (
          <div className="mt-12 rounded-[2rem] border border-[#0d1a17]/10 bg-white/40 p-16 text-center">
            <p className="font-serif text-3xl">
              No messages yet.
            </p>

            <p className="mt-3 text-sm text-[#0d1a17]/50">
              Contact enquiries will appear here.
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <div className="mt-12 space-y-5">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`rounded-[2rem] border p-7 sm:p-9 ${
                  message.read
                    ? "border-[#0d1a17]/10 bg-white/40"
                    : "border-[#c9a24b]/30 bg-white/70"
                }`}
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      {!message.read && (
                        <span className="rounded-full bg-[#c9a24b]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8c6b25]">
                          New
                        </span>
                      )}

                      {message.read && (
                        <span className="rounded-full bg-[#0d1a17]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0d1a17]/40">
                          Read
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 font-serif text-3xl">
                      {message.name}
                    </h2>
                  </div>

                  <p className="text-xs text-[#0d1a17]/40">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(message.createdAt)}
                  </p>
                </div>

                <div className="mt-7 grid gap-5 border-t border-[#0d1a17]/10 pt-6 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                      Email
                    </p>

                    <p className="mt-2 text-sm">
                      {message.email || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                      Phone
                    </p>

                    <p className="mt-2 text-sm">
                      {message.phone}
                    </p>
                  </div>
                </div>

                <div className="mt-7 border-t border-[#0d1a17]/10 pt-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d1a17]/35">
                    Message
                  </p>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#0d1a17]/65">
                    {message.message}
                  </p>
                </div>

                <div className="mt-7 flex justify-end border-t border-[#0d1a17]/10 pt-6">
                  <MessageActions
                    messageId={message.id}
                    read={message.read}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}