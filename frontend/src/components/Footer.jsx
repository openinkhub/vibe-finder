import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { brand, navLinks } from "../mock/mock";

const Footer = () => {
  return (
    <footer className="relative bg-[#2B1B20] text-[#EDE3E6] overflow-hidden">
      <div className="absolute -top-32 -right-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 pt-20 pb-10">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Brand + CTA */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-1">
              <span className="font-display text-3xl font-extrabold tracking-tight text-white">{brand.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E62E6B] mb-1" />
            </div>
            <span className="block text-[11px] tracking-[0.42em] text-[#B79AA2] mt-1">{brand.surname}</span>
            <p className="mt-6 text-[#C9B7BD] leading-relaxed max-w-sm">
              Bridal, party & editorial makeup that reads flawless on camera and feels effortless in person. Serving brides across Bangalore.
            </p>
            <Link to="/contact" className="group inline-flex items-center gap-2 mt-8 px-7 py-3.5 rounded-full bg-[#E62E6B] text-white font-medium hover:bg-[#c81f57] transition-colors">
              Book a free consultation
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Nav */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] tracking-[0.28em] uppercase text-[#B79AA2] mb-5">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-[#DCCBD1] hover:text-[#E62E6B] transition-colors">Home</Link></li>
              {navLinks.map((l) => (
                <li key={l.path}><Link to={l.path} className="text-[#DCCBD1] hover:text-[#E62E6B] transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] tracking-[0.28em] uppercase text-[#B79AA2] mb-5">Get in touch</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><Phone size={17} className="text-[#E62E6B]" /><a href={`tel:${brand.phone.replace(/\s/g,"")}`} className="text-[#DCCBD1] hover:text-white transition-colors">{brand.phone}</a></li>
              <li className="flex items-center gap-3"><Mail size={17} className="text-[#E62E6B]" /><a href={`mailto:${brand.email}`} className="text-[#DCCBD1] hover:text-white transition-colors">{brand.email}</a></li>
              <li className="flex items-center gap-3"><MapPin size={17} className="text-[#E62E6B]" /><span className="text-[#DCCBD1]">{brand.location}</span></li>
              <li className="flex items-center gap-3"><Instagram size={17} className="text-[#E62E6B]" /><a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[#DCCBD1] hover:text-white transition-colors">{brand.instagram}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#9E858C]">&copy; {new Date().getFullYear()} Rekha Krishnamurthy Makeup Studio. All rights reserved.</p>
          <p className="text-sm text-[#9E858C]">Bridal &middot; HD &middot; Airbrush &middot; Self-Grooming</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
