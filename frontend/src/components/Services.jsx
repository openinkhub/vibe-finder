import React from "react";
import { srcSetFor } from "../lib/img";
import { ArrowRight } from "lucide-react";
import { motion } from "@/lib/motion";
import { Link } from "react-router-dom";
import { pagesByGroup } from "../lib/pages";
import { usePageImages, heroImage, heroImageAlt } from "../hooks/usePageImages";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Services = () => {
  const looks = pagesByGroup("Portfolio");
  const map = usePageImages();
  return (
    <section id="services" className="relative bg-[#F4F1EA] py-20 md:py-32 scroll-mt-20" data-testid="services-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-6 mb-10 md:mb-14">
          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#C8215A]">Bridal Makeup Bangalore</span>
            <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5 max-w-xl">A look for every occasion</h2>
          </div>
          <p className="text-sm sm:text-base text-[#5C4E52] max-w-sm">From the wedding morning to the runway call time, open a portfolio to see the finish for each event.</p>
        </Reveal>

        <div className="border-t border-[#F1DCE3]" style={{ perspective: 1400 }}>
          {looks.map((s, i) => (
            <motion.div
              key={s.path}
              initial={{ opacity: 0, x: -30, rotateY: -8 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center" }}
            >
              <Link
                to={s.path}
                className="group w-full text-left grid grid-cols-[40px_1fr] md:grid-cols-[80px_1fr_auto] gap-x-3 gap-y-3 md:gap-8 items-center py-6 sm:py-8 border-b border-[#F1DCE3] hover:bg-[#FBE9F0] transition-colors duration-300 px-2 md:px-4 rounded-2xl"
                data-testid={`service-row-${s.path.slice(1)}`}
              >
                <div className="font-mono text-sm text-[#F4B7CE] group-hover:text-[#C8215A] transition-colors">{String(i + 1).padStart(2, "0")}</div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <TiltCard max={14} lift={false} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 shadow-lg shadow-[#E62E6B]/15">
                    <img width="600" height="750" loading="lazy" decoding="async" src={heroImage(s, map)} srcSet={srcSetFor(heroImage(s, map))} sizes="(min-width: 1024px) 25vw, 50vw" alt={heroImageAlt(s, map)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </TiltCard>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-[#4A2530]">{s.name}</h3>
                    <p className="text-sm text-[#5C4E52] mt-1.5 max-w-xl leading-relaxed">{s.heroSub}</p>
                  </div>
                </div>
                <div className="col-start-2 md:col-start-auto flex items-center gap-2 text-[#C8215A] font-medium text-sm md:justify-self-end">
                  <span className="hidden md:inline">View {s.name} portfolio</span>
                  <span className="md:hidden">Explore</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
