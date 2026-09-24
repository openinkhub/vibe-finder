import { useEffect } from "react";
import { scrollToId } from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import WhoWeServe from "./components/WhoWeServe";
import Services from "./components/Services";
import Pricing from "./components/Pricing";
import Areas from "./components/Areas";
import Portfolio from "./components/Portfolio";
import Reels from "./components/Reels";
import Process from "./components/Process";
import Academy from "./components/Academy";
import Loyalty from "./components/Loyalty";
import Testimonials from "./components/Testimonials";
import Instagram from "./components/Instagram";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";
import Admin from "./pages/Admin";
import PortfolioPage from "./pages/PortfolioPage";
import { LookLabPage, TryOnPage } from "./pages/ExperiencePages";
import { ServicePage, StaticPage, BlogPage, LegalPage } from "./pages/ContentPages";
import { servicePages, locationPages } from "./content/site";

const Landing = () => {
  useEffect(() => {
    const target = sessionStorage.getItem("rk_scroll_to") || (window.location.hash ? window.location.hash.slice(1) : "");
    if (target) { sessionStorage.removeItem("rk_scroll_to"); setTimeout(() => scrollToId(target), 400); }
  }, []);
  return (
  <>
    <Navbar />
    <Hero />
    <Marquee />
    <About />
    <WhoWeServe />
    <Services />
    <Pricing />
    <Areas />
    <Portfolio />
    <Reels />
    <Process />
    <Academy />
    <Loyalty />
    <Testimonials />
    <Instagram />
    <FAQ />
    <Contact />
    <Footer />
    <FloatingButtons />
  </>
  );
};

function App() {
  useEffect(() => {
    document.title = "Rekha Krishnamurthy · Bridal Makeup Artist in Bangalore";
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/look-lab" element={<LookLabPage />} />
          <Route path="/try-on" element={<TryOnPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/about-us" element={<StaticPage slug="about-us" />} />
          <Route path="/makeup-course-training-bangalore" element={<StaticPage slug="makeup-course-training-bangalore" />} />
          <Route path="/personal-shopping" element={<StaticPage slug="personal-shopping" />} />
          {[...servicePages, ...locationPages].map((p) => <Route key={p.slug} path={`/${p.slug}`} element={<ServicePage />} />)}
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
