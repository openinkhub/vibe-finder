import React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowUpRight } from "lucide-react";
import { services } from "../mock/mock";

const SectionServices = () => {
  return (
    <section className="relative bg-[#EBE6DB] py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#E62E6B]">
              <span className="w-6 h-px bg-[#E62E6B]" /> Services
            </span>
            <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5 max-w-xl">
              Looks crafted for every occasion
            </h2>
          </div>
          <p className="text-[#5C4E52] max-w-sm">From wedding-day bridal to everyday grooming &mdash; all with premium, long-wear products.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div
              key={s.id}
              className="group bg-white rounded-3xl overflow-hidden border border-[#E4DBCB] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-400"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative h-52 overflow-hidden">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B20]/40 to-transparent" />
                <span className="absolute top-4 left-4 bg-white/95 text-[#2B1B20] text-xs font-medium px-3 py-1.5 rounded-full">{s.price}</span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-[#2B1B20]">{s.title}</h3>
                <p className="mt-3 text-sm text-[#6B5C60] leading-relaxed">{s.desc}</p>
                <ul className="mt-5 space-y-2">
                  {s.points.slice(0, 3).map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-[#4A3B3F]">
                      <Check size={15} className="text-[#E62E6B]" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/services" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#2B1B20] text-white font-medium hover:bg-[#4A2530] transition-colors">
            View all services & pricing
            <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SectionServices;
