import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { faqs } from "../mock/mock";
import { Reveal } from "./fx/Reveal";

const FAQ = () => {
  const [open, setOpen] = useState(0);
  return (
    <section className="relative bg-[#EBE6DB] py-20 md:py-32" data-testid="faq-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 grid lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12">
        <Reveal>
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Good to know</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Frequently asked questions</h2>
        </Reveal>
        <div style={{ perspective: 1000 }}>
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05} rotate={-10}>
              <motion.div
                animate={{ backgroundColor: open === i ? "#FFFFFF" : "rgba(255,255,255,0)", borderColor: open === i ? "#F1DCE3" : "rgba(241,220,227,0)" }}
                className="rounded-2xl border px-4 sm:px-6 mb-2"
                data-testid={`faq-item-${i}`}
              >
                <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 py-5 sm:py-6 text-left" data-testid={`faq-toggle-${i}`}>
                  <span className="font-display text-base sm:text-lg md:text-xl font-semibold text-[#4A2530]">{f.q}</span>
                  <motion.span animate={{ rotate: open === i ? 180 : 0 }} className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${open === i ? "bg-[#E62E6B] text-white" : "bg-white text-[#E62E6B]"}`}>
                    {open === i ? <Minus size={18} /> : <Plus size={18} />}
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <p className="text-sm sm:text-base text-[#5C4E52] leading-relaxed pb-6 pr-4 sm:pr-12" data-testid={`faq-answer-${i}`}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
