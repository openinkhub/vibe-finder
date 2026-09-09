import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { navLeft, navRight } from "../mock/mock";

const MAROON = "#8A1E3F";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const LinkItem = ({ l }) => {
    if (l.dropdown) {
      return (
        <div className="relative" onMouseEnter={() => setSvcOpen(true)} onMouseLeave={() => setSvcOpen(false)}>
          <Link to={l.path} className="flex items-center gap-1 text-[13px] font-medium tracking-[0.12em] uppercase text-[#4a4a4a] hover:text-[#8A1E3F] transition-colors">
            {l.label} <ChevronDown size={14} />
          </Link>
          {svcOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-56">
              <div className="bg-white rounded-xl shadow-xl border border-[#F0E3E7] overflow-hidden py-2">
                {l.dropdown.map((d) => (
                  <Link key={d.label} to={d.path} className="block px-5 py-2.5 text-sm text-[#5a5a5a] hover:bg-[#FBEFF3] hover:text-[#8A1E3F] transition-colors">
                    {d.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <Link to={l.path} className="text-[13px] font-medium tracking-[0.12em] uppercase text-[#4a4a4a] hover:text-[#8A1E3F] transition-colors">
        {l.label}
      </Link>
    );
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 font-poppins transition-all duration-500 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm py-2" : "bg-transparent py-4"}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Left nav */}
        <nav className="hidden xl:flex items-center gap-8 flex-1">
          {navLeft.map((l) => <LinkItem key={l.label} l={l} />)}
        </nav>

        {/* Center logo */}
        <Link to="/" className="flex flex-col items-center leading-none shrink-0">
          <span className="font-script text-4xl md:text-5xl text-[#8A1E3F] -mb-1">Rekha</span>
          <span className="text-[10px] md:text-[11px] tracking-[0.3em] text-[#6a6a6a] font-medium">KRISHNAMURTHY</span>
          <span className="text-[8px] md:text-[9px] tracking-[0.32em] text-[#9a9a9a] mt-0.5">MAKEUP &amp; ACADEMY</span>
        </Link>

        {/* Right nav */}
        <nav className="hidden xl:flex items-center gap-8 flex-1 justify-end">
          {navRight.map((l) => <LinkItem key={l.label} l={l} />)}
          <Link to="/contact" className="px-7 py-3 rounded-full text-white text-[13px] font-semibold tracking-[0.12em] uppercase shadow-md hover:shadow-lg transition-all" style={{ backgroundColor: MAROON }}>
            Enquiry
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setOpen((v) => !v)} className="xl:hidden w-11 h-11 flex items-center justify-center rounded-full bg-white/70 shadow text-[#8A1E3F]" aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="xl:hidden mt-3 mx-4 rounded-2xl bg-white border border-[#F0E3E7] shadow-xl overflow-hidden">
          {[...navLeft, ...navRight].map((l) => (
            <Link key={l.label} to={l.path} className="block px-6 py-4 text-sm tracking-[0.1em] uppercase text-[#4a4a4a] border-b border-[#F5EEF0] last:border-0 hover:bg-[#FBEFF3] hover:text-[#8A1E3F] transition-colors">
              {l.label}
            </Link>
          ))}
          <Link to="/contact" className="block px-6 py-4 text-sm tracking-[0.1em] uppercase text-white font-semibold" style={{ backgroundColor: MAROON }}>
            Enquiry
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
