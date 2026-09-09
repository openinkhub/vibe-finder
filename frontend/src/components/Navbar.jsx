import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { brand, navLinks } from "../mock/mock";

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => { setOpen(false); scrollToId(id); };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#F4F1EA]/90 backdrop-blur-xl border-b border-[#E2DACB] py-3" : "bg-transparent py-5"}`}>
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 flex items-center justify-between">
        <button onClick={() => go("top")} className="group text-left leading-none">
          <div className="flex items-center gap-1">
            <span className="font-display text-2xl md:text-[26px] font-extrabold tracking-tight text-[#2B1B20]">{brand.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E62E6B] mb-1" />
          </div>
          <span className="block font-mono text-[10px] tracking-[0.34em] text-[#8B7F82] mt-1">{brand.surname}</span>
        </button>

        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map((l) => (
            <button key={l.to} onClick={() => go(l.to)} className="relative text-[14px] tracking-wide text-[#3A2A2E] hover:text-[#E62E6B] transition-colors duration-300 group">
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px bg-[#E62E6B] w-0 group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => go("contact")} className="hidden md:inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#2B1B20] text-white text-sm font-medium hover:bg-[#4A2530] transition-colors">
            Book now <ArrowUpRight size={15} />
          </button>
          <button onClick={() => setOpen((v) => !v)} className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full border border-[#DAD1C2] bg-white/60 text-[#2B1B20]" aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden mt-3 mx-4 rounded-2xl bg-white border border-[#E2DACB] shadow-xl overflow-hidden">
          {navLinks.map((l) => (
            <button key={l.to} onClick={() => go(l.to)} className="block w-full text-left px-6 py-4 text-[#3A2A2E] border-b border-[#EFEAE0] last:border-0 hover:bg-[#FBF3F6] hover:text-[#E62E6B] transition-colors">
              {l.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
