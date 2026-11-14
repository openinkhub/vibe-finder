import React, { useEffect, useState } from "react";
import { Star, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { pricing as fallback } from "../mock/mock";
import { api } from "../lib/api";
import { pricingPath } from "../lib/pages";
import { scrollToId } from "./Navbar";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";
import { shortCta } from "../lib/ctaLabel";

const Pricing = () => {
  const [pricing, setPricing] = useState(fallback);
  useEffect(() => { api.get("/content/pricing").then((r) => { if (r.data?.length) setPricing(r.data); }).catch(() => {}); }, []);
  return (
    <section id="pricing" className="relative bg-[#FBE9F0] py-20 md:py-32 scroll-mt-20 overflow-hidden" data-testid="pricing-section">
      <div className="absolute -top-24 -right-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 w-[320px] h-[320px] rounded-full bg-[#F4B7CE]/40 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Transparent pricing</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Prices Starting <span className="italic text-[#E62E6B]">@₹8,000/-*</span></h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5C4E52]">Free consultation on every enquiry. No visit charge for party, event or wedding bookings.</p>
        </Reveal>

        <div className="mt-10 md:mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" style={{ perspective: 1200 }}>
          {pricing.map((p, i) => (
            <Reveal key={p.id || p.title} delay={i * 0.07}>
              <Link to={pricingPath(p.title)} className="block h-full" data-testid={`pricing-card-${i}`}>
                <TiltCard className={`h-full flex flex-col rounded-3xl p-6 sm:p-8 border transition-shadow duration-300 ${p.featured ? "bg-[#E62E6B] border-[#E62E6B] text-white shadow-2xl shadow-[#E62E6B]/40" : "bg-white border-[#F1DCE3] hover:shadow-xl hover:shadow-[#E62E6B]/15"}`}>
                  {p.featured && <span className="absolute top-5 right-5 sm:top-6 sm:right-6 inline-flex items-center gap-1 bg-white text-[#E62E6B] text-xs font-medium px-3 py-1.5 rounded-full"><Star size={12} className="fill-[#E62E6B]" /> Most booked</span>}
                  <div className={`font-display text-3xl sm:text-4xl font-bold ${p.featured ? "text-white" : "text-[#E62E6B]"}`} style={{ transform: "translateZ(30px)" }}>{p.price}</div>
                  <h3 className={`font-display text-xl font-semibold mt-4 ${p.featured ? "text-white" : "text-[#4A2530]"}`}>{p.title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed flex-1 ${p.featured ? "text-white/90" : "text-[#5C4E52]"}`}>{p.desc}</p>
                  <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-medium group-hover:gap-2.5 transition-all ${p.featured ? "text-white" : "text-[#E62E6B]"}`}>View details <ArrowUpRight size={15} /></span>
                </TiltCard>
              </Link>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 sm:mt-10 text-center text-sm text-[#8B7F82] max-w-2xl mx-auto">Final pricing depends on look, location and event duration — confirmed free of charge at consultation.</p>
        <div className="mt-6 sm:mt-8 text-center">
          <button onClick={() => scrollToId("contact")} className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-[#E62E6B] text-white text-sm sm:text-base font-medium hover:bg-[#C81F57] hover:-translate-y-0.5 transition-all shadow-xl shadow-[#E62E6B]/30" data-testid="pricing-book-btn">
            <span className="sm:hidden">{shortCta("Consult on Pricing")}</span>
            <span className="hidden sm:inline">Consult on Pricing</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
