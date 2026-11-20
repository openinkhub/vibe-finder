import React, { useState } from "react";
import { srcSetFor } from "../lib/img";
import { Link } from "react-router-dom";
import { Check, ChevronDown, CalendarCheck, ArrowUpRight, Sparkles, Clock, MapPin, Star } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";
import { brand } from "../mock/mock";

const PACKAGES = [
  {
    tier: "Bridal Essentials",
    tag: "Intimate ceremonies",
    price: "Starting ₹8,000",
    color: "#F4F1EA",
    border: "#E8D9DF",
    items: [
      "Pre-event makeup consultation",
      "Bridal trial (1 session)",
      "Wedding day bridal makeup",
      "HD & long-wear formulas",
      "On-location, Bangalore",
    ],
    best: false,
  },
  {
    tier: "Full Bridal",
    tag: "Most chosen",
    price: "Starting ₹14,000",
    color: "#4A2530",
    border: "#4A2530",
    items: [
      "Consultation + skin assessment",
      "Pre-bridal skin prep session",
      "Bridal trial (1 session)",
      "Wedding day bridal makeup",
      "1 additional event (Mehendi / Sangeet)",
      "On-location service",
    ],
    best: true,
  },
  {
    tier: "Premium & Destination",
    tag: "Multi-event weddings",
    price: "Custom quote",
    color: "#F4F1EA",
    border: "#E8D9DF",
    items: [
      "All Full Bridal inclusions",
      "Full event-week coverage",
      "Hair styling included",
      "Bridal party makeup (up to 4)",
      "Travel to destination locations",
      "Dedicated WhatsApp coordination",
    ],
    best: false,
  },
];

const CHECKLIST = [
  { q: "Event dates & times", hint: "List all ceremonies with start times so we can plan the makeup timeline." },
  { q: "Number of people needing makeup", hint: "Bridal party, mother of the bride, sisters — give us a rough count early." },
  { q: "Theme, palette & outfit colours", hint: "Share references for each outfit. Makeup should complement, not clash." },
  { q: "Venue type & lighting", hint: "Outdoor natural light vs banquet hall vs flash photography — it changes everything." },
  { q: "Skin type & concerns", hint: "Oily skin, sensitivity, allergies, previous reactions — your artist needs to know." },
  { q: "Trial date preference", hint: "Minimum 4–6 weeks before the wedding, ideally during your pre-wedding shoot." },
];

const FAQS = [
  { q: "How far in advance should I book?", a: "For weddings in peak season (Oct–Feb) in Bangalore, booking 3–6 months in advance is recommended. Off-season and weekday bookings often have more flexibility." },
  { q: "Is a makeup trial mandatory?", a: "A trial is strongly recommended for brides. It is the only way to test how a look photographs on your skin, in your lighting, with your outfits — before the actual day." },
  { q: "Does the price include hair styling?", a: "Hair styling is a separate service. Mention it during your consultation and it can be included in a combined package where availability allows." },
  { q: "Do you travel outside Bangalore?", a: "Yes. Rekha is available for destination weddings across Karnataka and beyond. Travel and accommodation are factored into destination packages." },
  { q: "What products do you use?", a: "Only professional-grade, skin-safe products from trusted international and Indian brands. Ingredient preferences, allergies and sensitivities are noted at consultation." },
];

const BRIDAL_IMG = "https://images.unsplash.com/photo-1582576192532-06353147fcbf?crop=entropy&cs=srgb&fm=jpg&q=85&w=900";

const Faq = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#F1DCE3] last:border-0">
      <button className="w-full flex items-center justify-between gap-4 py-5 text-left" onClick={() => setOpen(!open)} data-testid={`faq-${q.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}>
        <span className="font-medium text-sm sm:text-base text-[#4A2530]">{q}</span>
        <ChevronDown size={18} className={`text-[#E62E6B] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-5 text-sm text-[#5C4E52] leading-relaxed">{a}</p>}
    </div>
  );
};

