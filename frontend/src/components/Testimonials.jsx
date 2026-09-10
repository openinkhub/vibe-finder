import React from "react";
import { Star, Quote } from "lucide-react";
import { testimonials } from "../mock/mock";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Testimonials = () => {
  return (
    <section className="relative bg-[#FBE9F0] py-20 md:py-32 overflow-hidden" data-testid="testimonials-section">
      <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">In their words</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Happy clients</h2>
          <p className="mt-4 text-sm sm:text-base text-[#5C4E52] flex flex-wrap items-center justify-center gap-2">
            146 reviews · 5.0 average on Google
            <span className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={15} className="fill-[#E62E6B] text-[#E62E6B]" />)}</span>
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6" style={{ perspective: 1200 }}>
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <TiltCard className="h-full bg-white border border-[#F1DCE3] rounded-3xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-[#E62E6B]/20 transition-shadow" data-testid={`testimonial-card-${i}`}>
                <Quote size={30} className="text-[#E62E6B] fill-[#E62E6B]/20" style={{ transform: "translateZ(30px)" }} />
                <p className="mt-5 font-display text-base sm:text-lg leading-relaxed text-[#4A2530] italic">“{t.text}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E62E6B] flex items-center justify-center font-display font-bold text-white">{t.name.charAt(0)}</div>
                  <div className="font-medium text-[#4A2530]">— {t.name}</div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
