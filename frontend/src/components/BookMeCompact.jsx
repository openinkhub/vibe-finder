import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { Phone, MessageCircle, CalendarCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { brand } from "../mock/mock";

const BookMeCanvas = lazy(() => import("./BookMeCanvas"));

// Flat stand-in shown until the 3D compact has loaded (or while it's off-screen).
const CompactPlaceholder = () => (
  <div className="h-full w-full flex items-center justify-center" aria-hidden="true">
    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#F28FB0] to-[#E62E6B] shadow-[0_20px_40px_rgba(110,44,60,0.25)]" />
  </div>
);

export const BookMeCompact = ({ onBook }) => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const wrap = useRef(null);
  const [show3d, setShow3d] = useState(false);
  // Only fetch the 3D code when the card scrolls near the viewport.
  useEffect(() => {
    const el = wrap.current;
    if (!el || !("IntersectionObserver" in window)) { setShow3d(true); return; }
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { setShow3d(true); io.disconnect(); } }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="relative rounded-[28px] bg-white border border-[#F1DCE3] overflow-hidden" data-testid="bookme-compact">
      <div className="absolute top-4 left-4 z-10 font-mono text-[10px] tracking-[0.2em] uppercase text-[#6E6266]">{open ? "Compact open" : "Tap the compact"}</div>
      <div className={`h-64 sm:h-72 relative overflow-hidden ${hovered ? "cursor-pointer" : ""}`} data-testid="bookme-canvas-wrap" ref={wrap}>
        {show3d ? (
          <Suspense fallback={<CompactPlaceholder />}>
            <BookMeCanvas open={open} setOpen={setOpen} hovered={hovered} setHovered={setHovered} />
          </Suspense>
        ) : <CompactPlaceholder />}
      </div>
      <button onClick={() => setOpen((v) => !v)} className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-[#FBE9F0] text-[#E62E6B] text-xs font-medium" data-testid="bookme-toggle-btn">{open ? "Close" : "Open"}</button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 16, rotateX: -20 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: 10 }} style={{ transformPerspective: 800 }} className="px-5 pb-5 -mt-2" data-testid="bookme-reveal">
            <div className="font-display text-xl text-[#4A2530]">Book me</div>
            <div className="mt-4 grid sm:grid-cols-3 gap-2">
              <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-[#E62E6B] text-[#E62E6B] text-sm font-medium hover:bg-[#D6245F] hover:text-white transition-colors" data-testid="bookme-call"><Phone size={15} /> Call</a>
              <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white text-sm font-medium" data-testid="bookme-whatsapp"><FaWhatsapp size={16} /> WhatsApp</a>
              <button onClick={onBook} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#D6245F] text-white text-sm font-medium hover:bg-[#C81F57]" data-testid="bookme-form"><CalendarCheck size={15} /> Book form</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookMeCompact;
