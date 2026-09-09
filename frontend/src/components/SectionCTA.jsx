import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowUpRight, Sparkles } from "lucide-react";

const SectionCTA = () => {
  return (
    <section className="relative bg-[#EBE6DB] py-24 md:py-28">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="relative rounded-[32px] overflow-hidden bg-[#4A2530]">
          <img
            src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2"
            alt="Makeup class"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#4A2530] via-[#4A2530]/85 to-[#4A2530]/40" />
          <div className="relative px-8 md:px-16 py-16 md:py-20 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#F4B7CE]">
              <Sparkles size={14} /> Learn with Rekha
            </span>
            <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mt-5">
              Master your own <span className="italic text-[#F4B7CE]">signature</span> look
            </h2>
            <p className="mt-5 text-[#E6D5DA] leading-relaxed">
              Join self-grooming masterclasses and professional artistry courses &mdash; hands-on, personalised and designed to build real confidence with a brush in hand.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/courses" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#E62E6B] text-white font-medium hover:bg-[#c81f57] transition-colors">
                <GraduationCap size={18} /> Explore courses
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/40 text-white font-medium hover:bg-white/10 transition-colors">
                Talk to Rekha
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionCTA;
