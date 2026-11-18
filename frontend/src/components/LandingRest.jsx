import { useEffect, useState } from "react";
import Marquee from "./Marquee";
import About from "./About";
import WhoWeServe from "./WhoWeServe";
import Services from "./Services";
import Pricing from "./Pricing";
import Areas from "./Areas";
import Portfolio from "./Portfolio";
import Reels from "./Reels";
import Process from "./Process";
import Academy from "./Academy";
import Loyalty from "./Loyalty";
import Testimonials from "./Testimonials";
import Instagram from "./Instagram";
import FAQ from "./FAQ";
import Contact from "./Contact";
import Footer from "./Footer";

const SECTIONS = [Marquee, About, WhoWeServe, Services, Pricing, Areas, Portfolio, Reels, Process, Academy, Loyalty, Testimonials, Instagram, FAQ, Contact, Footer];
const idle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 400 }) : setTimeout(fn, 16));
const cancelIdle = (id) => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : clearTimeout(id));

// Home page sections below the first screen (loaded after the hero; see Landing in App.js).
// They're added a couple at a time so the page never freezes while they render; `all` renders
// everything at once (used when jumping straight to a section).
const LandingRest = ({ all = false }) => {
  const [n, setN] = useState(all ? SECTIONS.length : 2);
  useEffect(() => {
    if (all) { setN(SECTIONS.length); return undefined; }
    if (n >= SECTIONS.length) return undefined;
    const id = idle(() => setN((x) => Math.min(SECTIONS.length, x + 2)));
    return () => cancelIdle(id);
  }, [n, all]);
  return (
    <>
      {SECTIONS.slice(0, n).map((S, i) => <S key={i} />)}
      {n < SECTIONS.length && <div style={{ minHeight: "100vh" }} />}
    </>
  );
};

export default LandingRest;
