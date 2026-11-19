import React, { useEffect, useState } from "react";
import { Instagram as IgIcon, Heart, MessageCircle } from "lucide-react";
import { instagramFeed as mockFeed, brand } from "../mock/mock";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";
import { api, imgUrl } from "../lib/api";

const Instagram = () => {
  const [items, setItems] = useState(mockFeed);

  useEffect(() => {
    api.get("/content/feed").then((r) => { if (r.data?.length) setItems(r.data); }).catch(() => {});
  }, []);

  return (
    <section className="relative bg-[#F4F1EA] py-20 md:py-28" data-testid="instagram-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-6 mb-8 md:mb-12">
          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Follow along</span>
            <h2 className="font-display text-[#4A2530] text-2xl sm:text-3xl md:text-4xl leading-tight mt-4 sm:mt-5 break-all sm:break-normal">{brand.instagram}</h2>
          </div>
          <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#D6245F] text-white font-medium hover:bg-[#C81F57] hover:-translate-y-0.5 transition-all w-fit shadow-lg shadow-[#E62E6B]/25" data-testid="instagram-follow-btn">
            <IgIcon size={18} /> Follow on Instagram
          </a>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4" style={{ perspective: 1200 }}>
          {items.map((p, i) => (
            <Reveal key={p.id || p.caption} delay={i * 0.06} rotate={16}>
              <TiltCard as="a" max={12} href={p.url || brand.instagramUrl} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded-2xl shadow-[0_20px_50px_-30px_rgba(230,46,107,0.5)]" data-testid={`instagram-item-${i}`}>
                <img width="400" height="400" loading="lazy" decoding="async" src={imgUrl(p.image)} alt={p.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#E62E6B]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4 text-center">
                  <p className="text-white text-xs leading-snug">{p.caption}</p>
                  <div className="flex items-center gap-4 text-white text-sm">
                    <span className="flex items-center gap-1"><Heart size={14} className="fill-white" /> {p.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={14} /> {p.comments}</span>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instagram;
