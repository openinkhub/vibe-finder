import React, { useEffect, useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Check, ArrowUpRight, MapPin } from "lucide-react";
import { PageShell, PageHero, AuthorBio } from "../components/PageShell";
import { Reveal } from "../components/fx/Reveal";
import { TiltCard } from "../components/fx/TiltCard";
import { servicePages, locationPages, staticPages, blogPosts, legalLinks } from "../content/site";
import legal from "../content/legal.json";

const Section = ({ children, className = "" }) => <section className={`max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pb-14 md:pb-20 ${className}`}>{children}</section>;

const Body = ({ page }) => (
  <Section>
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-14">
      <Reveal>
        <div className="space-y-5 text-[#5C4E52] leading-relaxed text-sm sm:text-base" data-testid="page-body">{page.body.map((p, i) => <p key={i}>{p}</p>)}</div>
        {page.bullets && (
          <ul className="mt-8 space-y-3" data-testid="page-bullets">
            {page.bullets.map(([t, d]) => (
              <li key={t} className="flex gap-3 bg-white rounded-2xl p-4 border border-[#F1DCE3]"><Check size={18} className="text-[#E62E6B] shrink-0 mt-0.5" /><div><div className="font-display text-lg text-[#4A2530]">{t}</div><div className="text-sm text-[#5C4E52] mt-1">{d}</div></div></li>
            ))}
          </ul>
        )}
      </Reveal>
      <div className="space-y-6">
        <AuthorBio />
        {page.faq && (
          <Reveal delay={0.1}>
            <div className="bg-[#FBE9F0] rounded-3xl p-6 border border-[#F1DCE3]" data-testid="page-faq">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E62E6B] mb-4">Good to know</div>
              {page.faq.map(([q, a]) => <div key={q} className="mb-4 last:mb-0"><div className="font-display text-base text-[#4A2530]">{q}</div><p className="text-sm text-[#5C4E52] mt-1">{a}</p></div>)}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  </Section>
);

export const ServicePage = () => {
  const slug = useLocation().pathname.replace(/^\//, "");
  const page = servicePages.find((s) => s.slug === slug) || locationPages.find((l) => l.slug === slug);
  if (!page) return <Navigate to="/" replace />;
  const isLocation = !page.menu;
  return (
    <PageShell title={page.title}>
      <div data-testid={`service-page-${slug}`}>
        <PageHero eyebrow={page.eyebrow || (<span className="inline-flex items-center gap-1.5"><MapPin size={12} /> {page.area} · Bangalore</span>)} title={page.title} subtitle={page.subtitle} image={page.image} ctaTo={`/personal-shopping?service=${encodeURIComponent(page.service || "Bridal")}`} />
        <Body page={page} />
        {isLocation && (
          <Section>
            <div className="flex flex-wrap gap-2" data-testid="location-links">
              {locationPages.filter((l) => l.slug !== slug).map((l) => <Link key={l.slug} to={`/${l.slug}`} className="inline-flex items-center gap-2 bg-white border border-[#F1DCE3] rounded-full px-4 py-2.5 text-sm text-[#4A2530] hover:border-[#E62E6B] hover:text-[#E62E6B]"><MapPin size={14} className="text-[#E62E6B]" /> {l.area}</Link>)}
            </div>
          </Section>
        )}
      </div>
    </PageShell>
  );
};

export const StaticPage = ({ slug }) => {
  const page = staticPages[slug];
  const { search } = useLocation();
  const service = new URLSearchParams(search).get("service");
  useEffect(() => { if (slug === "personal-shopping" && service) sessionStorage.setItem("rk_service", service); }, [slug, service]);
  return (
    <PageShell title={page.title}>
      <div data-testid={`static-page-${slug}`}>
        <PageHero eyebrow={page.eyebrow} title={page.title} image={page.image} ctaTo={slug === "personal-shopping" ? "/#contact" : `/personal-shopping${page.service ? `?service=${page.service}` : ""}`} cta={slug === "personal-shopping" ? "Open the enquiry form" : undefined} />
        <Body page={page} />
      </div>
    </PageShell>
  );
};

export const BlogPage = () => (
  <PageShell title="Blog">
    <div data-testid="blog-page">
      <PageHero eyebrow="Blog" title="Notes from the chair" subtitle="Booking timelines, technique explainers and South Indian bridal know-how — written from nine years of wedding mornings." />
      <Section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogPosts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <TiltCard className="bg-white rounded-3xl overflow-hidden border border-[#F1DCE3] h-full" data-testid={`blog-card-${i}`}>
                <img src={p.image} alt={p.title} className="w-full h-48 object-cover" />
                <div className="p-6"><div className="font-mono text-[10px] uppercase tracking-wider text-[#E62E6B]">{p.date}</div><h3 className="font-display text-xl text-[#4A2530] mt-2">{p.title}</h3><p className="text-sm text-[#5C4E52] mt-2">{p.excerpt}</p><span className="mt-4 inline-flex items-center gap-1 text-sm text-[#E62E6B]">Read soon <ArrowUpRight size={14} /></span></div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>
    </div>
  </PageShell>
);

export const LegalPage = () => {
  const { hash } = useLocation();
  const [active, setActive] = useState((hash || "#privacy").slice(1));
  useEffect(() => { if (hash) { setActive(hash.slice(1)); setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 150); } }, [hash]);
  return (
    <PageShell title="Legal Policies">
      <div data-testid="legal-page">
        <PageHero eyebrow="Trust & Transparency" title="Our Promise, In Writing" subtitle="Just like every look we create is thoughtfully tailored to you, so are the terms behind it. Here's everything you need to know about how we protect your information, manage bookings, and stand by our work." cta="Questions? Contact us" ctaTo="/#contact" />
        <Section>
          <div className="flex flex-wrap gap-2 mb-8 sticky top-20 z-10 bg-[#F4F1EA]/90 backdrop-blur py-2" data-testid="legal-tabs">
            {legalLinks.map((l) => { const k = l.to.split("#")[1]; return <a key={k} href={`#${k}`} onClick={() => setActive(k)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${active === k ? "bg-[#E62E6B] border-[#E62E6B] text-white" : "bg-white border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]"}`} data-testid={`legal-tab-${k}`}>{l.label}</a>; })}
          </div>
          <div className="space-y-10">
            {legal.map((s) => (
              <article key={s.key} id={s.key} className="bg-white rounded-3xl p-6 sm:p-10 border border-[#F1DCE3] scroll-mt-36" data-testid={`legal-section-${s.key}`}>
                <h2 className="font-display text-3xl sm:text-4xl text-[#4A2530] mb-6">{s.title}</h2>
                <div className="legal-md text-sm sm:text-base text-[#5C4E52] leading-relaxed"><ReactMarkdown>{s.md}</ReactMarkdown></div>
              </article>
            ))}
          </div>
        </Section>
      </div>
    </PageShell>
  );
};
