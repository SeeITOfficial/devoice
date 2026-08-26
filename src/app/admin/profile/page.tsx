import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export default async function AdminProfilePage() {
  const profile = await prisma.artistProfile.findFirst();

  return (
    <main className="min-h-screen bg-[#f2e9d8] px-6 py-16 text-[#0d1a17] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#b18a3b]">
          Management
        </p>

        <h1 className="mt-4 font-serif text-6xl leading-none">
          Artist Profile
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-[#0d1a17]/50">
          Manage the artist's identity, biography and homepage media.
        </p>

        <ProfileForm profile={profile} />
      </div>
    </main>
  );
}