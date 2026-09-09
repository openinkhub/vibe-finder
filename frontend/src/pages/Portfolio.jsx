import React, { useState } from "react";
import { X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { portfolio } from "../mock/mock";

const categories = ["All", "Bridal", "Glam", "Party", "Editorial", "Minimal"];

const Portfolio = () => {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const items = filter === "All" ? portfolio : portfolio.filter((p) => p.category === filter);

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="A gallery of real"
        accent="transformations"
        subtitle="Bridal, glam and editorial looks created for brides and clients across Bangalore."
      />

      <section className="bg-[#F4F1EA] pb-28">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  filter === c ? "bg-[#2B1B20] text-white" : "bg-white text-[#5C4E52] border border-[#E4DBCB] hover:border-[#E62E6B] hover:text-[#E62E6B]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="columns-2 md:columns-3 gap-4 md:gap-5 [column-fill:_balance]">
            {items.map((p) => (
              <div
                key={p.id}
                onClick={() => setLightbox(p)}
                className="group relative mb-4 md:mb-5 break-inside-avoid overflow-hidden rounded-2xl cursor-pointer"
              >
                <img src={p.image} alt={p.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B20]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#F4B7CE]">{p.category}</span>
                  <div className="font-display text-lg font-semibold text-white">{p.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-[#2B1B20]/90 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-[#E62E6B] transition-colors" aria-label="Close">
            <X size={22} />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image} alt={lightbox.title} className="w-full max-h-[78vh] object-contain rounded-2xl" />
            <div className="text-center mt-5">
              <span className="text-[11px] tracking-[0.25em] uppercase text-[#F4B7CE]">{lightbox.category}</span>
              <div className="font-display text-2xl font-semibold text-white mt-1">{lightbox.title}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Portfolio;
