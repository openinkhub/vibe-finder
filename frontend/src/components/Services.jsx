import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { services as fallback } from "../mock/mock";
import { api, imgUrl } from "../lib/api";
import { scrollToId } from "./Navbar";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Services = () => {
  const [services, setServices] = useState(fallback);
  useEffect(() => { api.get("/content/services").then((r) => { if (r.data?.length) setServices(r.data); }).catch(() => {}); }, []);
  return (
    <section id="services" className="relative bg-[#F4F1EA] py-20 md:py-32 scroll-mt-20" data-testid="services-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-6 mb-10 md:mb-14">
          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Bridal Makeup Bangalore</span>
            <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5 max-w-xl">A look for every occasion</h2>
          </div>
          <p className="text-sm sm:text-base text-[#5C4E52] max-w-sm">From the wedding morning to the runway call time — one standard of finish across every service.</p>
        </Reveal>

        <div className="border-t border-[#F1DCE3]" style={{ perspective: 1400 }}>
          {services.map((s, i) => (
            <motion.div
              key={s.no}
              initial={{ opacity: 0, x: -30, rotateY: -8 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center" }}
            >
              <button
                onClick={() => scrollToId("contact")}
                className="group w-full text-left grid grid-cols-[40px_1fr] md:grid-cols-[80px_1fr_auto] gap-x-3 gap-y-3 md:gap-8 items-center py-6 sm:py-8 border-b border-[#F1DCE3] hover:bg-[#FBE9F0] transition-colors duration-300 px-2 md:px-4 rounded-2xl"
                data-testid={`service-row-${s.no}`}
              >
                <div className="font-mono text-sm text-[#F4B7CE] group-hover:text-[#E62E6B] transition-colors">{s.no}</div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <TiltCard max={14} lift={false} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 shadow-lg shadow-[#E62E6B]/15">
                    <img src={imgUrl(s.image)} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </TiltCard>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-[#4A2530]">{s.title}</h3>
                    <p className="text-sm text-[#5C4E52] mt-1.5 max-w-xl leading-relaxed">{s.desc}</p>
                  </div>
                </div>
                <div className="col-start-2 md:col-start-auto flex items-center gap-2 text-[#E62E6B] font-medium text-sm md:justify-self-end">
                  {s.cta}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
