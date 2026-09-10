import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { portfolio as fallback, portfolioFilters } from "../mock/mock";
import { api, imgUrl } from "../lib/api";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Portfolio = () => {
  const [filter, setFilter] = useState("All Frames");
  const [lightbox, setLightbox] = useState(null);
  const [portfolio, setPortfolio] = useState(fallback);
  useEffect(() => { api.get("/content/portfolio").then((r) => { if (r.data?.length) setPortfolio(r.data.map((x, i) => ({ ...x, id: x.id, no: String(i + 1).padStart(3, "0") }))); }).catch(() => {}); }, []);
  const items = filter === "All Frames" ? portfolio : portfolio.filter((p) => p.cat === filter);

  return (
    <section id="portfolio" className="relative bg-[#F4F1EA] py-20 md:py-32 scroll-mt-20" data-testid="portfolio-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-6 mb-8 md:mb-10">
          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Selected work · Contact sheet</span>
            <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Portfolio</h2>
          </div>
          <p className="text-sm sm:text-base text-[#5C4E52] max-w-sm">A working archive of shoots, weddings and reels — filter by category or tap a frame to open it.</p>
        </Reveal>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 md:mb-10 -mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
          {portfolioFilters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${filter === f ? "bg-[#E62E6B] text-white shadow-lg shadow-[#E62E6B]/30" : "bg-white text-[#5C4E52] border border-[#F1DCE3] hover:border-[#E62E6B] hover:text-[#E62E6B]"}`} data-testid={`portfolio-filter-${f.toLowerCase().replace(/\s+/g, "-")}`}>{f}</button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5" style={{ perspective: 1400 }}>
          <AnimatePresence mode="popLayout">
            {items.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9, rotateY: -12 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard as="button" max={9} onClick={() => setLightbox(p)} className="w-full overflow-hidden rounded-2xl bg-[#FBE9F0] text-left shadow-[0_20px_50px_-30px_rgba(230,46,107,0.5)]" data-testid={`portfolio-item-${p.no || p.id}`}>
                  <img src={imgUrl(p.image)} alt={p.caption} loading="lazy" className="w-full h-[200px] sm:h-[240px] md:h-[300px] object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#E62E6B]/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-white/95 text-[#4A2530] px-2 py-1 rounded">{p.cat}</span>
                    <span className="font-mono text-[10px] text-white bg-[#E62E6B]/90 px-2 py-1 rounded">{p.no || p.id}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="font-mono text-xs text-white">{p.caption}</div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-[#F4F1EA]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" onClick={() => setLightbox(null)} data-testid="portfolio-lightbox">
            <button className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full bg-white text-[#4A2530] shadow-lg flex items-center justify-center hover:bg-[#E62E6B] hover:text-white transition-colors" aria-label="Close" data-testid="lightbox-close-btn"><X size={22} /></button>
            <motion.div initial={{ scale: 0.85, rotateX: 12, opacity: 0 }} animate={{ scale: 1, rotateX: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} style={{ transformPerspective: 1200 }} className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={imgUrl(lightbox.image)} alt={lightbox.caption} className="w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl shadow-[#E62E6B]/30" />
              <div className="font-mono text-sm text-[#E62E6B] text-center mt-5">{lightbox.no || lightbox.id} · {lightbox.caption}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Portfolio;
