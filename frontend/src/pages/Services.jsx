import React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowUpRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { services } from "../mock/mock";

const Services = () => {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Makeup for every"
        accent="moment"
        subtitle="Bridal, party, editorial and everyday looks — each crafted with premium, long-wear products and a skin-first finish."
      />

      <section className="bg-[#F4F1EA] pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 space-y-8">
          {services.map((s, i) => (
            <div
              key={s.id}
              className={`grid md:grid-cols-2 gap-8 lg:gap-14 items-center bg-white rounded-[28px] overflow-hidden border border-[#E4DBCB] ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="relative h-64 md:h-[380px]">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                <span className="absolute top-5 left-5 bg-white/95 text-[#2B1B20] text-sm font-medium px-4 py-2 rounded-full">{s.price}</span>
              </div>
              <div className="p-8 md:p-12">
                <span className="text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">0{i + 1}</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-[#2B1B20] mt-3">{s.title}</h2>
                <p className="mt-4 text-[#5C4E52] leading-relaxed">{s.desc}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {s.points.map((p) => (
                    <div key={p} className="flex items-center gap-2 text-sm text-[#4A3B3F]"><Check size={16} className="text-[#E62E6B]" /> {p}</div>
                  ))}
                </div>
                <Link to="/contact" className="group inline-flex items-center gap-2 mt-8 px-7 py-3.5 rounded-full bg-[#2B1B20] text-white font-medium hover:bg-[#4A2530] transition-colors">
                  Enquire &amp; book
                  <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Services;
