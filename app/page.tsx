import { ScrollProgress } from "@/components/motion/scroll-progress";
import { CursorGlow } from "@/components/motion/cursor-glow";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/sections/hero";
import { Logos } from "@/components/sections/logos";
import { Showreel } from "@/components/sections/showreel";
import { Services } from "@/components/sections/services";
import { Kinetic } from "@/components/sections/kinetic";
import { Process } from "@/components/sections/process";
import { BigStatement } from "@/components/sections/big-statement";
import { Stats } from "@/components/sections/stats";
import { Pricing } from "@/components/sections/pricing";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { Cta } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Logos />
        <Showreel />
        <Services />
        <Kinetic />
        <Process />
        <BigStatement />
        <Stats />
        <Pricing />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
