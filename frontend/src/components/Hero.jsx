import React from "react";
import { Link } from "react-router-dom";
import { Play, Check, Star } from "lucide-react";
import { heroStats, heroTicker, heroImage } from "../mock/mock";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#F4F1EA] grain">
      {/* soft decorative blobs */}
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#F4B7CE]/40 blur-3xl" />
      <div className="absolute top-40 -left-32 w-[360px] h-[360px] rounded-full bg-[#E9DFF0]/50 blur-3xl" />

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 pt-36 md:pt-40 pb-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 fade-up">
              <span className="w-2 h-2 rounded-full bg-[#E62E6B] animate-pulse" />
              <span className="text-[11px] md:text-xs tracking-[0.32em] text-[#8B7F82] uppercase">
                Bridal Makeup Artist in Bangalore &middot; Est. 9 Years
              </span>
            </div>

            <h1 className="font-display text-[#4A2530] mt-6 text-[46px] leading-[1.02] sm:text-[58px] md:text-[68px] lg:text-[66px] xl:text-[74px] font-medium">
              <span className="fade-up delay-1 block">Makeup that reads</span>
              <span className="fade-up delay-1 block italic font-bold text-[#E62E6B]">flawless</span>
              <span className="fade-up delay-2 block">on camera,</span>
              <span className="fade-up delay-2 block">feels effortless</span>
              <span className="fade-up delay-3 block">in person.</span>
            </h1>

            <p className="fade-up delay-3 mt-7 text-[17px] md:text-lg leading-relaxed text-[#5C4E52] max-w-[480px]">
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
                <span className="w-12 h-12 rounded-full border border-[#CDBFC4] flex items-center justify-center group-hover:bg-[#E62E6B] group-hover:border-[#E62E6B] group-hover:text-white transition-all duration-300">
                  <Play size={16} className="ml-0.5 fill-current" />
                </span>
                <span className="text-[15px]">Watch the reel</span>
              </button>
            </div>

            <div className="fade-up delay-4 mt-9 flex flex-wrap gap-x-7 gap-y-3">
              {["Makeup from \u20B9999", "Free consultation", "No visit charge \u2014 party, event & wedding bookings"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-[#5C4E52]">
                  <Check size={16} className="text-[#E62E6B]" />
                  {t}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 pt-8 border-t border-[#DDD4C6] grid grid-cols-3 max-w-[520px] divide-x divide-[#DDD4C6]">
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

          {/* Right image */}
          <div className="relative fade-up delay-2">
            <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-[#4A2530]/20">
              <img
                src={heroImage}
                alt="Bridal makeup by Rekha Krishnamurthy"
                className="w-full h-[440px] sm:h-[560px] lg:h-[680px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B20]/25 via-transparent to-transparent" />
            </div>

            {/* Floating rating card */}
            <div className="absolute -left-4 md:-left-8 bottom-24 bg-white/95 backdrop-blur rounded-2xl shadow-xl px-5 py-4 border border-[#EFEAE0]">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-[#E62E6B] text-[#E62E6B]" />
                ))}
              </div>
              <div className="font-display text-lg font-bold text-[#2B1B20] mt-1">Loved by 500+ brides</div>
              <div className="text-xs text-[#8B7F82]">Google &amp; Instagram reviews</div>
            </div>

            {/* Floating tag */}
            <div className="absolute -right-2 top-8 bg-[#E62E6B] text-white rounded-full px-5 py-2.5 shadow-lg text-sm font-medium rotate-3">
              HD &amp; Airbrush
            </div>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="relative mt-14 py-4 bg-[#2B1B20] overflow-hidden">
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
