import React, { useState } from "react";
import { X } from "lucide-react";
import { portfolio, portfolioFilters } from "../mock/mock";

const Portfolio = () => {
  const [filter, setFilter] = useState("All Frames");
  const [lightbox, setLightbox] = useState(null);
  const items = filter === "All Frames" ? portfolio : portfolio.filter((p) => p.cat === filter);

  return (
    <section id="portfolio" className="relative bg-[#F4F1EA] py-24 md:py-32 scroll-mt-20">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Selected work · Contact sheet</span>
            <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">Portfolio</h2>
          </div>
          <p className="text-[#5C4E52] max-w-sm">A working archive of shoots, weddings and reels — filter by category or tap a frame to open it.</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {portfolioFilters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${filter === f ? "bg-[#2B1B20] text-white" : "bg-white text-[#5C4E52] border border-[#E4DBCB] hover:border-[#E62E6B] hover:text-[#E62E6B]"}`}>{f}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {items.map((p) => (
            <button key={p.id} onClick={() => setLightbox(p)} className="group relative overflow-hidden rounded-2xl bg-[#EBE6DB] text-left">
              <img src={p.image} alt={p.caption} className="w-full h-[240px] md:h-[300px] object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B20]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="font-mono text-[10px] bg-white/90 text-[#2B1B20] px-2 py-1 rounded">{p.cat}</span>
                <span className="font-mono text-[10px] text-white/90 bg-black/25 px-2 py-1 rounded">{p.id}</span>
              </div>
              <div className="absolute bottom-0 left-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="font-mono text-xs text-white">{p.caption}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-[#2B1B20]/92 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-[#E62E6B] transition-colors" aria-label="Close"><X size={22} /></button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image} alt={lightbox.caption} className="w-full max-h-[78vh] object-contain rounded-2xl" />
            <div className="font-mono text-sm text-[#F4B7CE] text-center mt-5">{lightbox.id} · {lightbox.caption}</div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Portfolio;
