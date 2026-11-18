import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { CalendarCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";
import { brand } from "../mock/mock";
import { scrollToId } from "./Navbar";

export const MobileBookBar = () => {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleBook = () => {
    if (pathname === "/") scrollToId("contact");
    else navigate("/contact");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-xl border-t border-[#F1DCE3] px-4 py-3 shadow-[0_-8px_30px_rgba(74,37,48,0.08)]"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
          data-testid="mobile-book-bar"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleBook}
              className="flex-1 py-3.5 rounded-full bg-[#E62E6B] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E62E6B]/35 active:scale-95 transition-transform"
              data-testid="mobile-book-bar-btn"
            >
              <CalendarCheck size={17} />
              Book Free Consultation
            </button>
            <a
              href={brand.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-[#25D366]/30 shrink-0 active:scale-95 transition-transform"
              aria-label="Chat on WhatsApp"
              data-testid="mobile-book-bar-whatsapp"
            >
              <FaWhatsapp size={23} />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
