import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, CalendarCheck, GraduationCap } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { brand } from "../mock/mock";
import { openBooking, isBookingLink } from "../lib/booking";

const BookingForm = lazy(() => import("./BookingForm"));

// One pop-up for every booking / enquiry CTA on the site (see lib/booking.js).
export const BookingModal = () => {
  const [state, setState] = useState(null); // { kind, service }
  const { pathname } = useLocation();
  const panel = useRef(null);
  const lastFocus = useRef(null);

  // Open on request, and turn every "go to /contact" CTA link into a one-click form.
  useEffect(() => {
    const onOpen = (e) => { lastFocus.current = document.activeElement; setState(e.detail); };
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      const hit = isBookingLink(a);
      if (!hit) return;
      e.preventDefault();
      e.stopPropagation();
      const cta = { cta_label: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60), service: hit.service || "", page_path: window.location.pathname };
      if (window.OpeninkTrack) { try { window.OpeninkTrack("cta_click", cta); } catch (err) { /* ignore */ } }
      if (window.rkTrack) window.rkTrack("cta_click", cta);
      openBooking(hit);
    };
    window.addEventListener("rk:book", onOpen);
    document.addEventListener("click", onClick, true);
    return () => { window.removeEventListener("rk:book", onOpen); document.removeEventListener("click", onClick, true); };
  }, []);

  useEffect(() => { setState(null); }, [pathname]);

  const close = () => { setState(null); if (lastFocus.current && lastFocus.current.focus) { try { lastFocus.current.focus(); } catch (e) { /* ignore */ } } };

  useEffect(() => {
    if (!state) return undefined;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [state]);

  if (!state) return null;
  const isCourse = state.kind === "enquiry";
  const service = state.service;
  const title = isCourse ? "Enquire about the next batch" : "Book your makeup date";

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6" data-testid="booking-modal">
      <div className="absolute inset-0 bg-[#2A1219]/60 backdrop-blur-[2px]" onClick={close} aria-hidden="true" />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="booking-modal-title" className={`relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] p-6 sm:p-8 shadow-2xl ${isCourse ? "bg-[#4A2530] text-white" : "bg-white"}`} style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}>
        <button type="button" onClick={close} className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center ${isCourse ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#FBE9F0] text-[#C8215A] hover:bg-[#F6D3E0]"}`} aria-label="Close" data-testid="booking-modal-close"><X size={18} /></button>
        <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${isCourse ? "bg-[#E62E6B]" : "bg-[#FBE9F0] text-[#C8215A]"}`}>{isCourse ? <GraduationCap size={19} /> : <CalendarCheck size={19} />}</div>
        <div className={`font-mono text-[10px] tracking-[0.24em] uppercase ${isCourse ? "text-[#F4B7CE]" : "text-[#C8215A]"}`} data-testid="booking-modal-kind">{isCourse ? "Academy enquiry" : "Booking"}</div>
        <h2 id="booking-modal-title" className={`font-display text-2xl sm:text-3xl mt-1.5 pr-10 ${isCourse ? "text-white" : "text-[#4A2530]"}`}>{title}</h2>
        {service && <div className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-medium ${isCourse ? "bg-white/10 text-[#F4B7CE]" : "bg-[#FBE9F0] text-[#C8215A]"}`} data-testid="booking-modal-service">{service}</div>}
        <p className={`text-sm mt-3 mb-5 ${isCourse ? "text-white/75" : "text-[#5C4E52]"}`}>{isCourse ? "Leave your details and Rekha will share the next batch dates, fees and seats." : "Share your details and date. Rekha will confirm availability across Bangalore."}</p>
        <Suspense fallback={<div className="h-56" />}>
          <BookingForm isCourse={isCourse} service={service} source="popup" autoFocus />
        </Suspense>
        <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className={`mt-4 inline-flex items-center gap-2 text-sm font-medium ${isCourse ? "text-white/85 hover:text-white" : "text-[#1c7a45] hover:text-[#25D366]"}`} data-testid="booking-modal-whatsapp"><FaWhatsapp size={16} /> Prefer WhatsApp? Chat with Rekha</a>
      </div>
    </div>
  );
};

export default BookingModal;
