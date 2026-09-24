import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { pagesByGroup } from "../lib/pages";
import { usePageImages, heroImage } from "../hooks/usePageImages";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Portfolio = () => {
  const items = pagesByGroup("Portfolio");
  const map = usePageImages();
  return (
    <section id="portfolio" className="relative bg-[#F4F1EA] py-20 md:py-32 scroll-mt-20" data-testid="portfolio-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-6 mb-8 md:mb-10">
          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Selected work · Contact sheet</span>
            <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Portfolio</h2>
          </div>
          <p className="text-sm sm:text-base text-[#5C4E52] max-w-sm">A working archive of shoots, weddings and reels — tap a frame to open that portfolio.</p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5" style={{ perspective: 1400 }}>
          {items.map((p, i) => (
            <motion.div
              key={p.path}
              initial={{ opacity: 0, scale: 0.9, rotateY: -12 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={p.path} className="block" data-testid={`portfolio-item-${p.path.slice(1)}`}>
                <TiltCard max={9} className="w-full overflow-hidden rounded-2xl bg-[#FBE9F0] text-left shadow-[0_20px_50px_-30px_rgba(230,46,107,0.5)]">
                  <img src={heroImage(p, map)} alt={p.name} loading="lazy" className="w-full h-[200px] sm:h-[240px] md:h-[300px] object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#E62E6B]/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-white/95 text-[#4A2530] px-2 py-1 rounded">{p.name}</span>
                    <span className="font-mono text-[10px] text-white bg-[#E62E6B]/90 px-2 py-1 rounded">{String(i + 1).padStart(3, "0")}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="font-mono text-xs text-white">{p.heroHeadline}</div>
                  </div>
                </TiltCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
