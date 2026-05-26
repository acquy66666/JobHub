import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { FeaturedJobsSection } from "@/components/home/FeaturedJobsSection";
import { EmployerSection } from "@/components/home/EmployerSection";
import { StatsSection } from "@/components/home/StatsSection";
import { CompaniesSection } from "@/components/home/CompaniesSection";
import { CTASection } from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FeaturedJobsSection />
        <EmployerSection />
        <StatsSection />
        <CompaniesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
