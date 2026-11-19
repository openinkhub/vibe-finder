import React from "react";
import { srcSetFor } from "../lib/img";
import { Link } from "react-router-dom";
import { Monitor, Camera, Briefcase, Users, Check, ArrowUpRight, CalendarCheck, Clock, Sparkles, MapPin } from "lucide-react";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";
import { brand } from "../mock/mock";

const WHO = [
  { icon: Briefcase, label: "Corporate Executives", desc: "Board meetings, annual reports, LinkedIn headshots — makeup that reads authority without looking overdone." },
  { icon: Monitor, label: "TV & Media Presenters", desc: "Studio lighting, 4K cameras and green screens demand HD-ready, long-wear coverage that holds across a full broadcast day." },
  { icon: Camera, label: "Photography Shoots", desc: "Product launches, editorial features, brand look books — consistent makeup across multi-hour shoots with touch-up support." },
  { icon: Users, label: "Events & Conferences", desc: "Keynote speakers, panel discussions, award nights — structured looks for high-visibility public occasions." },
];

const INCLUDES = [
  "30-minute pre-shoot consultation to match the brief",
  "Skin-prep and HD-grade base in your tone",
  "On-camera colour calibration — colours read true on screen",
  "Long-wear, transfer-proof formulas for all-day performance",
  "Blotting, touch-up guidance between sessions",
  "On-location service across Bangalore",
];

const STEPS = [
  { n: "01", title: "Tell us your brief", body: "Share the event type, camera setup, expected duration and any references. A 15-minute call is enough." },
  { n: "02", title: "Trial (optional)", body: "For multi-day shoots or broadcast work, a trial confirms the look on your specific camera and lighting before the shoot day." },
  { n: "03", title: "On-site session", body: "Rekha arrives ready. Full setup, 60–90 minutes depending on complexity, with touch-up kit left on set." },
];

const CORP_IMG = "https://images.unsplash.com/photo-1585240975858-7264fd020798?crop=entropy&cs=srgb&fm=jpg&q=85&w=900";

