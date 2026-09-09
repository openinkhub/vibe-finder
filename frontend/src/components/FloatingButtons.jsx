import React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { brand } from "../mock/mock";

const FloatingButtons = () => {
  return (
    <div className="fixed right-5 bottom-6 z-40 flex flex-col gap-3">
      <a
        href={`https://wa.me/${brand.whatsapp.replace(/[^0-9]/g, "")}`}
        target="_blank"
        rel="noreferrer"
        className="w-13 h-13 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform duration-300"
        aria-label="WhatsApp"
      >
        <MessageCircle size={24} />
      </a>
      <a
        href={`tel:${brand.phone.replace(/\s/g, "")}`}
        className="w-13 h-13 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-[#2B1B20] text-white shadow-lg shadow-black/20 hover:scale-110 transition-transform duration-300"
        aria-label="Call"
      >
        <Phone size={22} />
      </a>
    </div>
  );
};

export default FloatingButtons;
