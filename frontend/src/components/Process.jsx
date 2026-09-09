import React from "react";
import { process } from "../mock/mock";

const Process = () => {
  return (
    <section className="relative bg-[#F4F1EA] py-24 md:py-32">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="max-w-2xl mb-14">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">How it works</span>
          <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">From enquiry to wedding day</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {process.map((p) => (
            <div key={p.no} className="relative bg-white rounded-3xl p-8 border border-[#E4DBCB] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="font-mono text-sm text-[#E62E6B]">{p.no}</div>
              <h3 className="font-display text-xl font-bold text-[#2B1B20] mt-4">{p.title}</h3>
              <p className="mt-3 text-sm text-[#6B5C60] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
