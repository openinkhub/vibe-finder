import React from "react";
import { srcSetFor } from "../lib/img";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { academyImage } from "../mock/mock";
import { pagesByGroup } from "../lib/pages";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Academy = () => {
  const tracks = pagesByGroup("Academy");
  return (
    <section id="academy" className="relative bg-[#EBE6DB] py-20 md:py-32 scroll-mt-20 overflow-hidden" data-testid="academy-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <Reveal>
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#C8215A]">Makeup Academy</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Master the Art of Makeup, Hands-On</h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5C4E52] leading-relaxed max-w-lg">Small-batch, practical training at our Bangalore studio, designed for aspiring makeup artists who want to build professional skills and for individuals who want to master makeup for themselves.</p>
          <p className="mt-3 text-sm sm:text-base font-semibold text-[#4A2530]">Learn. Practise. Create with confidence.</p>
          <div className="mt-8 sm:mt-9 space-y-3" style={{ perspective: 900 }}>
            {tracks.map((t, i) => (
              <Reveal key={t.path} delay={0.1 + i * 0.08} rotate={-14}>
                <Link to={t.path} className="block" data-testid={`academy-track-${t.path.slice(1)}`}>
                  <TiltCard max={6} className="flex items-center gap-4 bg-white rounded-2xl px-5 sm:px-6 py-4 border border-[#F1DCE3] hover:border-[#E62E6B] transition-colors">
                    <span className="font-mono text-sm text-[#C8215A]">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#4A2530] font-medium text-sm sm:text-base">{t.name}</div>
                      <div className="text-xs text-[#6E6266] mt-0.5 truncate">{t.tagline || t.heroHeadline}</div>
                    </div>
                    <ArrowUpRight size={16} className="text-[#C8215A] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </TiltCard>
                </Link>
              </Reveal>
            ))}
          </div>
          <Link to="/makeup-course-training-bangalore" className="mt-8 sm:mt-9 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#D6245F] text-white font-medium hover:bg-[#C81F57] hover:-translate-y-0.5 transition-all shadow-xl shadow-[#E62E6B]/30" data-testid="academy-cta-btn">View Course Details <ArrowUpRight size={16} /></Link>
        </Reveal>
        <Reveal delay={0.15}>
          <TiltCard max={7} className="rounded-[24px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(230,46,107,0.45)]">
            <img width="800" height="1000" loading="lazy" decoding="async" src={academyImage} srcSet={srcSetFor(academyImage)} sizes="(min-width: 768px) 45vw, 100vw" alt="Academy · Studio Session" className="w-full h-[340px] sm:h-[420px] md:h-[520px] object-cover" />
            <div className="absolute bottom-4 left-4 font-mono text-[11px] tracking-[0.15em] text-white bg-[#D6245F]/90 backdrop-blur px-3 py-1.5 rounded">Academy · Studio Session</div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
};

export default Academy;
