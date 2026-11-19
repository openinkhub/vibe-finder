import React, { useEffect, useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Check, ArrowUpRight, MapPin } from "lucide-react";
import { PageShell, PageHero, AuthorBio } from "../components/PageShell";
import { SeoIntro } from "../components/SeoIntro";
import { Reveal } from "../components/fx/Reveal";
import { TiltCard } from "../components/fx/TiltCard";
import Contact from "../components/Contact";
import Testimonials from "../components/Testimonials";
import { servicePages, locationPages, staticPages, legalLinks } from "../content/site";
import { getPage, pagesByGroup, headerMenu, legalKeyByPath, BOOKING_PATH, enquiryServiceFor } from "../lib/pages";
import { BatchBanner } from "../components/BatchBanner";
import { PortfolioGallery } from "./PortfolioPage";
import { RichBody, Block, bold } from "../components/RichBody";
import { communityFaq } from "../content/bodies/shared";
import { usePageBody } from "../lib/pageBody";
import { BrochureCta } from "../components/BrochureCta";
import { BookingPanel } from "../components/BookingPanel";
import { usePageImages, heroImage, heroImageAlt } from "../hooks/usePageImages";
import legal from "../content/legal.json";
import { api, imgUrl } from "../lib/api";

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

const ChildCards = ({ items }) => {
  const map = usePageImages();
  return (
  <Section>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="child-cards">
      {items.map((c, i) => (
        <Reveal key={c.path} delay={i * 0.06}>
          <Link to={c.path} data-testid={`child-card-${c.path.slice(1)}`}>
            <TiltCard className="bg-white rounded-3xl overflow-hidden border border-[#F1DCE3] h-full hover:border-[#E62E6B] transition-colors">
              <img src={heroImage(c, map)} alt={heroImageAlt(c, map)} className="w-full h-44 object-cover" />
              <div className="p-6">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#E62E6B]">{c.eyebrow}</div>
                <h3 className="font-display text-xl text-[#4A2530] mt-2">{c.name}</h3>
                <p className="text-sm text-[#5C4E52] mt-2">{c.heroSub}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-[#E62E6B]">{c.heroHeadline} <ArrowUpRight size={14} /></span>
              </div>
            </TiltCard>
          </Link>
        </Reveal>
      ))}
    </div>
  </Section>
  );
};

const ComingSoon = ({ faq }) => (
  <Section>
    <Reveal>
      <div className="bg-[#FBE9F0] rounded-3xl p-8 sm:p-12 border border-[#F1DCE3] text-center" data-testid="coming-soon">
        <div className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Coming soon</div>
        <p className="mt-3 font-display text-2xl sm:text-3xl text-[#4A2530]">We're putting the finishing touches on this page.</p>
        <p className="mt-3 text-sm sm:text-base text-[#5C4E52] max-w-xl mx-auto">Community perks, member stories and workshop invites will appear here shortly. In the meantime, say hello on WhatsApp or start an enquiry.</p>
      </div>
    </Reveal>
    {faq && (
      <Reveal delay={0.1}>
        <div className="mt-8" data-testid="community-faq">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E62E6B] mb-4">Good to know</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {faq.map(([q, a]) => (
              <div key={q} className="bg-white rounded-2xl border border-[#F1DCE3] p-5">
                <div className="font-display text-base text-[#4A2530]">{q}</div>
                <p className="text-sm text-[#5C4E52] mt-1">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    )}
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

const Hero = ({ page, image, cta, onCta }) => {
  const map = usePageImages();
  const resolved = heroImage(page, map);
  const alt = heroImageAlt(page, map);
  return <PageHero eyebrow={page.eyebrow} title={page.heroHeadline} subtitle={page.heroSub} image={image === null ? null : image ?? resolved} imageAlt={alt} cta={cta ?? page.heroCta} ctaTo={`/contact?service=${encodeURIComponent(enquiryServiceFor(page))}`} onCta={onCta} />;
};

export const SheetPage = () => {
  const { page, pathname } = usePage();
  const body = usePageBody(pathname);
  if (!page) return <Navigate to="/" replace />;
  const content = findBody(pathname.slice(1));
  const hub = headerMenu.find((m) => m.to === pathname && m.children);
  return (
    <PageShell page={page} title={page.name} faq={body?.faq}>
      <div data-testid={`sheet-page-${pathname.slice(1)}`}>
        <Hero page={page} />
        {page.group === "Academy" && <BatchBanner page={page} />}
        <SeoIntro page={page} ctaTo={`/contact?service=${encodeURIComponent(enquiryServiceFor(page))}`} />
        {hub ? <ChildCards items={hub.children} /> : body ? <RichBody body={body} /> : body === undefined ? <div className="min-h-[60vh]" /> : page.comingSoon ? <ComingSoon faq={pathname === "/community" ? communityFaq : undefined} /> : <Body page={content} />}
        {page.group === "Portfolio" && <PortfolioGallery />}
        {!hub && (page.group === "Services" || page.group === "Academy") && (<><BrochureCta page={page} /><BookingPanel page={page} /></>)}
        {!hub && <Siblings page={page} />}
      </div>
    </PageShell>
  );
};

export const ContactPage = () => {
  const { page, pathname } = usePage();
  const { search } = useLocation();
  const service = new URLSearchParams(search).get("service");
  const body = usePageBody(pathname);
  if (service) sessionStorage.setItem("rk_service", service);
  return (
    <PageShell page={page} title="Contact" faq={body?.faq}>
      <div data-testid="contact-page">
        <Hero page={page} cta="Jump to Enquiry Form" onCta={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} />
        <SeoIntro page={page} onCta={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} />
        {body && <RichBody body={body} />}
        <Contact showBooking={pathname !== BOOKING_PATH} requireTerms={pathname === BOOKING_PATH} />
      </div>
    </PageShell>
  );
};

export const TestimonialsPage = () => {
  const { page } = usePage();
  const { pathname } = useLocation();
  const body = usePageBody(pathname);
  return (
    <PageShell page={page} title="Testimonials">
      <div data-testid="testimonials-page">
        <Hero page={page} />
        <SeoIntro page={page} />
        {body && <RichBody body={body} />}
        <Testimonials showLink={false} />
      </div>
    </PageShell>
  );
};


const GuideCards = ({ items, testid = "guide-cards" }) => {
  const map = usePageImages();
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid={testid}>
      {items.map((g, i) => (
        <Reveal key={g.path} delay={i * 0.05}>
          <Link to={g.path} className="block h-full" data-testid={`guide-card-${g.path.slice(1)}`}>
            <TiltCard className="bg-white rounded-3xl overflow-hidden border border-[#F1DCE3] h-full hover:border-[#E62E6B] transition-colors">
              <img src={heroImage(g, map)} alt={heroImageAlt(g, map)} loading="lazy" width="600" height="300" className="w-full h-40 object-cover" />
              <div className="p-5"><div className="font-mono text-[10px] uppercase tracking-wider text-[#E62E6B]">{g.eyebrow}</div><h3 className="font-display text-lg text-[#4A2530] mt-2 leading-snug">{g.h1}</h3></div>
            </TiltCard>
          </Link>
        </Reveal>
      ))}
    </div>
  );
};

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); } catch { return d; } };

