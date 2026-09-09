import React, { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials } from "../mock/mock";

const SectionTestimonials = () => {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((v) => (v + 1) % testimonials.length);
  const prev = () => setIdx((v) => (v - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, []);

  const t = testimonials[idx];

  return (
    <section className="relative bg-[#2B1B20] py-24 md:py-32 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/10 blur-3xl" />
      <div className="relative max-w-[900px] mx-auto px-6 md:px-10 text-center">
        <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#F4B7CE]">
          <span className="w-6 h-px bg-[#F4B7CE]" /> Kind words <span className="w-6 h-px bg-[#F4B7CE]" />
        </span>
        <Quote size={48} className="mx-auto mt-8 text-[#E62E6B] fill-[#E62E6B]/20" />

        <div className="mt-6 min-h-[180px] md:min-h-[160px] flex flex-col items-center justify-center">
          <p key={t.id} className="fade-up font-display text-2xl md:text-3xl leading-relaxed text-[#F3E8EB] italic max-w-3xl">
            &ldquo;{t.text}&rdquo;
          </p>
          <div className="flex items-center gap-1 mt-8">
            {[...Array(t.rating)].map((_, i) => (
              <Star key={i} size={18} className="fill-[#E62E6B] text-[#E62E6B]" />
            ))}
          </div>
          <div className="mt-4">
            <div className="font-semibold text-white">{t.name}</div>
            <div className="text-sm text-[#B79AA2]">{t.role}</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={prev} className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#E62E6B] hover:border-[#E62E6B] transition-colors" aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-[#E62E6B]" : "w-2 bg-white/25"}`} aria-label={`Go to ${i + 1}`} />
            ))}
          </div>
          <button onClick={next} className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#E62E6B] hover:border-[#E62E6B] transition-colors" aria-label="Next">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SectionTestimonials;
