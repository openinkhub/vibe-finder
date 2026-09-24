import React, { useRef } from "react";
import { useScroll, motion, useTransform } from "framer-motion";
import { aboutStats } from "../mock/mock";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const About = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="about" ref={ref} className="relative bg-[#F4F1EA] py-20 md:py-32 scroll-mt-20 overflow-hidden" data-testid="about-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <Reveal>
            <div className="relative">
              <TiltCard max={7} className="rounded-[24px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(230,46,107,0.45)]">
                <motion.img style={{ y: imgY }} src="https://images.unsplash.com/photo-1600685890506-593fdf55949b" alt="Studio, Bengaluru" className="w-full h-[360px] sm:h-[420px] md:h-[560px] object-cover scale-110" />
                <div className="absolute bottom-4 left-4 font-mono text-[11px] tracking-[0.15em] text-white bg-[#E62E6B]/90 backdrop-blur px-3 py-1.5 rounded">Studio · Bengaluru</div>
              </TiltCard>
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-20 h-20 sm:w-24 sm:h-24 border-t-2 border-l-2 border-[#E62E6B] rounded-tl-[24px] pointer-events-none" />
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">About the artist</span>
            <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-[1.06] mt-4 sm:mt-5">
              Fourteen years of listening to faces before <span className="italic text-[#E62E6B]">painting</span> them.
            </h2>
            <p className="mt-5 sm:mt-6 text-[#5C4E52] leading-relaxed text-sm sm:text-base">
              Widely regarded as the <span className="font-semibold text-[#4A2530]">best bridal makeup artist in Bangalore</span>, Rekha believes the best makeup is the kind that disappears into the person wearing it — a foundation that behaves like skin, a base built to survive twelve hours and a hundred hugs, an eye that photographs the way it feels.
            </p>
            <p className="mt-4 text-[#5C4E52] leading-relaxed text-sm sm:text-base">
              Based in Bengaluru and travelling for destination weddings and fashion assignments across India, she's built a studio known for one rule: no double bookings, ever. Your date is exclusively yours.
            </p>

            <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-3 sm:gap-6 border-t border-[#F1DCE3] pt-7 sm:pt-8">
              {aboutStats.map((s, i) => (
                <Reveal key={s.label} delay={0.2 + i * 0.08}>
                  <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#4A2530]">{s.value}</div>
                  <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.14em] uppercase text-[#8B7F82] mt-2">{s.label}</div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default About;
