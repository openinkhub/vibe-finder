import React from "react";
import { Instagram as IgIcon, Heart, MessageCircle } from "lucide-react";
import { instagramFeed, brand } from "../mock/mock";

const Instagram = () => {
  return (
    <section className="relative bg-[#F4F1EA] py-24 md:py-28">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Follow along</span>
            <h2 className="font-display text-[#4A2530] text-3xl md:text-4xl leading-tight mt-5">{brand.instagram}</h2>
          </div>
          <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2B1B20] text-white font-medium hover:bg-[#4A2530] transition-colors w-fit">
            <IgIcon size={18} /> Follow on Instagram
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {instagramFeed.map((p) => (
            <a key={p.caption} href={brand.instagramUrl} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-2xl">
              <img src={p.image} alt={p.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[#2B1B20]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <p className="text-white text-xs leading-snug">{p.caption}</p>
                <div className="flex items-center gap-4 text-white text-sm">
                  <span className="flex items-center gap-1"><Heart size={14} className="fill-white" /> {p.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} /> {p.comments}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instagram;
