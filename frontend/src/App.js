import { Suspense, useEffect, useRef, useState } from "react";
import { scrollToId } from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FloatingButtons from "./components/FloatingButtons";
import { MobileBookBar } from "./components/MobileBookBar";
import NotFoundPage from "./pages/NotFoundPage";
import { SeoIntro } from "./components/SeoIntro";
import { useSeo, useJsonLd } from "./components/Seo";
import { allPages, getPage, legalKeyByPath } from "./lib/pages";
import { lazyRoute } from "./lib/lazyRoute";
import { loadPageBody } from "./lib/pageBody";
import { LazyMotion, domAnimation } from "./lib/motion";

// Heavier, less-visited routes load as separate chunks.
const Admin = lazyRoute(() => import("./pages/Admin"));
const PortfolioPage = lazyRoute(() => import("./pages/PortfolioPage"));
const LookLabPage = lazyRoute(() => import("./pages/ExperiencePages"), "LookLabPage");
const TryOnPage = lazyRoute(() => import("./pages/ExperiencePages"), "TryOnPage");
const BlogPostPage = lazyRoute(() => import("./pages/BlogPostPage"));
const contentPages = () => import("./pages/ContentPages");
const SheetPage = lazyRoute(contentPages, "SheetPage");
const ContactPage = lazyRoute(contentPages, "ContactPage");
const TestimonialsPage = lazyRoute(contentPages, "TestimonialsPage");
const BlogPage = lazyRoute(contentPages, "BlogPage");
const LegalPage = lazyRoute(contentPages, "LegalPage");

// Called before the first render so the current route's chunk is already in memory.
export const preloadRoute = (path) => {
  const p = path.replace(/\/+$/, "") || "/";
  if (p === "/admin") return Admin.preload();
  if (p === "/portfolio") return PortfolioPage.preload();
  if (p === "/corporate-professional-makeup-services") return LookLabPage.preload();
  if (p === "/book-bridal-makeup-package-karnataka") return TryOnPage.preload();
  if (p.startsWith("/blog/")) return BlogPostPage.preload();
  if (p === "/") return Promise.resolve();
  // Every other page (service, academy, legal, contact, blog list) lives in the content-pages chunk.
  return Promise.all([SheetPage.preload(), ContactPage.preload(), TestimonialsPage.preload(), BlogPage.preload(), LegalPage.preload(), loadPageBody(p)]);
};

// The home page's sections below the first screen load as their own chunk, once the browser
// is idle, so the first screen becomes interactive sooner. The HTML already contains them.
const LandingRest = lazyRoute(() => import("./components/LandingRest"));
const whenIdle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300));

const Landing = () => {
  const page = getPage("/");
  useSeo(page);
  useJsonLd(page);
  const [rest, setRest] = useState(false);
  const [jump] = useState(() => !!(sessionStorage.getItem("rk_scroll_to") || window.location.hash || window.scrollY > 200));
  useEffect(() => {
    const show = () => LandingRest.preload().then(() => setRest(true));
    if (jump) show(); else whenIdle(show);
  }, [jump]);
  useEffect(() => {
    if (!rest) return;
    const target = sessionStorage.getItem("rk_scroll_to") || (window.location.hash ? window.location.hash.slice(1) : "");
    if (target) { sessionStorage.removeItem("rk_scroll_to"); setTimeout(() => scrollToId(target), 400); }
  }, [rest]);
  return (
  <>
    <Navbar />
    <Hero page={page} />
    <SeoIntro page={page} onCta={() => scrollToId("contact")} className="pt-14 md:pt-20" />
    {rest ? <LandingRest all={jump} /> : <div style={{ minHeight: "100vh" }} />}
    <FloatingButtons />
    <MobileBookBar />
  </>
  );
};

const special = {
  "/": <Landing />,
  "/portfolio": <PortfolioPage />,
  "/contact": <ContactPage />,
  "/premium-bridal-makeup-booking": <ContactPage />,
  "/testimonials": <TestimonialsPage />,
  "/blog": <BlogPage />,
  "/archive": <BlogPage />,
  "/corporate-professional-makeup-services": <LookLabPage />,
  "/book-bridal-makeup-package-karnataka": <TryOnPage />,
};

const RouteTracker = () => {
  const location = useLocation();
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (window.OpeninkTrack) window.OpeninkTrack("virtual_pageview", { path: location.pathname });
  }, [location.pathname]);
  return null;
};

function App() {
  return (
    <LazyMotion features={domAnimation}>
    <div className="App">
      <BrowserRouter>
        <RouteTracker />
        <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          {allPages.map((p) => <Route key={p.path} path={p.path} element={special[p.path] || (legalKeyByPath[p.path] ? <LegalPage /> : <SheetPage />)} />)}
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/look-lab" element={<Navigate to="/corporate-professional-makeup-services" replace />} />
          <Route path="/try-on" element={<Navigate to="/book-bridal-makeup-package-karnataka" replace />} />
          <Route path="/legal" element={<Navigate to="/privacy" replace />} />
          <Route path="/party-and-non-bridal-makeup-karnatka" element={<Navigate to="/party-and-non-bridal-makeup-karnataka" replace />} />
          <Route path="/hire-celebrirt-makeup-artist-for-wedding" element={<Navigate to="/hire-celebrity-makeup-artist-for-wedding" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
    </LazyMotion>
  );
}

export default App;
