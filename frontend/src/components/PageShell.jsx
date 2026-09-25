import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Phone, Instagram } from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingButtons from "./FloatingButtons";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";
import { brand } from "../mock/mock";
import { authorBio } from "../content/site";
import { useSeo, useJsonLd } from "./Seo";
import { shortCta } from "../lib/ctaLabel";

export const PageShell = ({ children, title, page, faq }) => {
  useSeo(page);
  useJsonLd(page, faq);
  useEffect(() => { window.scrollTo(0, 0); if (title && !page) document.title = `${title} · Rekha Krishnamurthy`; }, [title, page]);
  return (
    <div className="bg-[#F4F1EA] min-h-screen">
      <Navbar solid />
      <main className="pt-24 sm:pt-28">{children}</main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export const PageHero = ({ eyebrow, title, subtitle, image, cta = "Book Your Free Consultation", ctaTo = "/contact", onCta }) => (
  <section className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-14 items-center pb-12 md:pb-20" data-testid="page-hero">
    <Reveal>
      {eyebrow && <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]" data-testid="page-eyebrow">{eyebrow}</span>}
      <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-4" data-testid="page-title">{title}</h2>
      {subtitle && <p className="mt-5 text-sm sm:text-base text-[#5C4E52] leading-relaxed max-w-xl" data-testid="page-subtitle">{subtitle}</p>}
      {onCta
        ? <button type="button" onClick={onCta} className="mt-8 inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#E62E6B] text-white text-sm sm:text-base font-medium hover:bg-[#C81F57] transition-colors shadow-lg shadow-[#E62E6B]/25" data-testid="page-cta"><span className="sm:hidden">{shortCta(cta)}</span><span className="hidden sm:inline">{cta}</span> <ArrowUpRight size={16} /></button>
        : <Link to={ctaTo} className="mt-8 inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#E62E6B] text-white text-sm sm:text-base font-medium hover:bg-[#C81F57] transition-colors shadow-lg shadow-[#E62E6B]/25" data-testid="page-cta"><span className="sm:hidden">{shortCta(cta)}</span><span className="hidden sm:inline">{cta}</span> <ArrowUpRight size={16} /></Link>}
    </Reveal>
    {image && (
      <Reveal delay={0.1}>
        <TiltCard max={6} className="rounded-[24px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(230,46,107,0.45)]">
          <img src={image} alt={title} className="w-full h-[300px] sm:h-[380px] md:h-[460px] object-cover" />
        </TiltCard>
      </Reveal>
    )}
  </section>
);

export const AuthorBio = () => (
  <Reveal>
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F1DCE3] flex flex-col sm:flex-row gap-5 sm:gap-7 items-start" data-testid="author-bio">
      <img src={brand.logo} alt="Rekha Krishnamurthy" className="h-12 w-auto shrink-0" />
      <div>
        <div className="font-display text-xl text-[#4A2530]">{authorBio.title}</div>
        <p className="mt-2 text-sm text-[#5C4E52] leading-relaxed">{authorBio.text}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <span className="text-[#5C4E52]">📍 Based in Bangalore</span>
          <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-[#E62E6B]"><Phone size={14} /> {brand.phone}</a>
          <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#E62E6B]"><Instagram size={14} /> Instagram</a>
          <a href={brand.facebookUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#E62E6B]"><FaFacebookF size={13} /> Facebook</a>
          <a href={brand.twitterUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#E62E6B]"><FaXTwitter size={13} /> X</a>
          <a href={brand.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#E62E6B]"><FaLinkedinIn size={13} /> LinkedIn</a>
          <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#25D366]"><FaWhatsapp size={14} /> WhatsApp</a>
        </div>
      </div>
    </div>
  </Reveal>
);

export default PageShell;
