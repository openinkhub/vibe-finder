import React from "react";
import { Star } from "lucide-react";
import { pricing } from "../mock/mock";
import { scrollToId } from "./Navbar";

const Pricing = () => {
  return (
    <section id="pricing" className="relative bg-[#2B1B20] py-24 md:py-32 scroll-mt-20 overflow-hidden">
      <div className="absolute -top-24 -right-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/12 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#F4B7CE]">Transparent pricing</span>
          <h2 className="font-display text-white text-4xl md:text-5xl leading-tight mt-5">Makeup starting from <span className="italic text-[#F4B7CE]">₹999/-</span></h2>
          <p className="mt-5 text-[#C9B7BD]">Free consultation on every enquiry. No visit charge for party, event or wedding bookings.</p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pricing.map((p) => (
            <div key={p.title} className={`relative rounded-3xl p-8 border transition-all duration-300 ${p.featured ? "bg-[#E62E6B] border-[#E62E6B] shadow-2xl" : "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]"}`}>
              {p.featured && <span className="absolute top-6 right-6 inline-flex items-center gap-1 bg-white text-[#E62E6B] text-xs font-medium px-3 py-1.5 rounded-full"><Star size={12} className="fill-[#E62E6B]" /> Most booked</span>}
              <div className={`font-display text-4xl font-bold ${p.featured ? "text-white" : "text-[#F4B7CE]"}`}>{p.price}</div>
              <h3 className={`font-display text-xl font-semibold mt-4 ${p.featured ? "text-white" : "text-white"}`}>{p.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${p.featured ? "text-white/85" : "text-[#C9B7BD]"}`}>{p.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-[#9E858C] max-w-2xl mx-auto">Final pricing depends on look, location and event duration — confirmed free of charge at consultation.</p>
        <div className="mt-8 text-center">
          <button onClick={() => scrollToId("contact")} className="px-8 py-4 rounded-full bg-white text-[#2B1B20] font-medium hover:bg-[#F4B7CE] transition-colors">Book Your Free Consultation</button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
