import React from "react";
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

const socials = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
];

const SocialSidebar = () => {
  return (
    <div className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1 bg-white/70 backdrop-blur-sm rounded-r-2xl shadow-md py-4 px-1.5">
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          aria-label={s.label}
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#8A1E3F] hover:bg-[#8A1E3F] hover:text-white transition-all duration-300"
        >
          <s.icon size={18} />
        </a>
      ))}
    </div>
  );
};

export default SocialSidebar;
