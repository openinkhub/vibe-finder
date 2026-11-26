import React from "react";
import { srcSetFor } from "../lib/img";
import { Link } from "react-router-dom";
import { Monitor, Camera, Briefcase, Users, Check, ArrowUpRight, CalendarCheck, Clock, Sparkles, MapPin } from "lucide-react";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";
import { brand } from "../mock/mock";

const WHO = [
  { icon: Briefcase, label: "Corporate Executives", desc: "For example, board meetings, annual reports and LinkedIn headshots need makeup that looks confident, not overdone." },
  { icon: Monitor, label: "TV & Media Presenters", desc: "Studio lights, 4K cameras and green screens need HD, long-wear makeup that holds through a full day on air." },
  { icon: Camera, label: "Photography Shoots", desc: "Similarly, product launches and brand shoots need makeup that stays the same for hours, with touch-ups." },
  { icon: Users, label: "Events & Conferences", desc: "Likewise, keynotes, panels and award nights call for structured looks for the stage." },
];

const INCLUDES = [
  "30-minute pre-shoot chat to match the brief",
  "Skin-prep and HD-grade base in your tone",
  "Colour checks for the camera, so colours look true on screen",
  "Long-wear, transfer-proof products that last all day",
  "Blotting, touch-up guidance between sessions",
  "On-location service across Bangalore",
];

const STEPS = [
  { n: "01", title: "Tell us your brief", body: "First, share the event type, the camera setup, how long it runs and any sample photos. A 15-minute call is enough." },
  { n: "02", title: "Trial (optional)", body: "For long shoots or TV work, a trial checks the look on your camera and lights before the shoot day." },
  { n: "03", title: "On-site session", body: "Rekha arrives ready. A full session takes 60–90 minutes, based on the look, and she leaves a touch-up kit on set." },
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
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#C8215A]">Who it's for</span>
          <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mt-3">
            Professional makeup for <span className="italic text-[#C8215A]">every camera</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-[#5C4E52] leading-relaxed">
            Whether you face a TV camera, a brand shoot or a stage, good makeup is the difference between looking present and looking polished.
          </p>
        </Reveal>

        <div className="mt-10 md:mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHO.map((w, i) => (
            <Reveal key={w.label} delay={i * 0.08}>
              <TiltCard className="h-full bg-white rounded-3xl p-7 border border-[#F1DCE3] hover:shadow-xl hover:shadow-[#E62E6B]/10 transition-shadow duration-300">
                <div className="w-11 h-11 rounded-2xl bg-[#FBE9F0] flex items-center justify-center text-[#C8215A]">
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
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#C8215A]">What's included</span>
            <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl leading-[1.1] mt-3">
              Each session is built to <span className="italic text-[#C8215A]">perform in photos</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#5C4E52] leading-relaxed">
              Makeup for shoots and TV isn't just about looking good. It must also look right on your lens, under your lights and in your format.
            </p>
            <ul className="mt-7 space-y-3.5">
              {INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#5C4E52]">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FBE9F0] flex items-center justify-center shrink-0">
                    <Check size={12} className="text-[#C8215A]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#D6245F] text-white font-medium hover:bg-[#C81F57] transition-colors shadow-lg shadow-[#E62E6B]/25 w-full sm:w-auto" data-testid="corp-book-btn">
                <CalendarCheck size={17} /> Book a Session
              </Link>
              <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[#E62E6B] text-[#C8215A] font-medium hover:bg-[#FBE9F0] transition-colors w-full sm:w-auto" data-testid="corp-whatsapp-btn">
                Ask on WhatsApp
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative rounded-[32px] overflow-hidden aspect-[4/5]">
              <img width="800" height="1000" decoding="async" src={CORP_IMG} srcSet={srcSetFor(CORP_IMG)} sizes="(min-width: 768px) 45vw, 100vw" alt="Professional corporate makeup Bangalore" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl px-5 py-4 flex items-center gap-4 shadow-xl">
                <Sparkles size={22} className="text-[#C8215A] shrink-0" />
                <div>
                  <div className="font-display text-sm font-bold text-[#4A2530]">On-Location Service.</div>
                  <div className="text-xs text-[#5C4E52] mt-0.5">Rekha comes to your studio, office or event venue across the city.</div>
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
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#C8215A]">How it works</span>
          <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl leading-[1.1] mt-3">From brief to on-set in <span className="italic text-[#C8215A]">three steps</span></h2>
        </Reveal>
        <div className="mt-10 md:mt-14 grid sm:grid-cols-3 gap-6 md:gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="bg-white rounded-3xl p-7 border border-[#F1DCE3] h-full">
                <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#C8215A]">Step {s.n}</div>
                <h3 className="font-display text-xl font-bold text-[#4A2530] mt-4">{s.title}</h3>
                <p className="mt-3 text-sm text-[#5C4E52] leading-relaxed">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 md:mt-14 text-center">
          <div className="inline-flex items-center gap-3 text-sm text-[#5C4E52]">
            <MapPin size={16} className="text-[#C8215A]" />
            Rekha takes shoots and events across Bangalore, Mysore and parts of Karnataka.
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
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#C8215A]">Why it matters</span>
            <h2 className="font-display text-[#4A2530] text-3xl sm:text-4xl leading-[1.1] mt-3">
              Lenses see what <span className="italic text-[#C8215A]">eyes miss</span>
            </h2>
            <p className="mt-5 text-sm sm:text-base text-[#5C4E52] leading-relaxed">
              After all, a lens picks up shine, uneven colour and colour casts that the eye smooths over. So Rekha adjusts the makeup for the light and the lens before you step in front of it.
            </p>
            <p className="mt-4 text-sm sm:text-base text-[#5C4E52] leading-relaxed">
              The result is images where your skin looks like you — not washed out, not shiny, not orange under warm tungsten. Just polished.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, title: "Long-wear formulas", body: "Products chosen to last 8–12 hours without touch-ups, which matters on all-day shoots." },
              { icon: Monitor, title: "HDTV-calibrated", body: "Colours and contours tuned to TV lights, so faces look natural on screen." },
              { icon: Camera, title: "Flash & strobe-safe", body: "Bases and powders that don't flash white under studio lights." },
              { icon: Sparkles, title: "Skin-first philosophy", body: "Prep, hydration and base work means skin looks like skin, not like makeup — even at 4K." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <div className="bg-white rounded-2xl p-5 border border-[#F1DCE3]">
                  <f.icon size={20} className="text-[#C8215A]" />
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
