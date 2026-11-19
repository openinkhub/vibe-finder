import React, { useRef } from "react";
import { useScroll, motion, useTransform } from "@/lib/motion";
import { aboutStats } from "../mock/mock";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";
import { usePageImages, heroImage, heroImageAlt } from "../hooks/usePageImages";
import { getPage } from "../lib/pages";
import { srcSetFor } from "../lib/img";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1600685890506-593fdf55949b?auto=format&fit=crop&w=1000&q=70";

const About = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const map = usePageImages();
  const homePage = getPage("/");
  const artistImg = heroImage(homePage, map) || FALLBACK_IMG;
  const artistAlt = heroImageAlt(homePage, map) || "Studio, Bengaluru";

  return (
    <section id="about" ref={ref} className="relative bg-[#F4F1EA] py-20 md:py-32 scroll-mt-20 overflow-hidden" data-testid="about-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <Reveal>
            <div className="relative">
              <TiltCard max={7} className="rounded-[24px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(230,46,107,0.45)]">
                <motion.img style={{ y: imgY }} width="800" height="1000" loading="lazy" decoding="async" src={artistImg} srcSet={srcSetFor(artistImg)} sizes="(min-width: 768px) 40vw, 100vw" alt={artistAlt} className="w-full h-[360px] sm:h-[420px] md:h-[560px] object-cover scale-110" />
                <div className="absolute bottom-4 left-4 font-mono text-[11px] tracking-[0.15em] text-white bg-[#E62E6B]/90 backdrop-blur px-3 py-1.5 rounded">Studio · Bengaluru</div>
              </TiltCard>
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-20 h-20 sm:w-24 sm:h-24 border-t-2 border-l-2 border-[#E62E6B] rounded-tl-[24px] pointer-events-none" />
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">About the artist</span>
            <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-[1.06] mt-4 sm:mt-5">
              14 Years of Bridal Artistry <span className="italic text-[#E62E6B]">&amp; Expertise</span>
            </h2>
            <p className="mt-5 sm:mt-6 text-[#5C4E52] leading-relaxed text-sm sm:text-base">
              For Rekha, great bridal makeup starts long before the brushes come out. It starts with understanding <span className="font-semibold text-[#4A2530]">you</span>: your features, your skin, your style and how you want to feel on your wedding day.
            </p>
            <p className="mt-4 text-[#5C4E52] leading-relaxed text-sm sm:text-base">
              Her approach is simple: enhance, don't mask. Whether you choose <span className="font-semibold text-[#4A2530]">HD or Airbrush makeup</span>, every look is tailored to photograph beautifully, feel comfortable and last through the hugs, happy tears, celebrations and long hours that make your day unforgettable.
            </p>
            <p className="mt-4 text-[#5C4E52] leading-relaxed text-sm sm:text-base">
              Based in Bengaluru and available for <span className="font-semibold text-[#4A2530]">destination weddings, celebrations and fashion assignments across India</span>, Rekha offers something equally important: her complete attention. <span className="font-semibold text-[#4A2530]">No double bookings. No rushing between brides. Your date is exclusively yours.</span>
            </p>

            <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-3 sm:gap-6 border-t border-[#F1DCE3] pt-7 sm:pt-8">
              {aboutStats.map((s, i) => (
                <Reveal key={s.label} delay={0.2 + i * 0.08}>
                  <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#4A2530]">{s.value}</div>
                  <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.14em] uppercase text-[#6E6266] mt-2">{s.label}</div>
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
