import React from "react";
import { Play, Check, Star } from "lucide-react";
import { motion } from "framer-motion";
import { heroStats, heroVideoPoster } from "../mock/mock";
import { scrollToId } from "./Navbar";
import { shortCta } from "../lib/ctaLabel";

const Headline = ({ text }) => text.split(/["“”]/).map((part, i) => part ? <span key={i} className={`fade-up delay-${Math.min(3, Math.floor(i / 2) + 1)} ${i % 2 ? "italic font-bold text-[#E62E6B]" : ""}`}>{part}</span> : null);

const Hero = ({ page }) => {
  return (
    <section id="top" className="relative overflow-hidden bg-[#F4F1EA] grain min-h-[100svh] flex flex-col justify-center" data-testid="hero-section">
      <div className="absolute inset-0 z-0">
        <img src={heroVideoPoster} alt="Rekha Krishnamurthy bridal makeup" className="w-full h-full object-cover" data-testid="hero-mobile-image" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4F1EA]/60 via-[#F4F1EA]/15 to-transparent md:hidden" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#F4F1EA] via-[#F4F1EA]/92 to-[#F4F1EA]/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_38%,rgba(230,46,107,0.24),transparent_55%)] md:bg-[radial-gradient(circle_at_78%_45%,rgba(230,46,107,0.14),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F4F1EA] to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 w-full pt-28 sm:pt-32 md:pt-24 pb-12 sm:pb-14">
        <div className="max-w-[660px]">
          <div className="flex items-center gap-2.5 fade-up">
            <span className="w-2 h-2 rounded-full bg-[#E62E6B] animate-pulse" />
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.24em] text-[#8B7F82] uppercase" data-testid="hero-eyebrow">{page.eyebrow}</span>
          </div>

          <h2 className="font-display text-[#4A2530] mt-5 sm:mt-6 text-[40px] leading-[1.04] sm:text-[56px] md:text-[66px] lg:text-[72px] font-medium [text-shadow:0_2px_20px_rgba(244,241,234,0.8)] md:[text-shadow:none]" data-testid="hero-title">
            <Headline text={page.heroHeadline} />
          </h2>

          <p className="fade-up delay-3 mt-6 sm:mt-7 text-base sm:text-[17px] md:text-lg leading-relaxed text-[#5C4E52] max-w-[540px]" data-testid="hero-subtitle">
            {page.heroSub}
          </p>

          <div className="fade-up delay-4 mt-8 sm:mt-9 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 sm:gap-5">
            <motion.button whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => scrollToId("contact")} className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-[#E62E6B] text-white text-sm sm:text-[15px] font-medium hover:bg-[#C81F57] transition-colors duration-300 shadow-xl shadow-[#E62E6B]/30" data-testid="hero-book-btn">
              <span className="sm:hidden">{shortCta("Book Your Free Consultation")}</span>
              <span className="hidden sm:inline">Book Your Free Consultation</span>
            </motion.button>
            <button onClick={() => scrollToId("reels")} className="group flex items-center gap-3 text-[#4A2530]" data-testid="hero-reel-btn">
              <span className="w-12 h-12 rounded-full border border-[#F4B7CE] bg-white/70 backdrop-blur flex items-center justify-center text-[#E62E6B] group-hover:bg-[#E62E6B] group-hover:border-[#E62E6B] group-hover:text-white transition-all duration-300">
                <Play size={16} className="ml-0.5 fill-current" />
              </span>
              <span className="text-[15px]">Watch the reel</span>
            </button>
          </div>

          <div className="fade-up delay-4 mt-8 sm:mt-9 flex flex-wrap gap-x-7 gap-y-2.5">
            {["Makeup from ₹4,999", "Free consultation", "No visit charge — party, event & wedding bookings"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-[#5C4E52]"><Check size={16} className="text-[#E62E6B] shrink-0" /> {t}</div>
            ))}
          </div>

          <div className="mt-9 sm:mt-10 pt-7 sm:pt-8 border-t border-[#F1DCE3] grid grid-cols-3 max-w-[520px] divide-x divide-[#F1DCE3]">
            {heroStats.map((s, i) => (
              <div key={s.label} className={i === 0 ? "pr-4 sm:pr-6" : "px-4 sm:px-6"}>
                <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#4A2530] flex items-center gap-1">
                  {s.value}
                  {s.label === "Google rating" && <Star size={16} className="fill-[#E62E6B] text-[#E62E6B]" />}
                </div>
                <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.14em] uppercase text-[#8B7F82] mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
