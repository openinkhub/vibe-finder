import React, { useEffect } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Check, ArrowUpRight, MapPin } from "lucide-react";
import { PageShell, PageHero, AuthorBio } from "../components/PageShell";
import { SeoIntro } from "../components/SeoIntro";
import { Reveal } from "../components/fx/Reveal";
import { TiltCard } from "../components/fx/TiltCard";
import Contact from "../components/Contact";
import Testimonials from "../components/Testimonials";
import { servicePages, locationPages, staticPages, blogPosts, legalLinks } from "../content/site";
import { getPage, pagesByGroup, headerMenu, legalKeyByPath, BOOKING_PATH } from "../lib/pages";
import { PortfolioGallery } from "./PortfolioPage";
import legal from "../content/legal.json";

const Section = ({ children, className = "" }) => <section className={`max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pb-14 md:pb-20 ${className}`}>{children}</section>;

const usePage = () => {
  const { pathname } = useLocation();
  return { page: getPage(pathname), pathname };
};

const findBody = (slug) => servicePages.find((s) => s.slug === slug) || locationPages.find((l) => l.slug === slug) || staticPages[slug];

const Body = ({ page }) => (
  <Section>
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-14">
      <Reveal>
        {page?.body && <div className="space-y-5 text-[#5C4E52] leading-relaxed text-sm sm:text-base" data-testid="page-body">{page.body.map((p, i) => <p key={i}>{p}</p>)}</div>}
        {page?.bullets && (
          <ul className="mt-8 space-y-3" data-testid="page-bullets">
            {page.bullets.map(([t, d]) => (
              <li key={t} className="flex gap-3 bg-white rounded-2xl p-4 border border-[#F1DCE3]"><Check size={18} className="text-[#E62E6B] shrink-0 mt-0.5" /><div><div className="font-display text-lg text-[#4A2530]">{t}</div><div className="text-sm text-[#5C4E52] mt-1">{d}</div></div></li>
            ))}
          </ul>
        )}
      </Reveal>
      <div className="space-y-6">
        <AuthorBio />
        {page?.faq && (
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

const ChildCards = ({ items }) => (
  <Section>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="child-cards">
      {items.map((c, i) => (
        <Reveal key={c.path} delay={i * 0.06}>
          <Link to={c.path} data-testid={`child-card-${c.path.slice(1)}`}>
            <TiltCard className="bg-white rounded-3xl p-6 border border-[#F1DCE3] h-full hover:border-[#E62E6B] transition-colors">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#E62E6B]">{c.eyebrow}</div>
              <h3 className="font-display text-xl text-[#4A2530] mt-2">{c.name}</h3>
              <p className="text-sm text-[#5C4E52] mt-2">{c.heroSub}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-[#E62E6B]">{c.heroHeadline} <ArrowUpRight size={14} /></span>
            </TiltCard>
          </Link>
        </Reveal>
      ))}
    </div>
  </Section>
);

const ComingSoon = () => (
  <Section>
    <Reveal>
      <div className="bg-[#FBE9F0] rounded-3xl p-8 sm:p-12 border border-[#F1DCE3] text-center" data-testid="coming-soon">
        <div className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Coming soon</div>
        <p className="mt-3 font-display text-2xl sm:text-3xl text-[#4A2530]">We're putting the finishing touches on this page.</p>
        <p className="mt-3 text-sm sm:text-base text-[#5C4E52] max-w-xl mx-auto">Community perks, member stories and workshop invites will appear here shortly. In the meantime, say hello on WhatsApp or start an enquiry.</p>
      </div>
    </Reveal>
  </Section>
);

const Siblings = ({ page }) => {
  const others = pagesByGroup(page.group).filter((p) => p.path !== page.path);
  if (!others.length) return null;
  return (
    <Section>
      <div className="flex flex-wrap gap-2" data-testid="sibling-links">
        {others.map((p) => <Link key={p.path} to={p.path} className="inline-flex items-center gap-2 bg-white border border-[#F1DCE3] rounded-full px-4 py-2.5 text-sm text-[#4A2530] hover:border-[#E62E6B] hover:text-[#E62E6B]" data-testid={`sibling-${p.path.slice(1)}`}><MapPin size={14} className="text-[#E62E6B]" /> {p.name}</Link>)}
      </div>
    </Section>
  );
};

const Hero = ({ page, image }) => <PageHero eyebrow={page.eyebrow} title={page.heroHeadline} subtitle={page.heroSub} image={image ?? page.image} ctaTo="/contact" />;

export const SheetPage = () => {
  const { page, pathname } = usePage();
  if (!page) return <Navigate to="/" replace />;
  const content = findBody(pathname.slice(1));
  const hub = headerMenu.find((m) => m.to === pathname && m.children);
  return (
    <PageShell page={page} title={page.name}>
      <div data-testid={`sheet-page-${pathname.slice(1)}`}>
        <Hero page={page} image={content?.image} />
        <SeoIntro page={page} ctaTo={`/contact?service=${encodeURIComponent(content?.service || page.name)}`} />
        {hub ? <ChildCards items={hub.children} /> : page.comingSoon ? <ComingSoon /> : <Body page={content} />}
        {page.group === "Portfolio" && <PortfolioGallery />}
        {!hub && <Siblings page={page} />}
      </div>
    </PageShell>
  );
};

export const ContactPage = () => {
  const { page, pathname } = usePage();
  const { search } = useLocation();
  const service = new URLSearchParams(search).get("service");
  if (service) sessionStorage.setItem("rk_service", service);
  return (
    <PageShell page={page} title="Contact">
      <div data-testid="contact-page">
        <Hero page={page} />
        <SeoIntro page={page} onCta={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} />
        <Contact showBooking={pathname !== BOOKING_PATH} />
      </div>
    </PageShell>
  );
};

export const TestimonialsPage = () => {
  const { page } = usePage();
  return (
    <PageShell page={page} title="Testimonials">
      <div data-testid="testimonials-page">
        <Hero page={page} />
        <SeoIntro page={page} />
        <Testimonials showLink={false} />
      </div>
    </PageShell>
  );
};

export const BlogPage = () => {
  const { page } = usePage();
  return (
    <PageShell page={page} title="Blog">
      <div data-testid="blog-page">
        <Hero page={page} image={null} />
        <SeoIntro page={page} />
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
};

export const LegalPage = () => {
  const { page, pathname } = usePage();
  const key = legalKeyByPath[pathname];
  const doc = legal.find((s) => s.key === key);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  if (!page) return <Navigate to="/privacy" replace />;
  return (
    <PageShell page={page} title={page.name}>
      <div data-testid={`legal-page-${key}`}>
        <Hero page={page} image={null} />
        <SeoIntro page={page} />
        <Section>
          <div className="flex flex-wrap gap-2 mb-8" data-testid="legal-tabs">
            {legalLinks.map((l) => <Link key={l.to} to={l.to} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${l.to === pathname ? "bg-[#E62E6B] border-[#E62E6B] text-white" : "bg-white border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]"}`} data-testid={`legal-tab-${l.to.slice(1)}`}>{l.label}</Link>)}
          </div>
          <article className="bg-white rounded-3xl p-6 sm:p-10 border border-[#F1DCE3]" data-testid={`legal-section-${key}`}>
            {doc
              ? <div className="legal-md text-sm sm:text-base text-[#5C4E52] leading-relaxed"><ReactMarkdown>{doc.md}</ReactMarkdown></div>
              : <p className="text-sm sm:text-base text-[#5C4E52]" data-testid="legal-placeholder">The full {page.name} text is being finalised and will be published here shortly. For any questions in the meantime, please contact us.</p>}
          </article>
        </Section>
      </div>
    </PageShell>
  );
};
