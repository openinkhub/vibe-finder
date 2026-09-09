import React from "react";
import { Gift } from "lucide-react";
import { loyaltyPoints, loyaltyImage, brand } from "../mock/mock";

const Loyalty = () => {
  return (
    <section className="relative bg-[#F4F1EA] py-24 md:py-32">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative rounded-[24px] overflow-hidden shadow-xl order-2 lg:order-1">
          <img src={loyaltyImage} alt="Community · Loyalty Program" className="w-full h-[420px] md:h-[500px] object-cover" />
          <div className="absolute bottom-4 left-4 font-mono text-[11px] tracking-[0.15em] text-white bg-black/35 backdrop-blur px-3 py-1.5 rounded">Community · Loyalty Program</div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Join the community</span>
          <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">Join our loyalty program, get a <span className="italic text-[#E62E6B]">free reward</span></h2>
          <p className="mt-5 text-[#5C4E52] leading-relaxed max-w-lg">Become part of the Rekha Krishnamurthy community — every booking earns loyalty points, and every new member gets a welcome reward on joining.</p>
          <div className="mt-9 space-y-3">
            {loyaltyPoints.map((t, i) => (
              <div key={t} className="flex items-start gap-4">
                <span className="font-mono text-sm text-[#E62E6B] mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[#4A3B3F]">{t}</span>
              </div>
            ))}
          </div>
          <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className="mt-9 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#E62E6B] text-white font-medium hover:bg-[#c81f57] transition-colors">
            <Gift size={18} /> Join the Community
          </a>
        </div>
      </div>
    </section>
  );
};

export default Loyalty;
