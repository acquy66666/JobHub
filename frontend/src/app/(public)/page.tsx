import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroPanel } from "@/components/home/HeroPanel";
import { HotJobsPanel } from "@/components/home/HotJobsPanel";
import { StatsHeroPanel } from "@/components/home/StatsHeroPanel";
import { CTAPanel } from "@/components/home/CTAPanel";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroPanel />
        <HotJobsPanel />
        <StatsHeroPanel />
        <CTAPanel />
      </main>
      <Footer />
    </>
  );
}
