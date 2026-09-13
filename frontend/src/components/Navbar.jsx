import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { brand } from "../mock/mock";
import { headerMenu, servicePages } from "../content/site";

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Navbar = ({ solid = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [svc, setSvc] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setOpen(false); setSvc(false); }, [pathname]);

  const goContact = () => { setOpen(false); if (pathname === "/") scrollToId("contact"); else { sessionStorage.setItem("rk_scroll_to", "contact"); navigate("/"); } };
  const linkCls = (to) => `relative text-[14px] tracking-wide transition-colors duration-300 group ${pathname === to ? "text-[#E62E6B]" : "text-[#4A2530] hover:text-[#E62E6B]"}`;
  const filled = solid || scrolled;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${filled ? "bg-[#F4F1EA]/92 backdrop-blur-xl border-b border-[#F1DCE3] py-2.5" : "bg-transparent py-4 sm:py-5"}`} data-testid="navbar">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center shrink-0" data-testid="header-logo-link" aria-label="Rekha Krishnamurthy Makeup & Academy">
          <motion.img src={brand.logo} alt="Rekha Krishnamurthy Makeup & Academy" className="h-9 sm:h-10 md:h-12 w-auto" whileHover={{ rotateY: 12, scale: 1.04 }} transition={{ type: "spring", stiffness: 240, damping: 18 }} style={{ transformPerspective: 600 }} />
        </Link>

        <nav className="hidden lg:flex items-center gap-7" data-testid="desktop-nav">
          {headerMenu.map((m) => m.children ? (
            <div key="services" className="relative" onMouseEnter={() => setSvc(true)} onMouseLeave={() => setSvc(false)}>
              <button className={`${linkCls("/services")} flex items-center gap-1`} onClick={() => setSvc((v) => !v)} data-testid="nav-services">Services <ChevronDown size={14} className={`transition-transform ${svc ? "rotate-180" : ""}`} /></button>
              <AnimatePresence>
                {svc && (
                  <motion.div initial={{ opacity: 0, y: 8, rotateX: -10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: 6 }} style={{ transformPerspective: 800, transformOrigin: "top" }} className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl bg-white border border-[#F1DCE3] shadow-xl overflow-hidden p-2" data-testid="services-dropdown">
                    {servicePages.map((s) => (
                      <Link key={s.slug} to={`/${s.slug}`} className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-[#4A2530] hover:bg-[#FBE9F0] hover:text-[#E62E6B] transition-colors" data-testid={`nav-service-${s.slug}`}>{s.menu} <ArrowUpRight size={13} className="opacity-50" /></Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link key={m.to} to={m.to} className={linkCls(m.to)} data-testid={`nav-${m.label.toLowerCase().replace(/\s+/g, "-")}`}>
              {m.label}
              <span className={`absolute -bottom-1.5 left-0 h-px bg-[#E62E6B] transition-all duration-300 ${pathname === m.to ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={goContact} className="hidden md:inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#E62E6B] text-white text-sm font-medium hover:bg-[#C81F57] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#E62E6B]/25" data-testid="nav-book-btn">Book now <ArrowUpRight size={15} /></button>
          <button onClick={() => setOpen((v) => !v)} className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full border border-[#F1DCE3] bg-white/70 text-[#E62E6B]" aria-label="Menu" data-testid="mobile-menu-btn">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -12, rotateX: -12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: -8 }} style={{ transformPerspective: 800, transformOrigin: "top" }} className="lg:hidden mt-3 mx-4 rounded-2xl bg-white border border-[#F1DCE3] shadow-xl overflow-hidden max-h-[75vh] overflow-y-auto" data-testid="mobile-menu">
            {headerMenu.map((m) => m.children ? (
              <div key="services" className="border-b border-[#FBE9F0]">
                <div className="px-6 pt-4 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#E62E6B]">Services</div>
                <div className="grid grid-cols-2 gap-1 px-4 pb-3">
                  {servicePages.map((s) => <Link key={s.slug} to={`/${s.slug}`} className="px-3 py-2 rounded-lg text-sm text-[#4A2530] hover:bg-[#FBE9F0]" data-testid={`mobile-nav-service-${s.slug}`}>{s.menu}</Link>)}
                </div>
              </div>
            ) : (
              <Link key={m.to} to={m.to} className="block w-full text-left px-6 py-4 text-[#4A2530] border-b border-[#FBE9F0] hover:bg-[#FBE9F0] hover:text-[#E62E6B] transition-colors" data-testid={`mobile-nav-${m.label.toLowerCase().replace(/\s+/g, "-")}`}>{m.label}</Link>
            ))}
            <button onClick={goContact} className="m-4 w-[calc(100%-2rem)] py-3.5 rounded-full bg-[#E62E6B] text-white font-medium" data-testid="mobile-book-btn">Book now</button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
