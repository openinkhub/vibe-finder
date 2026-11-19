import React from "react";
import { MapPin } from "lucide-react";
import { motion } from "@/lib/motion";
import { Link } from "react-router-dom";
import { pagesByGroup } from "../lib/pages";
import { Reveal } from "./fx/Reveal";

const Row = ({ title, items, testid }) => (
  <div data-testid={testid}>
    <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#6E6266] mb-3">{title}</div>
    <div className="flex flex-wrap gap-2.5 sm:gap-3" style={{ perspective: 800 }}>
      {items.map((a, i) => (
        <motion.div
          key={a.path}
          initial={{ opacity: 0, rotateX: -40, y: 20 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, rotateX: 8, scale: 1.04 }}
        >
          <Link to={a.path} className="inline-flex items-center gap-2 bg-[#F4F1EA] border border-[#F1DCE3] rounded-full px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base text-[#4A2530] font-medium hover:border-[#E62E6B] hover:text-[#E62E6B] hover:bg-white transition-colors shadow-sm" data-testid={`area-chip-${a.path.slice(1)}`}>
            <MapPin size={16} className="text-[#E62E6B]" /> {a.name}
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);

const Areas = () => (
  <section className="relative bg-[#EBE6DB] py-16 sm:py-20 md:py-24" data-testid="areas-section">
    <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 grid lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 items-center">
      <Reveal>
        <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Best service, near you</span>
        <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Best Makeup Artist in Bangalore, Wherever You Are</h2>
        <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5C4E52] max-w-md">Looking for a makeup artist near me? Rekha covers all of Bangalore, with a home base close to South Bangalore's wedding halls and studios, and travels across Karnataka.</p>
      </Reveal>
      <div className="space-y-7">
        <Row title="Service Area" items={pagesByGroup("Service area")} testid="areas-service-area" />
        <Row title="Service Location" items={pagesByGroup("Service Location")} testid="areas-service-location" />
      </div>
    </div>
  </section>
);

export default Areas;
