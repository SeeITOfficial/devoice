import Hero from "@/components/home/Hero";
import FeaturedMusic from "@/components/home/FeaturedMusic";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import AboutPreview from "@/components/home/AboutPreview";
import FeaturedVideos from "@/components/home/FeaturedVideos";
import GalleryPreview from "@/components/home/GalleryPreview";
import BookingCTA from "@/components/home/BookingCTA";

export default function Home() {
  return (
    <main>
      <Hero
        name="Kigula Jonathan Sedrak"
        tagline="De Voice · Da Diva"
        image="/hero.jpeg"
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