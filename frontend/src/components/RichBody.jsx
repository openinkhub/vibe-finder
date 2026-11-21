import React from "react";
import { Link } from "react-router-dom";
import { Check, X, ArrowUpRight, ArrowRight, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { brand } from "../mock/mock";
import { Reveal } from "./fx/Reveal";
import { AuthorBio } from "./PageShell";
import { scrollToId } from "./Navbar";

const H = ({ children }) => <h3 className="font-display text-2xl sm:text-3xl text-[#4A2530]">{children}</h3>;
// Inline formatting in body text: **bold** and [link text](/path).
const strong = (t, k) => (t.includes("**") ? t.split(/\*\*(.+?)\*\*/).map((x, i) => (i % 2 ? <strong key={`${k}-${i}`} className="font-semibold text-[#4A2530]">{x}</strong> : x)) : t);
export const bold = (t) => {
  if (typeof t !== "string" || (!t.includes("**") && !t.includes("]("))) return t;
  const out = [];
  t.split(/(\[[^\]]+\]\([^)\s]+\))/).forEach((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (!m) { out.push(strong(part, i)); return; }
    const cls = "text-[#E62E6B] underline decoration-[#E62E6B]/40 underline-offset-2 hover:decoration-[#E62E6B]";
    out.push(m[2].startsWith("/") ? <Link key={i} to={m[2]} className={cls}>{m[1]}</Link> : <a key={i} href={m[2]} className={cls}>{m[1]}</a>);
  });
  return out;
};
const P = ({ children }) => <p className="text-sm sm:text-base text-[#5C4E52] leading-relaxed">{bold(children)}</p>;

