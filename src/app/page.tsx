import HeroSection from "@/components/HeroSection";
import PainPoints from "@/components/PainPoints";
import Solution from "@/components/Solution";
import Benefits from "@/components/Benefits";
import Testimonials from "@/components/Testimonials";
import LeadForm from "@/components/LeadForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-darker text-foreground overflow-hidden">
      <HeroSection />
      <PainPoints />
      <Solution />
      <Benefits />
      <Testimonials />
      <LeadForm />
      
      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-center border-t border-slate-800/50">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Pickleball Master. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
