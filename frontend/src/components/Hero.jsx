import React, { useEffect, useRef } from "react";
import { Play, Check, Star } from "lucide-react";
import { heroStats, heroVideo, heroVideoWebm, heroVideoPoster } from "../mock/mock";
import { scrollToId } from "./Navbar";

const Hero = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    };
    v.load();
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    return () => v.removeEventListener("canplay", tryPlay);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden bg-[#F4F1EA] grain min-h-screen flex flex-col justify-center">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={heroVideoPoster}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={heroVideoWebm} type="video/webm" />
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F1EA] via-[#F4F1EA]/92 to-[#F4F1EA]/25 md:to-[#F4F1EA]/5" />
        <div className="absolute inset-0 bg-[#F4F1EA]/35 md:bg-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F4F1EA] to-transparent" />
      </div>

      {/* Editorial corner labels */}
      <div className="absolute top-24 left-6 md:left-10 z-10 font-mono text-[11px] tracking-[0.2em] text-[#8B7F82]">No. 001 / SS26</div>
      <div className="hidden md:block absolute top-24 right-10 z-10 font-mono text-[11px] tracking-[0.2em] text-[#8B7F82] text-right">Bridal · HD · Golden Hour</div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-6 md:px-10 w-full pt-32 md:pt-24 pb-14">
        <div className="max-w-[660px]">
          <div className="flex items-center gap-2.5 fade-up">
            <span className="w-2 h-2 rounded-full bg-[#E62E6B] animate-pulse" />
            <span className="font-mono text-[11px] tracking-[0.24em] text-[#8B7F82] uppercase">Bridal Makeup Artist in Bangalore · Est. 9 years</span>
          </div>

          <h1 className="font-display text-[#4A2530] mt-6 text-[44px] leading-[1.03] sm:text-[56px] md:text-[66px] lg:text-[72px] font-medium">
            <span className="fade-up delay-1">Makeup that reads </span>
            <span className="fade-up delay-1 italic font-bold text-[#E62E6B]">flawless</span>
            <span className="fade-up delay-2"> on camera, feels </span>
            <span className="fade-up delay-2 italic font-bold text-[#E62E6B]">effortless</span>
            <span className="fade-up delay-3"> in person.</span>
          </h1>

          <p className="fade-up delay-3 mt-7 text-[17px] md:text-lg leading-relaxed text-[#4A3B3F] max-w-[540px]">
            Rekha Krishnamurthy is Bangalore's <span className="font-semibold text-[#2B1B20]">best bridal makeup artist</span> — a <span className="font-semibold text-[#2B1B20]">wedding makeup artist</span> trusted for bridal makeup Bangalore-wide, plus self grooming classes for everyday confidence.
          </p>

          <div className="fade-up delay-4 mt-9 flex flex-wrap items-center gap-5">
            <button onClick={() => scrollToId("contact")} className="px-8 py-4 rounded-full bg-[#2B1B20] text-white text-[15px] font-medium hover:bg-[#4A2530] transition-colors duration-300 shadow-lg shadow-black/10">
              Book Your Free Consultation
            </button>
            <button onClick={() => scrollToId("reels")} className="group flex items-center gap-3 text-[#2B1B20]">
              <span className="w-12 h-12 rounded-full border border-[#B9A7AC] bg-white/70 backdrop-blur flex items-center justify-center group-hover:bg-[#E62E6B] group-hover:border-[#E62E6B] group-hover:text-white transition-all duration-300">
                <Play size={16} className="ml-0.5 fill-current" />
              </span>
              <span className="text-[15px]">Watch the reel</span>
            </button>
          </div>

          <div className="fade-up delay-4 mt-9 flex flex-wrap gap-x-7 gap-y-3">
            {["Makeup from ₹999", "Free consultation", "No visit charge — party, event & wedding bookings"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-[#4A3B3F]"><Check size={16} className="text-[#E62E6B]" /> {t}</div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-[#D3C7BA] grid grid-cols-3 max-w-[520px] divide-x divide-[#D3C7BA]">
            {heroStats.map((s, i) => (
              <div key={s.label} className={i === 0 ? "pr-6" : "px-6"}>
                <div className="font-display text-3xl md:text-4xl font-bold text-[#2B1B20] flex items-center gap-1">
                  {s.value}
                  {s.label === "Google rating" && <Star size={16} className="fill-[#E62E6B] text-[#E62E6B]" />}
                </div>
                <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#8B7F82] mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