const Cta = ({ c }) => {
  const cls = c.secondary ? "inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E62E6B] text-[#E62E6B] font-medium hover:bg-[#E62E6B] hover:text-white transition-colors" : "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E62E6B] text-white font-medium hover:bg-[#C81F57] transition-colors shadow-lg shadow-[#E62E6B]/25";
  const tid = `body-cta-${c.label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  if (c.href === "whatsapp") return <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className={cls} data-testid={tid}><FaWhatsapp size={16} /> {c.label}</a>;
  if (c.href === "tel") return <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className={cls} data-testid={tid}><Phone size={16} /> {c.label}</a>;
  return c.scrollTo
    ? <button onClick={() => scrollToId(c.scrollTo)} className={cls} data-testid={tid}>{c.label} <ArrowUpRight size={16} /></button>
    : <Link to={c.to} className={cls} data-testid={tid}>{c.label} <ArrowUpRight size={16} /></Link>;
};

export const Block = ({ s, i }) => (
  <Reveal delay={Math.min(i, 3) * 0.05}>
    <div className="space-y-4 scroll-mt-28" id={s.terms ? "booking-terms" : undefined} data-testid={`body-section-${i}`}>
      <H>{s.h}</H>
      {s.sub && <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#E62E6B]">{s.sub}</p>}
      {s.quote && <p className="font-display italic text-xl sm:text-2xl text-[#E62E6B] border-l-2 border-[#E62E6B] pl-4">{s.quote}</p>}
      {s.p?.map((t, k) => <P key={k}>{t}</P>)}
      {s.bullets && <ul className="space-y-2.5">{s.bullets.map((b) => <li key={b} className="flex gap-3 text-sm sm:text-base text-[#5C4E52]"><Check size={18} className="text-[#E62E6B] shrink-0 mt-0.5" /><span>{bold(b)}</span></li>)}</ul>}
      {s.donts && <ul className="space-y-2.5">{s.donts.map((b) => <li key={b} className="flex gap-3 text-sm sm:text-base text-[#5C4E52]"><X size={18} className="text-[#6E6266] shrink-0 mt-0.5" />{b}</li>)}</ul>}
      {s.chips && <div className="flex flex-wrap items-center gap-2">{s.chips.map((c, k) => <React.Fragment key={c}>{k > 0 && <ArrowRight size={14} className="text-[#F4B7CE]" />}<span className="px-4 py-2 rounded-full bg-white border border-[#F1DCE3] text-sm text-[#4A2530]">{c}</span></React.Fragment>)}</div>}
      {s.after?.map((t, k) => <P key={k}>{t}</P>)}
      {s.items && <ul className="grid sm:grid-cols-2 gap-3">{s.items.map(([t, d]) => <li key={t} className="bg-white rounded-2xl p-4 border border-[#F1DCE3]"><div className="font-display text-lg text-[#4A2530]">{t}</div><div className="text-sm text-[#5C4E52] mt-1">{d}</div></li>)}</ul>}
      {s.steps && <ol className="space-y-3">{s.steps.map(([t, d], k) => <li key={t} className="flex gap-4 bg-white rounded-2xl p-4 border border-[#F1DCE3]"><span className="shrink-0 w-9 h-9 rounded-full bg-[#FBE9F0] text-[#E62E6B] font-mono text-xs flex items-center justify-center">{String(k + 1).padStart(2, "0")}</span><div><div className="font-display text-lg text-[#4A2530]">{t}</div><div className="text-sm text-[#5C4E52] mt-1">{d}</div></div></li>)}</ol>}
      {s.terms && <ol className="bg-white rounded-3xl border border-[#F1DCE3] divide-y divide-[#FBE9F0]" data-testid="body-terms">{s.terms.map(([t, d], k) => <li key={t} className="p-5 sm:p-6"><h3 className="font-display text-lg text-[#4A2530]"><span className="font-mono text-xs text-[#E62E6B] mr-2">{k + 1}.</span>{t}</h3><p className="text-sm text-[#5C4E52] mt-2 leading-relaxed">{d}</p></li>)}</ol>}
      {s.qa && <div className="space-y-3" data-testid="body-qa">{s.qa.map(([q, a]) => <div key={q} className="bg-white rounded-2xl border border-[#F1DCE3] px-5 py-4"><div className="flex items-start gap-3"><span className="shrink-0 w-7 h-7 rounded-full bg-[#D6245F] text-white font-mono text-[10px] flex items-center justify-center mt-0.5">Q</span><h3 className="font-display text-base sm:text-lg text-[#4A2530]">{q}</h3></div><div className="flex items-start gap-3 mt-2"><span className="shrink-0 w-7 h-7 rounded-full bg-[#FBE9F0] text-[#E62E6B] font-mono text-[10px] flex items-center justify-center mt-0.5">A</span><p className="text-sm text-[#5C4E52] leading-relaxed">{a}</p></div></div>)}</div>}
      {s.details && <dl className="bg-white rounded-3xl border border-[#F1DCE3] divide-y divide-[#FBE9F0]" data-testid="body-details">{s.details.map(([k, v]) => <div key={k} className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 px-5 py-3.5"><dt className="font-mono text-[11px] uppercase tracking-wider text-[#6E6266] pt-0.5">{k}</dt><dd className={`text-sm sm:text-base ${k === "Course Fee" ? "font-display text-xl text-[#E62E6B]" : "text-[#4A2530]"}`}>{v}</dd></div>)}</dl>}
      {s.cardTable && (
        <div className="grid sm:grid-cols-2 gap-4" data-testid="body-card-table">
          {s.cardTable.map(([occ, svc, desc], k) => (
            <div key={`${occ}-${k}`} className="bg-white rounded-2xl p-5 border border-[#F1DCE3] hover:border-[#E62E6B] transition-colors" data-testid={`card-table-item-${k}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6E6266]">{occ}</span>
                <ArrowRight size={12} className="text-[#F4B7CE]" />
                <span className="px-2.5 py-1 rounded-full bg-[#FBE9F0] text-[#E62E6B] text-xs font-semibold">{svc}</span>
              </div>
              <p className="text-sm text-[#5C4E52] mt-3 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      )}
      {s.ctas && <div className="flex flex-wrap gap-3 pt-2">{s.ctas.map((c) => <Cta key={c.label} c={c} />)}</div>}
    </div>
  </Reveal>
);

export const RichBody = ({ body }) => (
  <section className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pb-14 md:pb-20" data-testid="rich-body">
    {body.intro && <Reveal><div className="mb-10 font-mono text-[11px] tracking-[0.2em] uppercase text-[#6E6266] space-y-1">{body.intro.map((t) => <div key={t}>{t}</div>)}</div></Reveal>}
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-14 items-start">
      <div className="space-y-12">{body.sections.map((s, i) => <Block key={s.h} s={s} i={i} />)}</div>
      <div className="space-y-6 lg:sticky lg:top-28">
        <AuthorBio />
        {body.faq && (
          <Reveal delay={0.1}>
            <div className="bg-[#FBE9F0] rounded-3xl p-6 border border-[#F1DCE3]" data-testid="body-faq">
              <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E62E6B] mb-4">Common questions</h2>
              {body.faq.map(([q, a]) => <div key={q} className="mb-4 last:mb-0"><h3 className="font-display text-base text-[#4A2530]">{q}</h3><p className="text-sm text-[#5C4E52] mt-1">{a}</p></div>)}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  </section>
);
