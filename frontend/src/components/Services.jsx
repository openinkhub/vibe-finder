import React from "react";
import { ArrowRight } from "lucide-react";
import { services } from "../mock/mock";
import { scrollToId } from "./Navbar";

const Services = () => {
  return (
    <section id="services" className="relative bg-[#F4F1EA] py-24 md:py-32 scroll-mt-20">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Bridal Makeup Bangalore</span>
            <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5 max-w-xl">A look for every occasion</h2>
          </div>
          <p className="text-[#5C4E52] max-w-sm">From the wedding morning to the runway call time — one standard of finish across every service.</p>
        </div>

        <div className="border-t border-[#D8CEBF]">
          {services.map((s) => (
            <button
              key={s.no}
              onClick={() => scrollToId("contact")}
              className="group w-full text-left grid md:grid-cols-[80px_1fr_auto] gap-4 md:gap-8 items-center py-8 border-b border-[#D8CEBF] hover:bg-[#EBE6DB] transition-colors duration-300 px-2 md:px-4"
            >
              <div className="font-mono text-sm text-[#B29A8A] group-hover:text-[#E62E6B] transition-colors">{s.no}</div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:block w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-[#2B1B20]">{s.title}</h3>
                  <p className="text-sm text-[#6B5C60] mt-1.5 max-w-xl leading-relaxed">{s.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#E62E6B] font-medium text-sm md:justify-self-end pl-20 md:pl-0">
                {s.cta}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