const BridalPackages = () => (
  <>
    {/* Stats strip */}
    <section className="bg-[#4A2530] py-8 md:py-10" data-testid="bridal-pkg-stats">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          {[
            { v: "500+", l: "Weddings & shoots" },
            { v: "14+ yrs", l: "Professional experience" },
            { v: "On-Location", l: "Across Karnataka" },
            { v: "Trial included", l: "In all bridal packages" },
          ].map(({ v, l }) => (
            <div key={l} className="pt-6 sm:pt-0 sm:px-8 first:pt-0 first:sm:pl-0">
              <div className="font-display text-2xl sm:text-3xl font-bold text-white">{v}</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-widest text-white/50">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Package overview + image */}
    <section className="bg-[#F4F1EA] py-20 md:py-28" data-testid="bridal-pkg-overview">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Bridal packages</span>
            <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mt-3">
              Every look is planned, not <span className="italic text-[#E62E6B]">pieced together</span>
            </h2>
            <p className="mt-5 text-sm sm:text-base text-[#5C4E52] leading-relaxed">
              A bridal package isn't just a list of services — it's a plan that considers your events, timing, outfits, skin, and the way you want to look in photographs that will last a lifetime.
            </p>
            <p className="mt-4 text-sm sm:text-base text-[#5C4E52] leading-relaxed">
              So Rekha works with you from consultation through trial to the final event, and confirms every detail in advance.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#D6245F] text-white font-medium hover:bg-[#C81F57] transition-colors shadow-lg shadow-[#E62E6B]/25 w-full sm:w-auto" data-testid="bridal-pkg-book-btn">
                <CalendarCheck size={17} /> Book Free Consultation
              </Link>
              <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[#E62E6B] text-[#E62E6B] font-medium hover:bg-[#FBE9F0] transition-colors w-full sm:w-auto" data-testid="bridal-pkg-whatsapp-btn">
                <FaWhatsapp size={17} /> WhatsApp Rekha
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative rounded-[32px] overflow-hidden aspect-[4/5]">
              <img width="800" height="1000" decoding="async" src={BRIDAL_IMG} srcSet={srcSetFor(BRIDAL_IMG)} sizes="(min-width: 768px) 45vw, 100vw" alt="Bridal makeup artist Bangalore" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
                <Star size={18} className="text-[#E62E6B] shrink-0" fill="#E62E6B" />
                <div>
                  <div className="font-display text-sm font-bold text-[#4A2530]">Trusted by 500+ brides</div>
                  <div className="text-xs text-[#5C4E52]">Across Karnataka since 2010</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    {/* Package tiers */}
    <section className="bg-white py-20 md:py-28" data-testid="bridal-pkg-tiers">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="text-center max-w-xl mx-auto">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Package options</span>
          <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl leading-[1.1] mt-3">Choose the coverage that <span className="italic text-[#E62E6B]">fits your wedding</span></h2>
          <p className="mt-4 text-sm text-[#5C4E52]">All packages are discussed in detail during your free consultation. Prices vary based on travel, number of events and additional services.</p>
        </Reveal>
        <div className="mt-10 md:mt-14 grid sm:grid-cols-3 gap-5 md:gap-6">
          {PACKAGES.map((pkg, i) => (
            <Reveal key={pkg.tier} delay={i * 0.08}>
              <TiltCard className={`h-full rounded-3xl p-7 border flex flex-col ${pkg.best ? "bg-[#4A2530] border-[#4A2530] shadow-2xl shadow-[#4A2530]/30" : "bg-white border-[#F1DCE3]"}`} max={5}>
                {pkg.best && (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D6245F] text-white text-xs font-mono uppercase tracking-wider w-fit">
                    <Sparkles size={11} /> Most chosen
                  </div>
                )}
                <div className={`font-mono text-[10px] tracking-[0.2em] uppercase ${pkg.best ? "text-[#F4B7CE]" : "text-[#E62E6B]"}`}>{pkg.tag}</div>
                <h3 className={`font-display text-xl font-bold mt-2 ${pkg.best ? "text-white" : "text-[#4A2530]"}`}>{pkg.tier}</h3>
                <div className={`mt-1 text-sm font-medium ${pkg.best ? "text-[#F4B7CE]" : "text-[#E62E6B]"}`}>{pkg.price}</div>
                <ul className="mt-6 space-y-3 flex-1">
                  {pkg.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <Check size={14} className={`mt-0.5 shrink-0 ${pkg.best ? "text-[#F4B7CE]" : "text-[#E62E6B]"}`} />
                      <span className={pkg.best ? "text-white/90" : "text-[#5C4E52]"}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className={`mt-7 w-full py-3 rounded-full text-sm font-medium text-center block transition-colors ${pkg.best ? "bg-[#D6245F] text-white hover:bg-[#C81F57]" : "border border-[#E62E6B] text-[#E62E6B] hover:bg-[#FBE9F0]"}`} data-testid={`bridal-pkg-${pkg.tier.toLowerCase().replace(/\s+/g, "-")}-btn`}>
                  Discuss this package
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Planning checklist */}
    <section className="bg-[#FBE9F0] py-20 md:py-28" data-testid="bridal-pkg-checklist">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Planning guide</span>
            <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl leading-[1.1] mt-3">
              What to have ready before your <span className="italic text-[#E62E6B]">consultation</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#5C4E52] leading-relaxed">
              A well-prepared consultation means less back-and-forth and a clearer picture of your day — which lets us focus on the creative part.
            </p>
            <ul className="mt-7 space-y-4">
              {CHECKLIST.map((c) => (
                <li key={c.q} className="bg-white rounded-2xl p-5 border border-[#F1DCE3]">
                  <div className="flex items-start gap-3">
                    <Check size={15} className="text-[#E62E6B] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-sm text-[#4A2530]">{c.q}</div>
                      <div className="mt-1 text-xs text-[#5C4E52] leading-relaxed">{c.hint}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
          <div>
            <Reveal delay={0.1}>
              <div className="bg-[#4A2530] rounded-3xl p-7 sm:p-8 text-white mb-5">
                <Clock size={22} className="text-[#F4B7CE]" />
                <h3 className="font-display text-xl font-bold mt-4">Bridal makeup timeline</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">Start your makeup 2–3 hours before the ceremony — longer for elaborate looks or if bridal party makeup is included.</p>
                <div className="mt-6 space-y-3">
                  {[
                    { t: "T-3h", l: "Skin prep, base, concealing" },
                    { t: "T-2h", l: "Contouring, eye makeup" },
                    { t: "T-1h", l: "Final details, lips, setting" },
                    { t: "T-0", l: "Ready — full touch-up kit left with you" },
                  ].map((step) => (
                    <div key={step.t} className="flex items-center gap-4">
                      <span className="font-mono text-xs text-[#F4B7CE] w-12 shrink-0">{step.t}</span>
                      <span className="h-px flex-1 bg-white/20" />
                      <span className="text-sm text-white/80">{step.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="bg-white rounded-3xl p-7 border border-[#F1DCE3] flex items-start gap-4">
                <MapPin size={20} className="text-[#E62E6B] mt-0.5 shrink-0" />
                <div>
                  <div className="font-display text-base font-bold text-[#4A2530]">On-Location. Everywhere in Karnataka.</div>
                  <p className="mt-2 text-sm text-[#5C4E52] leading-relaxed">Also, Rekha travels to your home, hotel or venue, so you don't need to visit a studio. Outstation charges extra.</p>
                  <Link to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#E62E6B] hover:gap-2.5 transition-all" data-testid="bridal-pkg-location-link">
                    Check availability <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="bg-white py-20 md:py-28" data-testid="bridal-pkg-faq">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <Reveal>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Common questions</span>
            <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl leading-[1.1] mt-3">
              Answers before you <span className="italic text-[#E62E6B]">reach out</span>
            </h2>
            <p className="mt-4 text-sm text-[#5C4E52] leading-relaxed">Still have questions? Send a message on WhatsApp or fill the enquiry form — usually answered within a few hours.</p>
            <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-white font-medium text-sm hover:bg-[#1eb959] transition-colors" data-testid="bridal-pkg-faq-whatsapp">
              <FaWhatsapp size={17} /> Ask on WhatsApp
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="divide-y divide-[#F1DCE3]">
              {FAQS.map((f) => <Faq key={f.q} {...f} />)}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  </>
);

export default BridalPackages;
