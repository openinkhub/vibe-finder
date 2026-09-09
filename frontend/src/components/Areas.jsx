import React from "react";
import { MapPin } from "lucide-react";
import { areas } from "../mock/mock";

const Areas = () => {
  return (
    <section className="relative bg-[#EBE6DB] py-20 md:py-24">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1fr_1.4fr] gap-12 items-center">
        <div>
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Best service, near you</span>
          <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">Areas we serve across Bangalore</h2>
          <p className="mt-5 text-[#5C4E52] max-w-md">Bridal makeup Bangalore-wide, with a home base close to South Bangalore's wedding halls and studios.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {areas.map((a) => (
            <div key={a} className="inline-flex items-center gap-2 bg-[#F4F1EA] border border-[#DCD2C2] rounded-full px-6 py-3.5 text-[#2B1B20] font-medium hover:border-[#E62E6B] hover:text-[#E62E6B] transition-colors">
              <MapPin size={16} className="text-[#E62E6B]" /> {a}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Areas;
