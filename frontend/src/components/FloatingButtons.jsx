import React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { brand } from "../mock/mock";

const FloatingButtons = () => {
  return (
    <div className="fixed right-4 sm:right-5 bottom-5 sm:bottom-6 z-40 flex flex-col gap-3" data-testid="floating-buttons">
      <motion.a
        whileHover={{ scale: 1.12, rotateY: 18 }}
        whileTap={{ scale: 0.94 }}
        href={`tel:${brand.phone.replace(/\s/g, "")}`}
        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#E62E6B] text-white shadow-lg shadow-[#E62E6B]/40"
        aria-label="Call"
        data-testid="floating-call-btn"
      >
        <Phone size={20} />
      </motion.a>
      <motion.a
        whileHover={{ scale: 1.12, rotateY: 18 }}
        whileTap={{ scale: 0.94 }}
        href={`https://wa.me/${brand.whatsapp.replace(/[^0-9]/g, "")}`}
        target="_blank"
        rel="noreferrer"
        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30"
        aria-label="WhatsApp"
        data-testid="floating-whatsapp-btn"
      >
        <MessageCircle size={24} />
      </motion.a>
    </div>
  );
};

export default FloatingButtons;
