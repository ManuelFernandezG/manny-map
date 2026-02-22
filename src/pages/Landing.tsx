import LandingHeader from "@/components/landing/LandingHeader";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import CTASection from "@/components/landing/CTASection";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#1A2E22] flex flex-col">
      <LandingHeader />
      <Hero />
      <HowItWorks />
      <Features />
      <CTASection />
    </div>
  );
};

export default Landing;
