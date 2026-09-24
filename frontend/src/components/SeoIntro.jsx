import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./fx/Reveal";

export const SeoIntro = ({ page, ctaTo = "/contact", onCta, className = "" }) => {
  if (!page) return null;
  const btn = "mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#E62E6B] text-white font-medium hover:bg-[#C81F57] transition-colors shadow-lg shadow-[#E62E6B]/25";
  return (
    <section className={`max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pb-14 md:pb-20 ${className}`} data-testid="seo-intro">
      <Reveal>
        <div className="relative bg-white rounded-[24px] border border-[#F1DCE3] p-6 sm:p-10 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#E62E6B]/10 blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl">
            <h1 className="font-display text-[#4A2530] text-3xl sm:text-4xl lg:text-5xl leading-[1.08]" data-testid="seo-h1">{page.h1}</h1>
            <h2 className="mt-4 text-base md:text-lg font-medium text-[#4A2530]" data-testid="seo-h1-heading">{page.h1Heading}</h2>
            {page.h1Sub && <p className="mt-3 text-sm sm:text-base text-[#5C4E52] leading-relaxed" data-testid="seo-h1-sub">{page.h1Sub}</p>}
            {page.conclusion && <p className="mt-5 pl-4 border-l-2 border-[#E62E6B] text-sm sm:text-base text-[#5C4E52] leading-relaxed italic" data-testid="seo-conclusion">{page.conclusion}</p>}
            {onCta
              ? <button onClick={onCta} className={btn} data-testid="seo-cta">{page.cta} <ArrowUpRight size={16} /></button>
              : <Link to={ctaTo} className={btn} data-testid="seo-cta">{page.cta} <ArrowUpRight size={16} /></Link>}
          </div>
        </div>
      </Reveal>
    </section>
  );
};
