import React from "react";
import { srcSetFor } from "../lib/img";
import { Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { loyaltyPoints, loyaltyImage } from "../mock/mock";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Loyalty = () => {
  return (
    <section className="relative bg-[#F4F1EA] py-20 md:py-32 overflow-hidden" data-testid="loyalty-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <Reveal className="order-2 lg:order-1">
          <TiltCard max={7} className="rounded-[24px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(230,46,107,0.45)]">
            <img width="800" height="1000" loading="lazy" decoding="async" src={loyaltyImage} srcSet={srcSetFor(loyaltyImage)} sizes="(min-width: 768px) 45vw, 100vw" alt="Community · Loyalty Program" className="w-full h-[340px] sm:h-[420px] md:h-[500px] object-cover" />
            <div className="absolute bottom-4 left-4 font-mono text-[11px] tracking-[0.15em] text-white bg-[#E62E6B]/90 backdrop-blur px-3 py-1.5 rounded">Community · Loyalty Program</div>
          </TiltCard>
        </Reveal>
        <Reveal delay={0.1} className="order-1 lg:order-2">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Join the community</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Join our loyalty program, get a <span className="italic text-[#E62E6B]">free reward</span></h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5C4E52] leading-relaxed max-w-lg">Become part of the Rekha Krishnamurthy community — each booking earns loyalty points, and each new member gets a welcome reward on joining.</p>
          <div className="mt-8 sm:mt-9 space-y-3">
            {loyaltyPoints.map((t, i) => (
              <Reveal key={t} delay={0.2 + i * 0.08} rotate={-12}>
                <div className="flex items-start gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-[#FBE9F0] text-[#E62E6B] font-mono text-xs flex items-center justify-center">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[#5C4E52] text-sm sm:text-base pt-1">{t}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Link to="/community" className="mt-8 sm:mt-9 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#D6245F] text-white font-medium hover:bg-[#C81F57] hover:-translate-y-0.5 transition-all shadow-xl shadow-[#E62E6B]/30" data-testid="loyalty-join-btn">
            <Gift size={18} /> Join the Community
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default Loyalty;
