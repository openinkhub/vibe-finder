import React from "react";
import { Play } from "lucide-react";
import { reels } from "../mock/mock";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Reels = () => {
  return (
    <section id="reels" className="relative bg-[#EBE6DB] py-20 md:py-28 scroll-mt-20" data-testid="reels-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="max-w-2xl mb-8 md:mb-12">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Short-form</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Behind the brush</h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5C4E52]">Process reels — trials, transformations, and technique — the way this work is actually watched now.</p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4" style={{ perspective: 1400 }}>
          {reels.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.07} rotate={18}>
              <TiltCard as="button" max={12} className="w-full rounded-2xl overflow-hidden aspect-[9/14] bg-[#FBE9F0] text-left shadow-[0_24px_60px_-30px_rgba(230,46,107,0.55)]" data-testid={`reel-card-${i}`}>
                <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#E62E6B]/90 via-[#E62E6B]/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#E62E6B] group-hover:scale-110 group-hover:bg-[#E62E6B] group-hover:text-white transition-all duration-300 shadow-lg" style={{ transform: "translateZ(40px)" }}><Play size={18} className="ml-0.5 fill-current" /></span>
                </div>
                <span className="absolute top-3 right-3 font-mono text-[10px] text-white bg-[#E62E6B]/90 px-2 py-1 rounded">{r.time}</span>
                <div className="absolute bottom-0 left-0 p-3 sm:p-4"><div className="font-display text-sm font-semibold text-white leading-snug">{r.title}</div></div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reels;