const CorporateMakeup = () => (
  <>
    {/* Stats strip */}
    <section className="bg-[#4A2530] py-8 md:py-10" data-testid="corp-stats-strip">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          {[
            { v: "60–90 min", l: "Session length" },
            { v: "On-Location", l: "Bangalore & nearby" },
            { v: "HD & 4K", l: "Camera-ready finish" },
            { v: "14+ yrs", l: "Professional experience" },
          ].map(({ v, l }) => (
            <div key={l} className="pt-6 sm:pt-0 sm:px-8 first:pt-0 first:sm:pl-0">
              <div className="font-display text-2xl sm:text-3xl font-bold text-white">{v}</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-widest text-white/50">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Who it's for */}
    <section className="bg-[#F4F1EA] py-20 md:py-28" data-testid="corp-who-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal>
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Who it's for</span>
          <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mt-3">
            Professional makeup for <span className="italic text-[#E62E6B]">every camera</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-[#5C4E52] leading-relaxed">
            Whether you're facing a broadcast studio camera, a DSLR for a brand campaign or a conference stage — professional makeup is the difference between looking present and looking polished.
          </p>
        </Reveal>

        <div className="mt-10 md:mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHO.map((w, i) => (
            <Reveal key={w.label} delay={i * 0.08}>
              <TiltCard className="h-full bg-white rounded-3xl p-7 border border-[#F1DCE3] hover:shadow-xl hover:shadow-[#E62E6B]/10 transition-shadow duration-300">
                <div className="w-11 h-11 rounded-2xl bg-[#FBE9F0] flex items-center justify-center text-[#E62E6B]">
                  <w.icon size={20} />
                </div>
                <h3 className="font-display text-lg font-bold text-[#4A2530] mt-5">{w.label}</h3>
                <p className="mt-2.5 text-sm text-[#5C4E52] leading-relaxed">{w.desc}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* What's included + image */}
    <section className="bg-white py-20 md:py-28" data-testid="corp-includes-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">What's included</span>
            <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl leading-[1.1] mt-3">
              Every session is built to <span className="italic text-[#E62E6B]">perform on camera</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#5C4E52] leading-relaxed">
              Professional makeup for shoots and broadcasts isn't just about looking good — it's about looking correct on the particular camera, lights and format you're working with.
            </p>
            <ul className="mt-7 space-y-3.5">
              {INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#5C4E52]">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FBE9F0] flex items-center justify-center shrink-0">
                    <Check size={12} className="text-[#E62E6B]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#D6245F] text-white font-medium hover:bg-[#C81F57] transition-colors shadow-lg shadow-[#E62E6B]/25 w-full sm:w-auto" data-testid="corp-book-btn">
                <CalendarCheck size={17} /> Book a Session
              </Link>
              <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[#E62E6B] text-[#E62E6B] font-medium hover:bg-[#FBE9F0] transition-colors w-full sm:w-auto" data-testid="corp-whatsapp-btn">
                Ask on WhatsApp
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative rounded-[32px] overflow-hidden aspect-[4/5]">
              <img width="800" height="1000" decoding="async" src={CORP_IMG} srcSet={srcSetFor(CORP_IMG)} sizes="(min-width: 768px) 45vw, 100vw" alt="Professional corporate makeup Bangalore" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl px-5 py-4 flex items-center gap-4 shadow-xl">
                <Sparkles size={22} className="text-[#E62E6B] shrink-0" />
                <div>
                  <div className="font-display text-sm font-bold text-[#4A2530]">On-Location Service.</div>
                  <div className="text-xs text-[#5C4E52] mt-0.5">Rekha comes to your studio, office or event venue across Bangalore.</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="bg-[#FBE9F0] py-20 md:py-28" data-testid="corp-process-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="text-center max-w-xl mx-auto">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">How it works</span>
          <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl leading-[1.1] mt-3">From brief to on-set in <span className="italic text-[#E62E6B]">three steps</span></h2>
        </Reveal>
        <div className="mt-10 md:mt-14 grid sm:grid-cols-3 gap-6 md:gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="bg-white rounded-3xl p-7 border border-[#F1DCE3] h-full">
                <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#E62E6B]">Step {s.n}</div>
                <h3 className="font-display text-xl font-bold text-[#4A2530] mt-4">{s.title}</h3>
                <p className="mt-3 text-sm text-[#5C4E52] leading-relaxed">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 md:mt-14 text-center">
          <div className="inline-flex items-center gap-3 text-sm text-[#5C4E52]">
            <MapPin size={16} className="text-[#E62E6B]" />
            Available for shoots and events across Bangalore, Mysore and select Karnataka locations.
          </div>
          <div className="mt-6">
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#4A2530] text-white font-medium hover:bg-[#D6245F] transition-colors text-sm" data-testid="corp-cta-bottom">
              Enquire about your shoot <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>

    {/* On-camera difference */}
    <section className="bg-[#F4F1EA] py-20 md:py-28" data-testid="corp-why-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Why it matters</span>
            <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl leading-[1.1] mt-3">
              Cameras see what <span className="italic text-[#E62E6B]">eyes miss</span>
            </h2>
            <p className="mt-5 text-sm sm:text-base text-[#5C4E52] leading-relaxed">
              A camera sensor picks up shine, uneven pigmentation and colour casts that the human eye naturally smooths over. Professional makeup corrects for the specific lighting temperature, sensor profile and compression of your shoot before you're ever in front of the lens.
            </p>
            <p className="mt-4 text-sm sm:text-base text-[#5C4E52] leading-relaxed">
              The result is images where your skin looks like you — not washed out, not shiny, not orange under warm tungsten. Just polished.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, title: "Long-wear formulas", body: "Products selected for 8–12 hour performance without touch-up — critical for all-day shoots." },
              { icon: Monitor, title: "HDTV-calibrated", body: "Colours and contours tuned to broadcast-spec lighting so faces read naturally on screen." },
              { icon: Camera, title: "Flash & strobe-safe", body: "Foundations and powders that don't bounce light into white in controlled studio environments." },
              { icon: Sparkles, title: "Skin-first philosophy", body: "Prep, hydration and base work means skin looks like skin, not like makeup — even at 4K." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <div className="bg-white rounded-2xl p-5 border border-[#F1DCE3]">
                  <f.icon size={20} className="text-[#E62E6B]" />
                  <div className="font-display text-sm font-bold text-[#4A2530] mt-3">{f.title}</div>
                  <p className="mt-1.5 text-xs text-[#5C4E52] leading-relaxed">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  </>
);

export default CorporateMakeup;
