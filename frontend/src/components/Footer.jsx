import React from "react";
import { Instagram, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { brand } from "../mock/mock";
import { scrollToId } from "./Navbar";
import { Reveal } from "./fx/Reveal";
import { footerExplore, servicePages, locationPages, legalLinks } from "../content/site";

const Col = ({ title, children, delay = 0, className = "" }) => (
  <Reveal delay={delay} className={className}>
    <h4 className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#8B7F82] mb-5">{title}</h4>
    <ul className="space-y-3">{children}</ul>
  </Reveal>
);

const Footer = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const goHash = (e, to) => {
    if (!to.startsWith("/#")) return;
    e.preventDefault();
    const id = to.slice(2);
    if (pathname === "/") scrollToId(id); else { sessionStorage.setItem("rk_scroll_to", id); navigate("/"); }
  };
  const li = "text-[#4A2530] hover:text-[#E62E6B] hover:translate-x-1 inline-block transition-all text-sm";

  return (
    <footer className="relative bg-[#FBE9F0] text-[#4A2530] overflow-hidden" data-testid="footer">
      <div className="h-1.5 bg-[#E62E6B]" />
      <div className="absolute -top-32 -right-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pt-14 sm:pt-20 pb-8 sm:pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <Reveal className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="inline-block" data-testid="footer-logo-link" aria-label="Rekha Krishnamurthy Makeup & Academy">
              <motion.img src={brand.logo} alt="Rekha Krishnamurthy Makeup & Academy" className="h-12 sm:h-14 w-auto" whileHover={{ rotateY: 12, scale: 1.04 }} transition={{ type: "spring", stiffness: 240, damping: 18 }} style={{ transformPerspective: 600 }} />
            </Link>
            <p className="mt-6 text-sm sm:text-base text-[#5C4E52] leading-relaxed max-w-sm">Bridal, party & editorial makeup that reads flawless on camera and feels effortless in person. Serving brides across Bangalore.</p>
            <a href={brand.siteUrl} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#E62E6B] hover:gap-2.5 transition-all" data-testid="footer-site-link">rekhakrishnamurthy.com <ArrowUpRight size={15} /></a>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-3 text-sm"><Phone size={16} className="text-[#E62E6B]" /><a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="hover:text-[#E62E6B]">{brand.phone}</a></li>
              <li className="flex items-center gap-3 text-sm"><MapPin size={16} className="text-[#E62E6B]" /><span>{brand.location}</span></li>
              <li className="flex items-center gap-3 text-sm"><Instagram size={16} className="text-[#E62E6B] shrink-0" /><a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-[#E62E6B] break-all">{brand.instagram}</a></li>
            </ul>
          </Reveal>
          <Col title="Explore" delay={0.05} className="lg:col-span-2">
            {footerExplore.map((l) => <li key={l.to}><Link to={l.to} onClick={(e) => goHash(e, l.to)} className={li} data-testid={`footer-explore-${l.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{l.label}</Link></li>)}
          </Col>
          <Col title="Services" delay={0.1} className="lg:col-span-2">
            {servicePages.map((s) => <li key={s.slug}><Link to={`/${s.slug}`} className={li} data-testid={`footer-service-${s.slug}`}>{s.menu}</Link></li>)}
          </Col>
          <Col title="Legal" delay={0.15} className="lg:col-span-2">
            {legalLinks.map((l) => <li key={l.to}><Link to={l.to} className={li} data-testid={`footer-legal-${l.to.split("#")[1]}`}>{l.label}</Link></li>)}
            <li><Link to="/blog" className={li} data-testid="footer-blog">Blog</Link></li>
            <li><Link to="/about-us" className={li} data-testid="footer-about">About Us</Link></li>
          </Col>
          <Col title="Contact" delay={0.2} className="lg:col-span-2">
            <li><Link to="/personal-shopping" className={li} data-testid="footer-contact-page">Contact us</Link></li>
            <li><a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className={li}>WhatsApp</a></li>
            <li><Link to="/#contact" onClick={(e) => goHash(e, "/#contact")} className={li} data-testid="footer-enquiry">Free consultation</Link></li>
            <li><Link to="/admin" className="text-xs text-[#8B7F82] hover:text-[#E62E6B]" data-testid="footer-admin">Studio admin</Link></li>
          </Col>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E62E6B]/20" data-testid="footer-locations">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#8B7F82] mr-2 flex items-center gap-1.5"><MapPin size={12} className="text-[#E62E6B]" /> We serve</span>
            {locationPages.map((l) => <Link key={l.slug} to={`/${l.slug}`} className="px-4 py-2 rounded-full bg-white border border-[#F1DCE3] text-sm text-[#4A2530] hover:border-[#E62E6B] hover:text-[#E62E6B] transition-colors" data-testid={`footer-location-${l.slug}`}>{l.area}</Link>)}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E62E6B]/20 flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <p className="font-mono text-xs text-[#8B7F82]">© {new Date().getFullYear()} Rekha Krishnamurthy. All rights reserved.</p>
          <p className="font-mono text-xs text-[#8B7F82]">Bridal · HD · Airbrush · Self-Grooming</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
