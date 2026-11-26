import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { pagesByGroup } from "../lib/pages";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const WhoWeServe = () => {
  const services = pagesByGroup("Services");
  return (
    <section className="relative bg-[#EBE6DB] py-20 md:py-32" data-testid="who-we-serve-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="max-w-2xl">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#C8215A]">Made for you</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Makeup artist for every occasion</h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5C4E52]">As a wedding makeup artist across Bangalore, Rekha also tailors the approach to who's in the chair. So pick your event to see how.</p>
        </Reveal>

        <div className="mt-10 md:mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" style={{ perspective: 1200 }}>
          {services.map((s, i) => (
            <Reveal key={s.path} delay={i * 0.07}>
              <Link to={s.path} className="block h-full" data-testid={`serve-card-${s.path.slice(1)}`}>
                <TiltCard className="h-full flex flex-col bg-[#F4F1EA] rounded-3xl p-6 sm:p-8 border border-[#F1DCE3] hover:bg-[#E62E6B] hover:border-[#E62E6B] transition-colors duration-500 shadow-[0_20px_50px_-35px_rgba(230,46,107,0.5)]">
                  <div className="font-display text-5xl font-bold text-[#F4B7CE] group-hover:text-white/40 transition-colors" style={{ transform: "translateZ(30px)" }}>{String.fromCharCode(65 + i)}</div>
                  <h3 className="font-display text-xl font-bold text-[#4A2530] group-hover:text-white mt-4 transition-colors" style={{ transform: "translateZ(20px)" }}>{s.cardTitle || s.heroHeadline}</h3>
                  <p className="mt-3 text-sm text-[#5C4E52] group-hover:text-white/90 leading-relaxed transition-colors flex-1">{s.heroSub}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#C8215A] group-hover:text-white transition-colors">Explore {s.name} <ArrowUpRight size={15} /></span>
                </TiltCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoWeServe;
