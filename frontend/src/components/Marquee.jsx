import React from "react";
import { locationTicker } from "../mock/mock";

const Marquee = () => {
  const items = [...locationTicker, ...locationTicker, ...locationTicker];
  return (
    <div className="relative py-5 bg-[#2B1B20] overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee w-max">
        {items.map((t, i) => (
          <span key={i} className="flex items-center font-display italic text-[#F4B7CE] text-xl md:text-2xl">
            <span className="mx-6 md:mx-9">{t}</span>
            <span className="text-[#E62E6B]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
