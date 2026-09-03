import { prisma } from "@/lib/prisma";

import Hero from "@/components/home/Hero";
import FeaturedMusic from "@/components/home/FeaturedMusic";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import AboutPreview from "@/components/home/AboutPreview";
import FeaturedVideos from "@/components/home/FeaturedVideos";
import GalleryPreview from "@/components/home/GalleryPreview";
import BookingCTA from "@/components/home/BookingCTA";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await prisma.artistProfile.findFirst();

  return (
    <main>
      <Hero
        name={profile?.name ?? "Kigula Jonathan Sedrak"}
        tagline={profile?.tagline ?? "De Voice · Da Diva"}
        image={profile?.heroImage ?? "/hero.jpeg"}
      />

      <FeaturedMusic />

      <FeaturedEvents />

      <AboutPreview />

      <FeaturedVideos />

      <GalleryPreview />

      <BookingCTA />
    </main>
  );
}