import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "./fx/Reveal";
import { FeaturableWidget } from "./FeaturableWidget";

const Testimonials = ({ showLink = true }) => {
  return (
    <section id="testimonials" className="relative bg-[#FBE9F0] py-20 md:py-32 overflow-hidden scroll-mt-20" data-testid="testimonials-section">
      <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">In their words</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Happy clients</h2>
          <p className="mt-4 text-sm sm:text-base text-[#5C4E52]">Real reviews from real clients, straight from Google.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="bg-white border border-[#F1DCE3] rounded-3xl p-4 sm:p-6" data-testid="testimonials-widget-wrap">
            <FeaturableWidget />
          </div>
        </Reveal>
        {showLink && (
          <div className="mt-10 text-center">
            <Link to="/testimonials" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#E62E6B] text-white font-medium hover:bg-[#C81F57] hover:-translate-y-0.5 transition-all shadow-xl shadow-[#E62E6B]/30" data-testid="testimonials-all-link">Read all testimonials <ArrowUpRight size={16} /></Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
