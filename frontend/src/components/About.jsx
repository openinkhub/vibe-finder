import React from "react";
import { aboutStats } from "../mock/mock";

const About = () => {
  return (
    <section id="about" className="relative bg-[#F4F1EA] py-24 md:py-32 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Image with editorial caption */}
          <div className="relative">
            <div className="relative rounded-[24px] overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1600685890506-593fdf55949b" alt="Studio, Bengaluru" className="w-full h-[420px] md:h-[560px] object-cover" />
              <div className="absolute bottom-4 left-4 font-mono text-[11px] tracking-[0.15em] text-white bg-black/35 backdrop-blur px-3 py-1.5 rounded">Studio · Bengaluru</div>
            </div>
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#E62E6B] rounded-tl-[24px]" />
          </div>

          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">About the artist</span>
            <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-[1.08] mt-5">
              Nine years of listening to faces before <span className="italic text-[#E62E6B]">painting</span> them.
            </h2>
            <p className="mt-6 text-[#5C4E52] leading-relaxed">
              Widely regarded as the <span className="font-semibold text-[#2B1B20]">best bridal makeup artist in Bangalore</span>, Rekha believes the best makeup is the kind that disappears into the person wearing it — a foundation that behaves like skin, a base built to survive twelve hours and a hundred hugs, an eye that photographs the way it feels.
            </p>
            <p className="mt-4 text-[#5C4E52] leading-relaxed">
              Based in Bengaluru and travelling for destination weddings and fashion assignments across India, she's built a studio known for one rule: no double bookings, ever. Your date is exclusively yours.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[#DDD4C6] pt-8">
              {aboutStats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl md:text-4xl font-bold text-[#2B1B20]">{s.value}</div>
                  <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8B7F82] mt-2">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
