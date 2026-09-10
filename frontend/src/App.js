import { useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import WhoWeServe from "./components/WhoWeServe";
import Services from "./components/Services";
import FaceStudio from "./components/studio/FaceStudio";
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

function App() {
  useEffect(() => {
    document.title = "Rekha Krishnamurthy · Bridal Makeup Artist in Bangalore";
  }, []);

  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <WhoWeServe />
      <Services />
      <FaceStudio />
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
    </div>
  );
}

export default App;
