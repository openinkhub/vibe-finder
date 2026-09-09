import React from "react";
import { Play } from "lucide-react";
import { reels } from "../mock/mock";

const Reels = () => {
  return (
    <section id="reels" className="relative bg-[#EBE6DB] py-24 md:py-28 scroll-mt-20">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="max-w-2xl mb-12">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Short-form</span>
          <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">Behind the brush</h2>
          <p className="mt-5 text-[#5C4E52]">Process reels — trials, transformations, and technique — the way this work is actually watched now.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {reels.map((r) => (
            <button key={r.title} className="group relative rounded-2xl overflow-hidden aspect-[9/14] bg-[#2B1B20] text-left">
              <img src={r.image} alt={r.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B20]/85 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-12 h-12 rounded-full bg-white/85 backdrop-blur flex items-center justify-center text-[#E62E6B] group-hover:scale-110 group-hover:bg-[#E62E6B] group-hover:text-white transition-all duration-300"><Play size={18} className="ml-0.5 fill-current" /></span>
              </div>
              <span className="absolute top-3 right-3 font-mono text-[10px] text-white bg-black/40 px-2 py-1 rounded">{r.time}</span>
              <div className="absolute bottom-0 left-0 p-4"><div className="font-display text-sm font-semibold text-white leading-snug">{r.title}</div></div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reels;
