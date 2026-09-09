import React from "react";
import { Check } from "lucide-react";
import { academyTracks, academyImage } from "../mock/mock";
import { scrollToId } from "./Navbar";

const Academy = () => {
  return (
    <section id="academy" className="relative bg-[#EBE6DB] py-24 md:py-32 scroll-mt-20">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Makeup Academy</span>
          <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">Learn the craft, hands-on</h2>
          <p className="mt-5 text-[#5C4E52] leading-relaxed max-w-lg">Small-batch training at the Bangalore studio — for artists building a career, and for anyone who wants to master their own face.</p>
          <div className="mt-9 space-y-3">
            {academyTracks.map((t, i) => (
              <div key={t} className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 border border-[#E4DBCB]">
                <span className="font-mono text-sm text-[#E62E6B]">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[#2B1B20] font-medium">{t}</span>
              </div>
            ))}
          </div>
          <button onClick={() => scrollToId("contact")} className="mt-9 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#2B1B20] text-white font-medium hover:bg-[#4A2530] transition-colors">View Course Details</button>
        </div>
        <div className="relative rounded-[24px] overflow-hidden shadow-xl">
          <img src={academyImage} alt="Academy · Studio Session" className="w-full h-[420px] md:h-[520px] object-cover" />
          <div className="absolute bottom-4 left-4 font-mono text-[11px] tracking-[0.15em] text-white bg-black/35 backdrop-blur px-3 py-1.5 rounded">Academy · Studio Session</div>
        </div>
      </div>
    </section>
  );
};

export default Academy;
