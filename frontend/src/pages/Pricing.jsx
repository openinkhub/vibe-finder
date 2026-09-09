import React from "react";
import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { pricingPlans, faqs } from "../mock/mock";

const Pricing = () => {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Simple, transparent"
        accent="packages"
        subtitle="No hidden charges, no visit fees within Bangalore. Every package is tailored during your free consultation."
      />

      <section className="bg-[#F4F1EA] pb-24">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {pricingPlans.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-[28px] p-8 md:p-10 border transition-all duration-300 flex flex-col ${
                  p.featured
                    ? "bg-[#2B1B20] border-[#2B1B20] text-white shadow-2xl md:-translate-y-4"
                    : "bg-white border-[#E4DBCB] text-[#2B1B20] hover:shadow-xl"
                }`}
              >
                {p.featured && (
                  <span className="absolute top-6 right-6 inline-flex items-center gap-1 bg-[#E62E6B] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    <Star size={12} className="fill-white" /> Most loved
                  </span>
                )}
                <h3 className={`font-display text-2xl font-bold ${p.featured ? "text-white" : "text-[#2B1B20]"}`}>{p.name}</h3>
                <div className="mt-5 flex items-end gap-2">
                  <span className={`font-display text-5xl font-bold ${p.featured ? "text-[#F4B7CE]" : "text-[#E62E6B]"}`}>{p.price}</span>
                  <span className={`mb-2 text-sm ${p.featured ? "text-[#B79AA2]" : "text-[#8B7F82]"}`}>/ {p.unit}</span>
                </div>
                <div className={`my-7 h-px ${p.featured ? "bg-white/15" : "bg-[#EAE2D5]"}`} />
                <ul className="space-y-3.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-center gap-3 text-sm ${p.featured ? "text-[#E6D5DA]" : "text-[#4A3B3F]"}`}>
                      <Check size={17} className={p.featured ? "text-[#F4B7CE]" : "text-[#E62E6B]"} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`mt-8 text-center px-7 py-4 rounded-full font-medium transition-colors ${
                    p.featured ? "bg-[#E62E6B] text-white hover:bg-[#c81f57]" : "bg-[#2B1B20] text-white hover:bg-[#4A2530]"
                  }`}
                >
                  Book this package
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-24 grid lg:grid-cols-3 gap-10">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#E62E6B]"><span className="w-6 h-px bg-[#E62E6B]" /> FAQ</span>
              <h2 className="font-display text-[#4A2530] text-4xl mt-5">Good to know</h2>
              <p className="mt-4 text-[#5C4E52]">Still have a question? Reach out on WhatsApp and Rekha will personally help.</p>
            </div>
            <div className="lg:col-span-2 divide-y divide-[#DDD4C6]">
              {faqs.map((f) => (
                <div key={f.q} className="py-6">
                  <h3 className="font-display text-lg font-semibold text-[#2B1B20]">{f.q}</h3>
                  <p className="mt-2 text-[#5C4E52] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
