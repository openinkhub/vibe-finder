import React from "react";
import { Star, Quote } from "lucide-react";
import { testimonials } from "../mock/mock";

const Testimonials = () => {
  return (
    <section className="relative bg-[#2B1B20] py-24 md:py-32 overflow-hidden">
      <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/12 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#F4B7CE]">In their words</span>
          <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mt-5">Happy clients</h2>
          <p className="mt-4 text-[#C9B7BD] flex items-center justify-center gap-2">
            146 reviews · 5.0 average on Google
            <span className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={15} className="fill-[#E62E6B] text-[#E62E6B]" />)}</span>
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors">
              <Quote size={30} className="text-[#E62E6B] fill-[#E62E6B]/20" />
              <p className="mt-5 font-display text-lg leading-relaxed text-[#F3E8EB] italic">“{t.text}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E62E6B]/20 flex items-center justify-center font-display font-bold text-[#F4B7CE]">{t.name.charAt(0)}</div>
                <div className="font-medium text-white">— {t.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
