import React from "react";
import { heroCategories, heroPortrait, heroVideo } from "../mock/mock";

const MAROON = "#8A1E3F";

const CategoryBlock = ({ item, align }) => (
  <div className={`fade-up ${align === "right" ? "text-center lg:text-left" : "text-center lg:text-right"}`}>
    <div className={`flex justify-center ${align === "right" ? "lg:justify-start" : "lg:justify-end"}`}>
      <span
        className="inline-block px-8 py-2.5 rounded-full text-white text-lg md:text-xl font-poppins font-semibold shadow-md"
        style={{ backgroundColor: MAROON }}
      >
        {item.title}
      </span>
    </div>
    <div className="font-script text-3xl md:text-4xl mt-3" style={{ color: "#C0466F" }}>Makeup</div>
    <p className="font-poppins text-[15px] md:text-base text-[#6a6a6a] leading-relaxed mt-1 max-w-[280px] inline-block">
      {item.tagline}
    </p>
  </div>
);

const Hero = () => {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Watercolor background: pastel gradient base + uploaded video wash */}
      <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(120deg, #FBE7D6 0%, #FDF1EC 30%, #FBE3EC 65%, #F7D9E6 100%)" }} />
      <video
        className="absolute inset-0 z-0 w-full h-full object-cover mix-blend-lighten opacity-90"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 z-0 bg-white/10" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-10 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,460px)_1fr] gap-10 lg:gap-6 items-center">
          {/* Left categories */}
          <div className="order-2 lg:order-1 flex flex-col gap-12 lg:gap-16">
            {heroCategories.left.map((item) => (
              <CategoryBlock key={item.title} item={item} align="left" />
            ))}
          </div>

          {/* Center portrait */}
          <div className="order-1 lg:order-2 flex justify-center">
            <img
              src={heroPortrait}
              alt="Watercolor portrait"
              className="w-[280px] sm:w-[360px] lg:w-full max-w-[460px] object-contain drop-shadow-xl"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          {/* Right categories */}
          <div className="order-3 flex flex-col gap-12 lg:gap-16 lg:items-start">
            {heroCategories.right.map((item) => (
              <CategoryBlock key={item.title} item={item} align="right" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
