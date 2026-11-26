import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { processPages } from "../lib/pages";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Process = () => {
  return (
    <section className="relative bg-[#F4F1EA] py-20 md:py-32 overflow-hidden" data-testid="process-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="max-w-2xl mb-10 md:mb-14">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#C8215A]">How it works</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">From enquiry to wedding day</h2>
        </Reveal>
        <div className="relative -mx-5 sm:mx-0 overflow-x-auto sm:overflow-visible">
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-5 sm:px-0 pb-4 sm:pb-0 snap-x snap-mandatory" style={{ perspective: 1200 }}>
            {processPages.map((p, i) => (
              <div key={p.path} className="snap-start shrink-0 w-[82vw] sm:w-auto">
                <Reveal delay={i * 0.1}>
                  <Link to={p.path} className="block h-full" data-testid={`process-card-${p.path.slice(1)}`}>
                    <TiltCard className="h-full flex flex-col bg-white rounded-3xl p-6 sm:p-8 border border-[#F1DCE3] hover:shadow-2xl hover:shadow-[#E62E6B]/20 transition-shadow duration-300">
                      <div className="w-10 h-10 rounded-full bg-[#FBE9F0] text-[#C8215A] font-mono text-sm flex items-center justify-center" style={{ transform: "translateZ(30px)" }}>{String(i + 1).padStart(2, "0")}</div>
                      <h3 className="font-display text-xl font-bold text-[#4A2530] mt-5">{p.name}</h3>
                      <p className="mt-3 text-sm text-[#5C4E52] leading-relaxed flex-1">{p.heroSub}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#C8215A] group-hover:gap-2.5 transition-all">{p.heroHeadline} <ArrowUpRight size={15} /></span>
                      <div className="absolute top-6 right-6 w-8 h-px bg-[#F4B7CE]" />
                    </TiltCard>
                  </Link>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
