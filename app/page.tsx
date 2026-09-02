import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/sections/SelectedWork";
import WebExperiences from "@/components/sections/WebExperiences";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <SelectedWork />
      <WebExperiences />
      <Services />
      <About />
      <Contact />
    </main>
  );
}
