import React from "react";
import { whoWeServe } from "../mock/mock";

const WhoWeServe = () => {
  return (
    <section className="relative bg-[#EBE6DB] py-24 md:py-32">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Made for you</span>
          <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">Who we serve best</h2>
          <p className="mt-5 text-[#5C4E52]">As a wedding makeup artist working across Bangalore, we tailor the approach to who's in the chair.</p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {whoWeServe.map((w, i) => (
            <div key={w.key} className={`group relative bg-[#F4F1EA] rounded-3xl p-8 border border-[#E0D6C6] hover:bg-[#2B1B20] hover:-translate-y-1.5 transition-all duration-400 ${i === 4 ? "lg:col-span-1" : ""}`}>
              <div className="font-display text-5xl font-bold text-[#E4D6C0] group-hover:text-[#E62E6B] transition-colors">{w.key}</div>
              <h3 className="font-display text-xl font-bold text-[#2B1B20] group-hover:text-white mt-4 transition-colors">{w.title}</h3>
              <p className="mt-3 text-sm text-[#6B5C60] group-hover:text-[#D6C7CC] leading-relaxed transition-colors">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoWeServe;
