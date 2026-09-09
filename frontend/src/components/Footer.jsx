import React from "react";
import { Instagram, Phone, MapPin } from "lucide-react";
import { brand, navLinks } from "../mock/mock";
import { scrollToId } from "./Navbar";

const Footer = () => {
  return (
    <footer className="relative bg-[#211015] text-[#EDE3E6] overflow-hidden">
      <div className="absolute -top-32 -right-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/12 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-6 md:px-10 pt-20 pb-10">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-1">
              <span className="font-display text-3xl font-extrabold tracking-tight text-white">{brand.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E62E6B] mb-1" />
            </div>
            <span className="block font-mono text-[10px] tracking-[0.34em] text-[#B79AA2] mt-1.5">{brand.surname}</span>
            <p className="mt-6 text-[#C9B7BD] leading-relaxed max-w-sm">Bridal, party & editorial makeup that reads flawless on camera and feels effortless in person. Serving brides across Bangalore.</p>
          </div>
          <div className="md:col-span-3">
            <h4 className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#B79AA2] mb-5">Explore</h4>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.to}><button onClick={() => scrollToId(l.to)} className="text-[#DCCBD1] hover:text-[#E62E6B] transition-colors">{l.label}</button></li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <h4 className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#B79AA2] mb-5">Get in touch</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><Phone size={17} className="text-[#E62E6B]" /><a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="text-[#DCCBD1] hover:text-white transition-colors">{brand.phone}</a></li>
              <li className="flex items-center gap-3"><MapPin size={17} className="text-[#E62E6B]" /><span className="text-[#DCCBD1]">{brand.location}</span></li>
              <li className="flex items-center gap-3"><Instagram size={17} className="text-[#E62E6B]" /><a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="text-[#DCCBD1] hover:text-white transition-colors">{brand.instagram}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-[#9E858C]">© {new Date().getFullYear()} Rekha Krishnamurthy. All rights reserved.</p>
          <p className="font-mono text-xs text-[#9E858C]">Bridal · HD · Airbrush · Self-Grooming</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
