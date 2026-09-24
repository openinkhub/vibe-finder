import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { api } from "../lib/api";
import { Reveal } from "./fx/Reveal";

export const useBatches = () => {
  const [map, setMap] = useState({});
  const load = () => api.get("/content/batches").then((r) => setMap(Object.fromEntries(r.data.map((b) => [b.path, b])))).catch(() => {});
  useEffect(() => { load(); }, []);
  return [map, load];
};

export const formatBatchDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export const BatchBanner = ({ page }) => {
  const [map] = useBatches();
  const b = map[page.path];
  if (!b) return null;
  const service = encodeURIComponent(page.enquiryService || page.name);
  return (
    <section className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pb-10 md:pb-14" data-testid="batch-banner">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-[#4A2530] text-white rounded-[24px] px-6 sm:px-8 py-5 sm:py-6 shadow-xl shadow-[#4A2530]/20">
          <div className="w-12 h-12 rounded-full bg-[#E62E6B] flex items-center justify-center shrink-0"><CalendarDays size={20} /></div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#F4B7CE]">Next batch</div>
            <div className="font-display text-xl sm:text-2xl mt-1" data-testid="batch-date">Next batch starts {formatBatchDate(b.date)}</div>
            {b.note && <div className="text-sm text-white/80 mt-1" data-testid="batch-note">{b.note}</div>}
          </div>
          <Link to={`/contact?service=${service}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E62E6B] text-white font-medium hover:bg-[#C81F57] transition-colors shrink-0" data-testid="batch-cta">Reserve your seat <ArrowUpRight size={16} /></Link>
        </div>
      </Reveal>
    </section>
  );
};
