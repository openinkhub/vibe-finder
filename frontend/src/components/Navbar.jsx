import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => { setOpen(false); scrollToId(id); };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#F4F1EA]/92 backdrop-blur-xl border-b border-[#F1DCE3] py-2.5" : "bg-transparent py-4 sm:py-5"}`} data-testid="navbar">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 flex items-center justify-between gap-4">
        <a href={brand.siteUrl} className="group flex items-center shrink-0" data-testid="header-logo-link" aria-label="Rekha Krishnamurthy Makeup & Academy">
          <motion.img
            src={brand.logo}
            alt="Rekha Krishnamurthy Makeup & Academy"
            className="h-9 sm:h-10 md:h-12 w-auto"
            whileHover={{ rotateY: 12, scale: 1.04 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            style={{ transformPerspective: 600 }}
          />
        </a>

        <nav className="hidden lg:flex items-center gap-8" data-testid="desktop-nav">
          {navLinks.map((l) => (
            <button key={l.to} onClick={() => go(l.to)} className="relative text-[14px] tracking-wide text-[#4A2530] hover:text-[#E62E6B] transition-colors duration-300 group" data-testid={`nav-${l.to}`}>
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px bg-[#E62E6B] w-0 group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => go("contact")} className="hidden md:inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#E62E6B] text-white text-sm font-medium hover:bg-[#C81F57] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#E62E6B]/25" data-testid="nav-book-btn">
            Book now <ArrowUpRight size={15} />
          </button>
          <button onClick={() => setOpen((v) => !v)} className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full border border-[#F1DCE3] bg-white/70 text-[#E62E6B]" aria-label="Menu" data-testid="mobile-menu-btn">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, rotateX: -12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ transformPerspective: 800, transformOrigin: "top" }}
            className="lg:hidden mt-3 mx-4 rounded-2xl bg-white border border-[#F1DCE3] shadow-xl overflow-hidden"
            data-testid="mobile-menu"
          >
            {navLinks.map((l) => (
              <button key={l.to} onClick={() => go(l.to)} className="block w-full text-left px-6 py-4 text-[#4A2530] border-b border-[#FBE9F0] last:border-0 hover:bg-[#FBE9F0] hover:text-[#E62E6B] transition-colors" data-testid={`mobile-nav-${l.to}`}>
                {l.label}
              </button>
            ))}
            <button onClick={() => go("contact")} className="m-4 w-[calc(100%-2rem)] py-3.5 rounded-full bg-[#E62E6B] text-white font-medium" data-testid="mobile-book-btn">Book now</button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
