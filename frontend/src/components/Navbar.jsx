import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { brand, navLinks } from "../mock/mock";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[#F4F1EA]/85 backdrop-blur-xl border-b border-[#E2DACB] py-3" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group leading-none">
          <div className="flex items-center gap-1">
            <span className="font-display text-2xl md:text-[28px] font-extrabold tracking-tight text-[#2B1B20]">
              {brand.name}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E62E6B] mb-1" />
          </div>
          <span className="block text-[10px] md:text-[11px] tracking-[0.42em] text-[#8B7F82] mt-0.5">
            {brand.surname}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map((l) => {
            const active = location.pathname === l.path;
            return (
              <Link
                key={l.path}
                to={l.path}
                className={`relative text-[15px] tracking-wide transition-colors duration-300 ${
                  active ? "text-[#E62E6B]" : "text-[#3A2A2E] hover:text-[#E62E6B]"
                }`}
              >
                {l.label}
                <span className={`absolute -bottom-1.5 left-0 h-px bg-[#E62E6B] transition-all duration-300 ${active ? "w-full" : "w-0"}`} />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="hidden md:flex items-center gap-2 pl-3 pr-2 py-2 rounded-full border border-[#DAD1C2] bg-white/60 text-[#8B7F82] hover:border-[#E62E6B] hover:text-[#3A2A2E] transition-all duration-300 w-[200px]">
            <Search size={16} />
            <span className="text-sm flex-1 text-left">Search services</span>
            <kbd className="text-[10px] border border-[#DAD1C2] rounded px-1.5 py-0.5">{"\u2318"}K</kbd>
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full border border-[#DAD1C2] bg-white/60 text-[#2B1B20]"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden mt-3 mx-4 rounded-2xl bg-white border border-[#E2DACB] shadow-xl overflow-hidden">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className="block px-6 py-4 text-[#3A2A2E] border-b border-[#EFEAE0] last:border-0 hover:bg-[#FBF3F6] hover:text-[#E62E6B] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
