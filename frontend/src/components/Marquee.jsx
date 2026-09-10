import React from "react";
import { locationTicker } from "../mock/mock";

const Marquee = () => {
  const items = [...locationTicker, ...locationTicker, ...locationTicker];
  return (
    <div className="relative py-4 sm:py-5 bg-[#E62E6B] overflow-hidden" data-testid="marquee">
      <div className="flex whitespace-nowrap animate-marquee w-max">
        {items.map((t, i) => (
          <span key={i} className="flex items-center font-display italic text-white text-lg sm:text-xl md:text-2xl">
            <span className="mx-5 sm:mx-6 md:mx-9">{t}</span>
            <span className="text-[#F4B7CE]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