// Blog-style guide: an article written for the search term in its URL, pointing readers
// to the bridal makeup service, the home page and the self-grooming classes.
export const GuidePage = () => {
  const { page, pathname } = usePage();
  const body = usePageBody(pathname);
  const map = usePageImages();
  if (!page) return <Navigate to="/" replace />;
  const all = pagesByGroup("Guides");
  const at = all.findIndex((g) => g.path === pathname);
  const related = [1, 2, 3].map((k) => all[(at + k) % all.length]).filter((g) => g && g.path !== pathname);
  const words = body ? JSON.stringify(body).split(/\s+/).length : 0;
  const link = "inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors";
  return (
    <PageShell page={page} title={page.name} faq={body?.faq}>
      <article className="max-w-3xl mx-auto px-5 sm:px-6 pb-14" data-testid="guide-article">
        <nav className="text-xs text-[#8B7F82] flex flex-wrap gap-1.5" aria-label="Breadcrumb"><Link to="/" className="hover:text-[#E62E6B]">Home</Link><span>›</span><Link to="/blog" className="hover:text-[#E62E6B]">Guides</Link></nav>
        <span className="block mt-6 font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">{page.eyebrow}</span>
        <h1 className="font-display text-[#4A2530] text-3xl sm:text-5xl leading-[1.08] mt-3" data-testid="guide-h1">{page.h1}</h1>
        <p className="mt-5 text-base sm:text-lg text-[#5C4E52] leading-relaxed">{bold(page.heroSub)}</p>
        <div className="mt-5 text-xs text-[#8B7F82] font-mono uppercase tracking-wider">By <Link to="/about-us" className="text-[#4A2530] hover:text-[#E62E6B]">Rekha Krishnamurthy</Link> · {fmtDate(page.date)}{words ? ` · ${Math.max(3, Math.round(words / 200))} min read` : ""}</div>
        <img src={heroImage(page, map)} alt={heroImageAlt(page, map)} width="1000" height="560" className="mt-8 w-full h-[240px] sm:h-[380px] object-cover rounded-[24px]" />
        {body ? (
          <div className="mt-10 space-y-12" data-testid="guide-body">{body.sections.map((s2, i) => <Block key={s2.h} s={s2} i={i} />)}</div>
        ) : <div className="min-h-[60vh]" />}
        {body?.faq && (
          <section className="mt-12" data-testid="guide-faq">
            <h2 className="font-display text-2xl sm:text-3xl text-[#4A2530]">Frequently asked questions</h2>
            <div className="mt-5 space-y-3">{body.faq.map(([q, a]) => <div key={q} className="bg-white rounded-2xl border border-[#F1DCE3] px-5 py-4"><h3 className="font-display text-base sm:text-lg text-[#4A2530]">{q}</h3><p className="text-sm text-[#5C4E52] mt-2 leading-relaxed">{a}</p></div>)}</div>
          </section>
        )}
        <div className="mt-12 bg-[#FBE9F0] rounded-3xl p-6 sm:p-8 border border-[#F1DCE3]" data-testid="guide-cta">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E62E6B]">Work with Rekha</div>
          <p className="mt-2 font-display text-2xl text-[#4A2530]">Bridal makeup and self-grooming classes in Bangalore</p>
          <p className="mt-2 text-sm text-[#5C4E52]">Plan your wedding look with a personal consultation, or learn to do your own makeup in a small-batch self-grooming class.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/" className={`${link} bg-[#E62E6B] text-white hover:bg-[#C81F57]`}>Bridal Makeup in Bangalore <ArrowUpRight size={16} /></Link>
            <Link to="/self-grooming-classes" className={`${link} border border-[#E62E6B] text-[#E62E6B] hover:bg-[#E62E6B] hover:text-white`}>Self-Grooming Classes <ArrowUpRight size={16} /></Link>
          </div>
        </div>
        <div className="mt-10"><AuthorBio /></div>
      </article>
      {related.length > 0 && (
        <Section>
          <h2 className="font-display text-2xl sm:text-3xl text-[#4A2530] mb-6">More bridal makeup guides</h2>
          <GuideCards items={related} testid="guide-related" />
        </Section>
      )}
    </PageShell>
  );
};

