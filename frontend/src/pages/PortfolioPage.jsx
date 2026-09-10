import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { api, imgUrl } from "../lib/api";
import { brand, portfolio as fallback } from "../mock/mock";
import { useShowcase } from "../components/lab/LookLab";
import { LAB_LOOKS } from "../components/lab/faceTexture";
import { Reveal } from "../components/fx/Reveal";
import { TiltCard } from "../components/fx/TiltCard";
import Footer from "../components/Footer";

const Stage = ({ progress, index, total, src, name }) => {
  const seg = 1 / total;
  const start = index * seg;
  const opacity = useTransform(progress, [Math.max(0, start - seg * 0.35), start, start + seg * 0.65, Math.min(1, start + seg)], [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0]);
  const scale = useTransform(progress, [start, start + seg], [1.04, 1]);
  return (
    <motion.img src={src} alt={name} style={{ opacity, scale }} className="absolute inset-0 w-full h-full object-cover" draggable={false} data-testid={`morph-stage-${index}`} />
  );
};

const ScrollTransformation = ({ showcase }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const looks = showcase?.looks || [];
  const frames = [{ key: "before", name: "Bare skin", url: showcase?.before || "/sample-face.jpg" }, ...looks.map((l) => ({ ...l, url: imgUrl(l.url) }))];
  const [idx, setIdx] = useState(0);
  useEffect(() => scrollYProgress.on("change", (v) => setIdx(Math.min(frames.length - 1, Math.floor(v * frames.length)))), [scrollYProgress, frames.length]);
  const cur = frames[idx] || frames[0];
  const lab = LAB_LOOKS.find((l) => l.key === cur.key);

  return (
    <section ref={ref} className="relative bg-[#F4F1EA]" style={{ height: `${Math.max(2, frames.length) * 100}vh` }} data-testid="scroll-transformation">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 w-full grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Scroll to transform · {String(idx + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}</span>
            <h1 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-7xl leading-[1.02] mt-4" data-testid="morph-title">{cur.name}</h1>
            <p className="mt-4 text-sm sm:text-base text-[#5C4E52] max-w-md">{idx === 0 ? "Every transformation starts with skin prep — hydrated, primed, ready to hold a twelve-hour look." : `${cur.name} — lips ${lab?.lips || ""}, cheeks ${lab?.blush || ""}, eyes ${lab?.eyes || ""}. Keep scrolling to move through the looks.`}</p>
            <div className="mt-6 flex gap-1.5" aria-hidden>{frames.map((f, i) => <span key={f.key} className={`h-1 rounded-full transition-all duration-500 ${i === idx ? "w-10 bg-[#E62E6B]" : "w-4 bg-[#F4B7CE]"}`} />)}</div>
          </div>
          <div className="order-1 lg:order-2 relative h-[52vh] sm:h-[60vh] lg:h-[78vh] rounded-[28px] overflow-hidden bg-[#FBE9F0] shadow-[0_40px_100px_-40px_rgba(230,46,107,0.5)]">
            {frames.map((f, i) => <Stage key={f.key} progress={scrollYProgress} index={i} total={frames.length} src={f.url} name={f.name} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

const ParallaxGallery = ({ items }) => {
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 }), sy = useSpring(my, { stiffness: 60, damping: 20 });
  useEffect(() => {
    const onMove = (e) => { mx.set(e.clientX / window.innerWidth - 0.5); my.set(e.clientY / window.innerHeight - 0.5); };
    const onTilt = (e) => { if (e.gamma == null) return; mx.set(Math.max(-0.5, Math.min(0.5, e.gamma / 60))); my.set(Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60))); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onTilt, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("deviceorientation", onTilt); };
  }, [mx, my]);
  const depths = [60, 25, 90, 40, 70, 20, 50, 85, 35];
  return (
    <section className="relative bg-[#EBE6DB] py-20 md:py-32 overflow-hidden" data-testid="parallax-gallery">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="max-w-2xl mb-10 md:mb-14">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Parallax gallery</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4">Frames in depth</h2>
          <p className="mt-4 text-sm sm:text-base text-[#5C4E52]">Move your cursor — or tilt your phone — and the contact sheet drifts in layers.</p>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" style={{ perspective: 1400 }}>
          {items.map((p, i) => {
            const d = depths[i % depths.length];
            return <ParallaxItem key={p.id || i} p={p} d={d} sx={sx} sy={sy} i={i} />;
          })}
        </div>
      </div>
    </section>
  );
};

const ParallaxItem = ({ p, d, sx, sy, i }) => {
  const x = useTransform(sx, (v) => v * d);
  const y = useTransform(sy, (v) => v * d);
  const rotateY = useTransform(sx, (v) => v * 10);
  const rotateX = useTransform(sy, (v) => -v * 10);
  return (
    <motion.div style={{ x, y, rotateX, rotateY, z: d }} className={`${i % 3 === 1 ? "md:mt-16" : i % 3 === 2 ? "md:-mt-8" : ""}`} data-testid={`parallax-item-${i}`}>
      <TiltCard max={6} className="rounded-2xl overflow-hidden shadow-[0_30px_70px_-30px_rgba(74,37,48,0.45)]">
        <img src={imgUrl(p.image)} alt={p.caption} loading="lazy" className="w-full h-[220px] sm:h-[280px] md:h-[340px] object-cover" />
        <div className="absolute bottom-3 left-3 font-mono text-[10px] text-white bg-[#E62E6B]/90 px-2 py-1 rounded">{p.cat} · {p.caption}</div>
      </TiltCard>
    </motion.div>
  );
};

export default function PortfolioPage() {
  const showcase = useShowcase();
  const [items, setItems] = useState(fallback);
  useEffect(() => { api.get("/content/portfolio").then((r) => { if (r.data?.length) setItems(r.data); }).catch(() => {}); window.scrollTo(0, 0); }, []);
  return (
    <div className="bg-[#F4F1EA]" data-testid="portfolio-page">
      <header className="fixed top-0 inset-x-0 z-50 bg-[#F4F1EA]/90 backdrop-blur-xl border-b border-[#F1DCE3]">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" data-testid="portfolio-back-link"><ArrowLeft size={16} className="text-[#E62E6B]" /><img src={brand.logo} alt="Rekha Krishnamurthy" className="h-9 sm:h-10 w-auto" /></Link>
          <Link to="/#contact" onClick={() => sessionStorage.setItem("rk_scroll_to", "contact")} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E62E6B] text-white text-sm font-medium hover:bg-[#C81F57]" data-testid="portfolio-book-btn">Book now <ArrowUpRight size={15} /></Link>
        </div>
      </header>
      <ScrollTransformation showcase={showcase} />
      <ParallaxGallery items={items} />
      <Footer />
    </div>
  );
}
