import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqs } from "../mock/mock";

const FAQ = () => {
  const [open, setOpen] = useState(0);
  return (
    <section className="relative bg-[#EBE6DB] py-24 md:py-32">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1fr_1.5fr] gap-12">
        <div>
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Good to know</span>
          <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">Frequently asked questions</h2>
        </div>
        <div>
          {faqs.map((f, i) => (
            <div key={f.q} className="border-b border-[#D3C7BA]">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 py-6 text-left">
                <span className="font-display text-lg md:text-xl font-semibold text-[#2B1B20]">{f.q}</span>
                <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${open === i ? "bg-[#E62E6B] text-white" : "bg-white text-[#2B1B20]"}`}>
                  {open === i ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-60 pb-6" : "max-h-0"}`}>
                <p className="text-[#5C4E52] leading-relaxed pr-12">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
