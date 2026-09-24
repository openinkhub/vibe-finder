import React from "react";
import { Link } from "react-router-dom";
import { Check, X, ArrowUpRight } from "lucide-react";
import { Reveal } from "./fx/Reveal";
import { AuthorBio } from "./PageShell";
import { scrollToId } from "./Navbar";

const H = ({ children }) => <h3 className="font-display text-2xl sm:text-3xl text-[#4A2530]">{children}</h3>;
const P = ({ children }) => <p className="text-sm sm:text-base text-[#5C4E52] leading-relaxed">{children}</p>;

const Cta = ({ c }) => {
  const cls = c.secondary ? "inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E62E6B] text-[#E62E6B] font-medium hover:bg-[#E62E6B] hover:text-white transition-colors" : "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E62E6B] text-white font-medium hover:bg-[#C81F57] transition-colors shadow-lg shadow-[#E62E6B]/25";
  const tid = `body-cta-${c.label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return c.scrollTo
    ? <button onClick={() => scrollToId(c.scrollTo)} className={cls} data-testid={tid}>{c.label} <ArrowUpRight size={16} /></button>
    : <Link to={c.to} className={cls} data-testid={tid}>{c.label} <ArrowUpRight size={16} /></Link>;
};

const Block = ({ s, i }) => (
  <Reveal delay={Math.min(i, 3) * 0.05}>
    <div className="space-y-4 scroll-mt-28" id={s.terms ? "booking-terms" : undefined} data-testid={`body-section-${i}`}>
      <H>{s.h}</H>
      {s.quote && <p className="font-display italic text-xl sm:text-2xl text-[#E62E6B] border-l-2 border-[#E62E6B] pl-4">{s.quote}</p>}
      {s.p?.map((t, k) => <P key={k}>{t}</P>)}
      {s.bullets && <ul className="space-y-2.5">{s.bullets.map((b) => <li key={b} className="flex gap-3 text-sm sm:text-base text-[#5C4E52]"><Check size={18} className="text-[#E62E6B] shrink-0 mt-0.5" />{b}</li>)}</ul>}
      {s.donts && <ul className="space-y-2.5">{s.donts.map((b) => <li key={b} className="flex gap-3 text-sm sm:text-base text-[#5C4E52]"><X size={18} className="text-[#8B7F82] shrink-0 mt-0.5" />{b}</li>)}</ul>}
      {s.items && <ul className="grid sm:grid-cols-2 gap-3">{s.items.map(([t, d]) => <li key={t} className="bg-white rounded-2xl p-4 border border-[#F1DCE3]"><div className="font-display text-lg text-[#4A2530]">{t}</div><div className="text-sm text-[#5C4E52] mt-1">{d}</div></li>)}</ul>}
      {s.steps && <ol className="space-y-3">{s.steps.map(([t, d], k) => <li key={t} className="flex gap-4 bg-white rounded-2xl p-4 border border-[#F1DCE3]"><span className="shrink-0 w-9 h-9 rounded-full bg-[#FBE9F0] text-[#E62E6B] font-mono text-xs flex items-center justify-center">{String(k + 1).padStart(2, "0")}</span><div><div className="font-display text-lg text-[#4A2530]">{t}</div><div className="text-sm text-[#5C4E52] mt-1">{d}</div></div></li>)}</ol>}
      {s.terms && <ol className="bg-white rounded-3xl border border-[#F1DCE3] divide-y divide-[#FBE9F0]" data-testid="body-terms">{s.terms.map(([t, d], k) => <li key={t} className="p-5 sm:p-6"><h4 className="font-display text-lg text-[#4A2530]"><span className="font-mono text-xs text-[#E62E6B] mr-2">{k + 1}.</span>{t}</h4><p className="text-sm text-[#5C4E52] mt-2 leading-relaxed">{d}</p></li>)}</ol>}
      {s.ctas && <div className="flex flex-wrap gap-3 pt-2">{s.ctas.map((c) => <Cta key={c.label} c={c} />)}</div>}
    </div>
  </Reveal>
);

export const RichBody = ({ body }) => (
  <section className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pb-14 md:pb-20" data-testid="rich-body">
    {body.intro && <Reveal><div className="mb-10 font-mono text-[11px] tracking-[0.2em] uppercase text-[#8B7F82] space-y-1">{body.intro.map((t) => <div key={t}>{t}</div>)}</div></Reveal>}
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-14 items-start">
      <div className="space-y-12">{body.sections.map((s, i) => <Block key={s.h} s={s} i={i} />)}</div>
      <div className="space-y-6 lg:sticky lg:top-28">
        <AuthorBio />
        {body.faq && (
          <Reveal delay={0.1}>
            <div className="bg-[#FBE9F0] rounded-3xl p-6 border border-[#F1DCE3]" data-testid="body-faq">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E62E6B] mb-4">Good to know</div>
              {body.faq.map(([q, a]) => <div key={q} className="mb-4 last:mb-0"><div className="font-display text-base text-[#4A2530]">{q}</div><p className="text-sm text-[#5C4E52] mt-1">{a}</p></div>)}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  </section>
);
