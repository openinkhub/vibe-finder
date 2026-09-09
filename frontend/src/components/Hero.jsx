import React from "react";
import { Link } from "react-router-dom";
import { Play, Check, Star } from "lucide-react";
import { heroStats, heroTicker, heroVideo, heroVideoPoster } from "../mock/mock";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#F4F1EA] grain min-h-screen flex flex-col justify-center">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          src={heroVideo}
          poster={heroVideoPoster}
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Cream scrim — heavy on the left for text legibility, clearer on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F1EA] via-[#F4F1EA]/90 to-[#F4F1EA]/25 md:to-[#F4F1EA]/5" />
        <div className="absolute inset-0 bg-[#F4F1EA]/30 md:bg-transparent" />
        {/* bottom fade into ticker */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F4F1EA] to-transparent" />
      </div>

      {/* soft decorative blobs */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#F4B7CE]/40 blur-3xl z-0" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 w-full pt-32 md:pt-28 pb-16">
        <div className="max-w-[640px]">
          <div className="flex items-center gap-2.5 fade-up">
            <span className="w-2 h-2 rounded-full bg-[#E62E6B] animate-pulse" />
            <span className="text-[11px] md:text-xs tracking-[0.32em] text-[#8B7F82] uppercase">
              Bridal Makeup Artist in Bangalore &middot; Est. 9 Years
            </span>
          </div>

          <h1 className="font-display text-[#4A2530] mt-6 text-[46px] leading-[1.02] sm:text-[58px] md:text-[68px] lg:text-[74px] font-medium">
            <span className="fade-up delay-1 block">Makeup that reads</span>
            <span className="fade-up delay-1 block italic font-bold text-[#E62E6B]">flawless</span>
            <span className="fade-up delay-2 block">on camera,</span>
            <span className="fade-up delay-2 block">feels effortless</span>
            <span className="fade-up delay-3 block">in person.</span>
          </h1>

          <p className="fade-up delay-3 mt-7 text-[17px] md:text-lg leading-relaxed text-[#4A3B3F] max-w-[520px]">
            Rekha Krishnamurthy is Bangalore&rsquo;s{" "}
            <span className="font-semibold text-[#2B1B20]">best bridal makeup artist</span> &mdash; a{" "}
            <span className="font-semibold text-[#2B1B20]">wedding makeup artist</span> trusted for bridal makeup
            Bangalore-wide, plus self grooming classes for everyday confidence.
          </p>

          <div className="fade-up delay-4 mt-9 flex flex-wrap items-center gap-5">
            <Link
              to="/contact"
              className="px-8 py-4 rounded-full bg-[#2B1B20] text-white text-[15px] font-medium hover:bg-[#4A2530] transition-colors duration-300 shadow-lg shadow-black/10"
            >
              Book Your Free Consultation
            </Link>
            <button className="group flex items-center gap-3 text-[#2B1B20]">
              <span className="w-12 h-12 rounded-full border border-[#B9A7AC] bg-white/70 backdrop-blur flex items-center justify-center group-hover:bg-[#E62E6B] group-hover:border-[#E62E6B] group-hover:text-white transition-all duration-300">
                <Play size={16} className="ml-0.5 fill-current" />
              </span>
              <span className="text-[15px]">Watch the reel</span>
            </button>
          </div>

          <div className="fade-up delay-4 mt-9 flex flex-wrap gap-x-7 gap-y-3">
            {["Makeup from \u20B9999", "Free consultation", "No visit charge \u2014 party, event & wedding bookings"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-[#4A3B3F]">
                <Check size={16} className="text-[#E62E6B]" />
                {t}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-10 pt-8 border-t border-[#D3C7BA] grid grid-cols-3 max-w-[520px] divide-x divide-[#D3C7BA]">
            {heroStats.map((s, i) => (
              <div key={s.label} className={i === 0 ? "pr-6" : "px-6"}>
                <div className="font-display text-3xl md:text-4xl font-bold text-[#2B1B20] flex items-center gap-1">
                  {s.value}
                  {s.label === "Google Rating" && <Star size={16} className="fill-[#E62E6B] text-[#E62E6B]" />}
                </div>
                <div className="text-[11px] tracking-[0.18em] uppercase text-[#8B7F82] mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating rating card over the video (right) */}
      <div className="hidden lg:block absolute right-16 bottom-40 z-10 bg-white/90 backdrop-blur rounded-2xl shadow-xl px-5 py-4 border border-white/60 fade-up delay-4">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="fill-[#E62E6B] text-[#E62E6B]" />
          ))}
        </div>
        <div className="font-display text-lg font-bold text-[#2B1B20] mt-1">Loved by 500+ brides</div>
        <div className="text-xs text-[#8B7F82]">Google &amp; Instagram reviews</div>
      </div>

      {/* Ticker */}
      <div className="relative z-10 py-4 bg-[#2B1B20] overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[...heroTicker, ...heroTicker, ...heroTicker].map((t, i) => (
            <span key={i} className="flex items-center text-[#F4B7CE] text-sm tracking-[0.3em] uppercase">
              <span className="mx-8">{t}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E62E6B]" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
