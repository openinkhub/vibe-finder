import React from "react";
import { process } from "../mock/mock";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Process = () => {
  return (
    <section className="relative bg-[#F4F1EA] py-20 md:py-32 overflow-hidden" data-testid="process-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="max-w-2xl mb-10 md:mb-14">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">How it works</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">From enquiry to wedding day</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" style={{ perspective: 1200 }}>
          {process.map((p, i) => (
            <Reveal key={p.no} delay={i * 0.1}>
              <TiltCard className="h-full bg-white rounded-3xl p-6 sm:p-8 border border-[#F1DCE3] hover:shadow-2xl hover:shadow-[#E62E6B]/20 transition-shadow duration-300" data-testid={`process-card-${p.no}`}>
                <div className="w-10 h-10 rounded-full bg-[#FBE9F0] text-[#E62E6B] font-mono text-sm flex items-center justify-center" style={{ transform: "translateZ(30px)" }}>{p.no}</div>
                <h3 className="font-display text-xl font-bold text-[#4A2530] mt-5">{p.title}</h3>
                <p className="mt-3 text-sm text-[#5C4E52] leading-relaxed">{p.desc}</p>
                <div className="absolute top-6 right-6 w-8 h-px bg-[#F4B7CE]" />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
