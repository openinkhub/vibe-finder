import React from "react";
import { faqs } from "../mock/mock";
import { Reveal } from "./fx/Reveal";

const FAQ = () => (
  <section className="relative bg-[#EBE6DB] py-20 md:py-32" data-testid="faq-section">
    <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 grid lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12">
      <Reveal>
        <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Good to know</span>
        <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Common questions</h2>
      </Reveal>
      <div className="space-y-3" style={{ perspective: 1000 }}>
        {faqs.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.05} rotate={-10}>
            <div className="rounded-2xl border border-[#F1DCE3] bg-white px-5 sm:px-7 py-5 sm:py-6" data-testid={`faq-item-${i}`}>
              <div className="flex items-start gap-4">
                <span className="shrink-0 w-9 h-9 rounded-full bg-[#D6245F] text-white font-mono text-xs flex items-center justify-center">Q</span>
                <h3 className="font-display text-base sm:text-lg md:text-xl font-semibold text-[#4A2530] pt-1.5" data-testid={`faq-question-${i}`}>{f.q}</h3>
              </div>
              <div className="flex items-start gap-4 mt-4">
                <span className="shrink-0 w-9 h-9 rounded-full bg-[#FBE9F0] text-[#E62E6B] font-mono text-xs flex items-center justify-center">A</span>
                <div className="text-sm sm:text-base text-[#5C4E52] leading-relaxed pt-1.5 space-y-2" data-testid={`faq-answer-${i}`}>
                  {(Array.isArray(f.a) ? f.a : [f.a]).map((para, j) => <p key={j}>{typeof para === "string" ? para : <strong className="text-[#4A2530]">{para.b}</strong>}</p>)}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default FAQ;
