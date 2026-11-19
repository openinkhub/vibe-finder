import React, { useState } from "react";
import { CalendarCheck, GraduationCap, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { api, errorText } from "../lib/api";
import { FaWhatsapp } from "react-icons/fa6";
import { enquiryMessage, openWhatsApp, waLink, PHONE_PATTERN } from "../lib/whatsapp";
import { enquiryServiceFor } from "../lib/pages";
import { Reveal } from "./fx/Reveal";

export const BookingPanel = ({ page }) => {
  const isCourse = page.group === "Academy";
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const [waText, setWaText] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const text = enquiryMessage(isCourse ? `I'd like a seat in ${enquiryServiceFor(page)}.` : `I'd like to check availability for ${enquiryServiceFor(page)}.`, [["Name", form.name], ["Mobile", form.phone], ["Email", form.email], ["Message", form.message]]);
    setWaText(text);
    openWhatsApp(text);
    setSending(true);
    try {
      await api.post("/enquiries", { ...form, email: form.email || null, message: form.message || null, service: enquiryServiceFor(page), source: "form" });
      setSent(true);
      setForm({ name: "", phone: "", email: "", message: "" });
      toast.success(isCourse ? "You're on the list — we'll be in touch about your seat!" : "Got it — we'll confirm availability shortly!");
      setTimeout(() => setSent(false), 30000);
    } catch (err) { toast.error(errorText(err)); } finally { setSending(false); }
  };

  const inputCls = isCourse
    ? "w-full px-4 py-3 rounded-xl border border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#E62E6B] text-sm transition-colors"
    : "w-full px-4 py-3 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] focus:outline-none focus:border-[#E62E6B] text-sm transition-colors";

  return (
    <section className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pb-14 md:pb-20" data-testid={`booking-panel-${isCourse ? "course" : "service"}`}>
      <Reveal>
        <div className={`rounded-[28px] p-6 sm:p-10 grid md:grid-cols-[1fr_1.1fr] gap-8 items-center ${isCourse ? "bg-[#4A2530] text-white" : "bg-white border border-[#F1DCE3] shadow-[0_30px_80px_-40px_rgba(230,46,107,0.35)]"}`}>
          <div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isCourse ? "bg-[#E62E6B]" : "bg-[#FBE9F0] text-[#E62E6B]"}`}>{isCourse ? <GraduationCap size={20} /> : <CalendarCheck size={20} />}</div>
            <div className={`font-mono text-[10px] tracking-[0.24em] uppercase ${isCourse ? "text-[#F4B7CE]" : "text-[#E62E6B]"}`}>{isCourse ? "Reserve your seat" : "Check availability"}</div>
            <h3 className={`font-display text-2xl sm:text-3xl mt-2 ${isCourse ? "text-white" : "text-[#4A2530]"}`}>{isCourse ? `Save your spot in ${page.name}` : `Ready to book ${page.name.toLowerCase()} makeup?`}</h3>
            <p className={`text-sm mt-3 ${isCourse ? "text-white/75" : "text-[#5C4E52]"}`}>{isCourse ? "Each batch has only a few seats. Leave your details and we'll hold a spot while you decide." : "Share your details and we'll confirm your date across Bangalore."}</p>
          </div>
          <form onSubmit={submit} className="space-y-3" data-testid="booking-panel-form">
            {sent && <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${isCourse ? "bg-white/10 text-white" : "bg-[#EAF7EF] text-[#1c7a45]"}`} data-testid="booking-panel-success"><Check size={16} className="shrink-0" /> <span className="flex-1">Thanks! We'll be in touch shortly.</span>{waText && <a href={waLink(waText)} target="_blank" rel="noreferrer" className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-medium"><FaWhatsapp size={14} /> Send on WhatsApp</a>}</div>}
            <div className="grid sm:grid-cols-2 gap-3">
              <input name="name" required placeholder="Full name" value={form.name} onChange={handle} className={inputCls} data-testid="booking-panel-name-input" />
              <input name="phone" required pattern={PHONE_PATTERN} type="tel" inputMode="tel" autoComplete="tel" title="Enter a 10-digit mobile number" placeholder="Mobile / WhatsApp number *" value={form.phone} onChange={handle} className={inputCls} data-testid="booking-panel-phone-input" />
            </div>
            <input type="email" name="email" placeholder="Email (optional)" value={form.email} onChange={handle} className={inputCls} data-testid="booking-panel-email-input" />
            <textarea name="message" rows={2} placeholder={isCourse ? "Any questions about the batch?" : "Tell us about your event (optional)"} value={form.message} onChange={handle} className={`${inputCls} resize-none`} data-testid="booking-panel-message-input" />
            <button type="submit" disabled={sending} className="w-full py-3.5 rounded-full font-medium transition-colors inline-flex items-center justify-center gap-2 bg-[#D6245F] text-white hover:bg-[#C81F57]" data-testid="booking-panel-submit-btn">
              {sending && <Loader2 size={16} className="animate-spin" />} {sending ? "Sending…" : isCourse ? "Reserve My Seat" : "Check My Availability"}
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  );
};
