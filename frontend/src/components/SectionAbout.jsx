import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { aboutStats } from "../mock/mock";

const SectionAbout = () => {
  return (
    <section className="relative bg-[#F4F1EA] py-24 md:py-32 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1684868268327-7e5590bcfbd6" alt="Bridal look" className="rounded-2xl object-cover h-[280px] md:h-[340px] w-full mt-10 shadow-lg" />
              <img src="https://images.unsplash.com/photo-1551184451-76b762941ad6" alt="Natural glam" className="rounded-2xl object-cover h-[280px] md:h-[340px] w-full shadow-lg" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-8 py-5 border border-[#EFEAE0] text-center">
              <div className="font-display text-3xl font-bold text-[#E62E6B]">9+ yrs</div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-[#8B7F82] mt-1">Of artistry</div>
            </div>
          </div>

          {/* Text */}
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#E62E6B]">
              <span className="w-6 h-px bg-[#E62E6B]" /> About Rekha
            </span>
            <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">
              A skin-first approach to <span className="italic text-[#E62E6B]">timeless</span> bridal beauty
            </h2>
            <p className="mt-6 text-[#5C4E52] leading-relaxed">
              With over nine years and 500+ brides styled, Rekha blends HD & airbrush techniques with a skin-first
              philosophy &mdash; makeup that photographs beautifully and feels weightless from your first look to the last dance.
            </p>
            <p className="mt-4 text-[#5C4E52] leading-relaxed">
              Every look is tailored to your features, outfit and the light of your day, so you always look unmistakably like you &mdash; only more radiant.
            </p>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {aboutStats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl font-bold text-[#2B1B20]">{s.value}</div>
                  <div className="text-[11px] tracking-[0.15em] uppercase text-[#8B7F82] mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>

            <Link to="/about" className="group inline-flex items-center gap-2 mt-10 text-[#2B1B20] font-medium border-b-2 border-[#E62E6B] pb-1">
              Read the full story
              <ArrowUpRight size={18} className="text-[#E62E6B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionAbout;
