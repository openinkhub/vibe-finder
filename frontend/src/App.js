import { Suspense, useEffect, useRef } from "react";
import { scrollToId } from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import WhoWeServe from "./components/WhoWeServe";
import Services from "./components/Services";
import Pricing from "./components/Pricing";
import Areas from "./components/Areas";
import Portfolio from "./components/Portfolio";
import Reels from "./components/Reels";
import Process from "./components/Process";
import Academy from "./components/Academy";
import Loyalty from "./components/Loyalty";
import Testimonials from "./components/Testimonials";
import Instagram from "./components/Instagram";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";
import { MobileBookBar } from "./components/MobileBookBar";
import { SheetPage, ContactPage, TestimonialsPage, BlogPage, LegalPage } from "./pages/ContentPages";
import NotFoundPage from "./pages/NotFoundPage";
import { SeoIntro } from "./components/SeoIntro";
import { useSeo, useJsonLd } from "./components/Seo";
import { allPages, getPage, legalKeyByPath } from "./lib/pages";
import { lazyRoute } from "./lib/lazyRoute";

// Heavier, less-visited routes load as separate chunks.
const Admin = lazyRoute(() => import("./pages/Admin"));
const PortfolioPage = lazyRoute(() => import("./pages/PortfolioPage"));
const LookLabPage = lazyRoute(() => import("./pages/ExperiencePages"), "LookLabPage");
const TryOnPage = lazyRoute(() => import("./pages/ExperiencePages"), "TryOnPage");
const BlogPostPage = lazyRoute(() => import("./pages/BlogPostPage"));

// Called before the first render so the current route's chunk is already in memory.
export const preloadRoute = (path) => {
  const p = path.replace(/\/+$/, "") || "/";
  if (p === "/admin") return Admin.preload();
  if (p === "/portfolio") return PortfolioPage.preload();
  if (p === "/corporate-professional-makeup-services") return LookLabPage.preload();
  if (p === "/book-bridal-makeup-package-karnataka") return TryOnPage.preload();
  if (p.startsWith("/blog/")) return BlogPostPage.preload();
  return Promise.resolve();
};

const Landing = () => {
  const page = getPage("/");
  useSeo(page);
  useJsonLd(page);
  useEffect(() => {
    const target = sessionStorage.getItem("rk_scroll_to") || (window.location.hash ? window.location.hash.slice(1) : "");
    if (target) { sessionStorage.removeItem("rk_scroll_to"); setTimeout(() => scrollToId(target), 400); }
  }, []);
  return (
  <>
    <Navbar />
    <Hero page={page} />
    <SeoIntro page={page} onCta={() => scrollToId("contact")} className="pt-14 md:pt-20" />
    <Marquee />
    <About />
    <WhoWeServe />
    <Services />
    <Pricing />
    <Areas />
    <Portfolio />
    <Reels />
    <Process />
    <Academy />
    <Loyalty />
    <Testimonials />
    <Instagram />
    <FAQ />
    <Contact />
    <Footer />
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
  );
}

export default App;
