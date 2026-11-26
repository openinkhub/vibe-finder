import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingButtons from "../components/FloatingButtons";
import { MobileBookBar } from "../components/MobileBookBar";

const setMetaRobots = (content) => {
  let el = document.head.querySelector('meta[name="robots"]');
  if (!el) { el = document.createElement("meta"); el.name = "robots"; document.head.appendChild(el); }
  el.setAttribute("content", content);
};

const NotFoundPage = () => {
  useEffect(() => {
    document.title = "Page Not Found | Rekha Krishnamurthy";
    setMetaRobots("noindex, nofollow");
    window.scrollTo(0, 0);
    return () => setMetaRobots("index, follow");
  }, []);
  return (
    <div className="bg-[#F4F1EA] min-h-screen" data-testid="not-found-page">
      <Navbar solid />
      <main className="pt-32 sm:pt-40 pb-24 max-w-[720px] mx-auto px-5 text-center">
        <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#C8215A]">404</span>
        <h1 className="font-display text-4xl sm:text-5xl text-[#4A2530] mt-4" data-testid="not-found-title">Page not found</h1>
        <p className="mt-5 text-sm sm:text-base text-[#5C4E52] leading-relaxed">
          The page you're looking for doesn't exist or may have moved. Head back home or get in touch to book a makeup consultation.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#D6245F] text-white font-medium hover:bg-[#C81F57] transition-colors" data-testid="not-found-home-link">Back to Home <ArrowUpRight size={16} /></Link>
          <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#E62E6B] text-[#C8215A] font-medium hover:bg-[#FBE9F0] transition-colors" data-testid="not-found-contact-link">Contact Us</Link>
        </div>
      </main>
      <Footer />
      <FloatingButtons />
      <MobileBookBar />
    </div>
  );
};

export default NotFoundPage;
