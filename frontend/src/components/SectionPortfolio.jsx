import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { portfolio } from "../mock/mock";

const SectionPortfolio = () => {
  const items = portfolio.slice(0, 6);
  const [active, setActive] = useState(null);

  return (
    <section className="relative bg-[#F4F1EA] py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#E62E6B]">
              <span className="w-6 h-px bg-[#E62E6B]" /> Portfolio
            </span>
            <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">Recent work</h2>
          </div>
          <Link to="/portfolio" className="group inline-flex items-center gap-2 text-[#2B1B20] font-medium border-b-2 border-[#E62E6B] pb-1 w-fit">
            View full gallery
            <ArrowUpRight size={18} className="text-[#E62E6B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {items.map((p, i) => (
            <div
              key={p.id}
              onMouseEnter={() => setActive(p.id)}
              onMouseLeave={() => setActive(null)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${i === 0 ? "md:row-span-2 md:col-span-1" : ""}`}
            >
              <img
                src={p.image}
                alt={p.title}
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "h-[300px] md:h-full" : "h-[220px] md:h-[280px]"}`}
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-[#2B1B20]/70 via-[#2B1B20]/10 to-transparent transition-opacity duration-300 ${active === p.id ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"}`} />
              <div className="absolute bottom-0 left-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#F4B7CE]">{p.category}</span>
                <div className="font-display text-lg font-semibold text-white">{p.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionPortfolio;