export const BlogPage = () => {
  const { page } = usePage();
  const [posts, setPosts] = useState([]);
  useEffect(() => { api.get("/blog").then((r) => setPosts(r.data)).catch(() => setPosts([])); }, []);
  return (
    <PageShell page={page} title="Blog">
      <div data-testid="blog-page">
        <Hero page={page} image={null} />
        <SeoIntro page={page} />
        <Section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link to={`/blog/${p.slug}`} data-testid={`blog-card-${i}`}>
                  <TiltCard className="bg-white rounded-3xl overflow-hidden border border-[#F1DCE3] h-full">
                    <img src={imgUrl(p.featured_image)} alt={p.alt_text || p.title} className="w-full h-48 object-cover" />
                    <div className="p-6"><div className="font-mono text-[10px] uppercase tracking-wider text-[#E62E6B]">{p.category} · {p.publish_date}</div><h3 className="font-display text-xl text-[#4A2530] mt-2">{p.title}</h3><p className="text-sm text-[#5C4E52] mt-2">{p.excerpt}</p><span className="mt-4 inline-flex items-center gap-1 text-sm text-[#E62E6B]">Read more <ArrowUpRight size={14} /></span></div>
                  </TiltCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>
        {pagesByGroup("Guides").length > 0 && (
          <Section>
            <h2 className="font-display text-3xl sm:text-4xl text-[#4A2530] mb-6">Bridal makeup &amp; self-grooming guides</h2>
            <GuideCards items={pagesByGroup("Guides")} />
          </Section>
        )}
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
