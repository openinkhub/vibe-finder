import React from "react";
import { Instagram, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { brand, navLinks } from "../mock/mock";
import { scrollToId } from "./Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import { Reveal } from "./fx/Reveal";

const Footer = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const go = (id) => { if (pathname !== "/") { sessionStorage.setItem("rk_scroll_to", id); navigate("/"); } else scrollToId(id); };
  return (
    <footer className="relative bg-[#FBE9F0] text-[#4A2530] overflow-hidden" data-testid="footer">
      <div className="h-1.5 bg-[#E62E6B]" />
      <div className="absolute -top-32 -right-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pt-14 sm:pt-20 pb-8 sm:pb-10">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12">
          <Reveal className="md:col-span-5">
            <a href={brand.siteUrl} className="inline-block" data-testid="footer-logo-link" aria-label="Rekha Krishnamurthy Makeup & Academy">
              <motion.img src={brand.logo} alt="Rekha Krishnamurthy Makeup & Academy" className="h-12 sm:h-14 w-auto" whileHover={{ rotateY: 12, scale: 1.04 }} transition={{ type: "spring", stiffness: 240, damping: 18 }} style={{ transformPerspective: 600 }} />
            </a>
            <p className="mt-6 text-sm sm:text-base text-[#5C4E52] leading-relaxed max-w-sm">Bridal, party & editorial makeup that reads flawless on camera and feels effortless in person. Serving brides across Bangalore.</p>
            <a href={brand.siteUrl} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#E62E6B] hover:gap-2.5 transition-all" data-testid="footer-site-link">rekhakrishnamurthy.com <ArrowUpRight size={15} /></a>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-3">
            <h4 className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#8B7F82] mb-5">Explore</h4>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.to}><button onClick={() => go(l.to)} className="text-[#4A2530] hover:text-[#E62E6B] hover:translate-x-1 inline-block transition-all" data-testid={`footer-nav-${l.to}`}>{l.label}</button></li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-4">
            <h4 className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#8B7F82] mb-5">Get in touch</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><Phone size={17} className="text-[#E62E6B]" /><a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="text-[#4A2530] hover:text-[#E62E6B] transition-colors">{brand.phone}</a></li>
              <li className="flex items-center gap-3"><MapPin size={17} className="text-[#E62E6B]" /><span className="text-[#4A2530]">{brand.location}</span></li>
              <li className="flex items-center gap-3"><Instagram size={17} className="text-[#E62E6B] shrink-0" /><a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="text-[#4A2530] hover:text-[#E62E6B] transition-colors break-all">{brand.instagram}</a></li>
            </ul>
          </Reveal>
        </div>
        <div className="mt-12 sm:mt-14 pt-6 border-t border-[#E62E6B]/20 flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <p className="font-mono text-xs text-[#8B7F82]">© {new Date().getFullYear()} Rekha Krishnamurthy. All rights reserved.</p>
          <p className="font-mono text-xs text-[#8B7F82]">Bridal · HD · Airbrush · Self-Grooming</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
