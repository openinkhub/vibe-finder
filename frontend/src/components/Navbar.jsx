import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { brand } from "../mock/mock";
import { headerMenu } from "../lib/pages";

// Home sections below the first screen are added shortly after load, so wait briefly for them.
export const scrollToId = (id, tries = 25) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  else if (tries > 0) setTimeout(() => scrollToId(id, tries - 1), 120);
};

const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");

const Dropdown = ({ m, pathname, linkCls }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  const active = pathname === m.to || m.children.some((c) => c.path === pathname);
  const key = slug(m.label);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {m.to
        ? <Link to={m.to} className={`${linkCls(m.to, active)} flex items-center gap-1`} data-testid={`nav-${key}`}>{m.label} <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} /></Link>
        : <button className={`${linkCls("", active)} flex items-center gap-1`} onClick={() => setOpen((v) => !v)} data-testid={`nav-${key}`}>{m.label} <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} /></button>}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, rotateX: -10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: 6 }} style={{ transformPerspective: 800, transformOrigin: "top" }} className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl bg-white border border-[#F1DCE3] shadow-xl overflow-hidden p-2" data-testid={`${key}-dropdown`}>
            {m.children.map((c) => (
              <Link key={c.path} to={c.path} className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-[#4A2530] hover:bg-[#FBE9F0] hover:text-[#E62E6B] transition-colors" data-testid={`nav-${key}-${c.path.slice(1)}`}>{c.name} <ArrowUpRight size={13} className="opacity-50" /></Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = ({ solid = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  const goContact = () => { setOpen(false); if (pathname === "/") scrollToId("contact"); else navigate("/contact"); };
  const linkCls = (to, active = pathname === to) => `relative text-[14px] tracking-wide transition-colors duration-300 group ${active ? "text-[#E62E6B]" : "text-[#4A2530] hover:text-[#E62E6B]"}`;
  const filled = solid || scrolled;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${filled ? "bg-[#F4F1EA]/92 backdrop-blur-xl border-b border-[#F1DCE3] py-2.5" : "bg-transparent py-4 sm:py-5"}`} data-testid="navbar">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center shrink-0" data-testid="header-logo-link" aria-label="Rekha Krishnamurthy Makeup & Academy">
          <motion.img width="311" height="133" src={brand.logo} alt="Rekha Krishnamurthy Makeup & Academy" className="h-9 sm:h-10 md:h-12 w-auto" whileHover={{ rotateY: 12, scale: 1.04 }} transition={{ type: "spring", stiffness: 240, damping: 18 }} style={{ transformPerspective: 600 }} />
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7" data-testid="desktop-nav">
          {headerMenu.map((m) => m.children ? <Dropdown key={m.label} m={m} pathname={pathname} linkCls={linkCls} /> : (
            <Link key={m.to} to={m.to} className={linkCls(m.to)} data-testid={`nav-${slug(m.label)}`}>
              {m.label}
              <span className={`absolute -bottom-1.5 left-0 h-px bg-[#E62E6B] transition-all duration-300 ${pathname === m.to ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={goContact} className="hidden md:inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#D6245F] text-white text-sm font-medium hover:bg-[#C81F57] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#E62E6B]/25" data-testid="nav-book-btn">Book now <ArrowUpRight size={15} /></button>
          <button onClick={() => setOpen((v) => !v)} className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full border border-[#F1DCE3] bg-white/70 text-[#E62E6B]" aria-label="Menu" data-testid="mobile-menu-btn">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -12, rotateX: -12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: -8 }} style={{ transformPerspective: 800, transformOrigin: "top" }} className="lg:hidden mt-3 mx-4 rounded-2xl bg-white border border-[#F1DCE3] shadow-xl overflow-hidden max-h-[75vh] overflow-y-auto" data-testid="mobile-menu">
            {headerMenu.map((m) => m.children ? (
              <div key={m.label} className="border-b border-[#FBE9F0]">
                {m.to
                  ? <Link to={m.to} className="block px-6 pt-4 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#E62E6B]" data-testid={`mobile-nav-${slug(m.label)}`}>{m.label}</Link>
                  : <div className="px-6 pt-4 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#E62E6B]" data-testid={`mobile-nav-${slug(m.label)}`}>{m.label}</div>}
                <div className="grid grid-cols-2 gap-1 px-4 pb-3">
                  {m.children.map((c) => <Link key={c.path} to={c.path} className="px-3 py-2 rounded-lg text-sm text-[#4A2530] hover:bg-[#FBE9F0]" data-testid={`mobile-nav-${slug(m.label)}-${c.path.slice(1)}`}>{c.name}</Link>)}
                </div>
              </div>
            ) : (
              <Link key={m.to} to={m.to} className="block w-full text-left px-6 py-4 text-[#4A2530] border-b border-[#FBE9F0] hover:bg-[#FBE9F0] hover:text-[#E62E6B] transition-colors" data-testid={`mobile-nav-${slug(m.label)}`}>{m.label}</Link>
            ))}
            <button onClick={goContact} className="m-4 w-[calc(100%-2rem)] py-3.5 rounded-full bg-[#D6245F] text-white font-medium" data-testid="mobile-book-btn">Book now</button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
