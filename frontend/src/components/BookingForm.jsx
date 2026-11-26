import React, { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { FaWhatsapp } from "react-icons/fa6";
import { api, errorText } from "../lib/api";
import { enquiryMessage, openWhatsApp, waLink, PHONE_PATTERN } from "../lib/whatsapp";

// The booking / enquiry form used on service and Academy pages and in the pop-up.
// isCourse → Academy enquiry wording; dark → the plum Academy colour scheme.
export const BookingForm = ({ isCourse, service, dark = isCourse, source = "form", autoFocus = false, onSent }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [waText, setWaText] = useState("");
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const label = service || (isCourse ? "the Academy" : "makeup");

  const submit = async (e) => {
    e.preventDefault();
    const text = enquiryMessage(isCourse ? `I'd like a seat in ${label}.` : `I'd like to check availability for ${label}.`, [["Name", form.name], ["Mobile", form.phone], ["Email", form.email], ["Message", form.message]]);
    setWaText(text);
    openWhatsApp(text);
    setSending(true);
    try {
      await api.post("/enquiries", { ...form, email: form.email || null, message: form.message || null, service: service || (isCourse ? "Academy" : "General"), source });
      setSent(true);
      setForm({ name: "", phone: "", email: "", message: "" });
      toast.success(isCourse ? "You're on the list — we'll be in touch about your seat!" : "Got it — we'll confirm availability shortly!");
      if (onSent) onSent();
      setTimeout(() => setSent(false), 30000);
    } catch (err) { toast.error(errorText(err)); } finally { setSending(false); }
  };

  const inputCls = dark
    ? "w-full px-4 py-3 rounded-xl border border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#E62E6B] text-sm transition-colors"
    : "w-full px-4 py-3 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] focus:outline-none focus:border-[#E62E6B] text-sm transition-colors";

  return (
    <form onSubmit={submit} className="space-y-3" data-testid="booking-panel-form">
      {sent && <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${dark ? "bg-white/10 text-white" : "bg-[#EAF7EF] text-[#1c7a45]"}`} data-testid="booking-panel-success"><Check size={16} className="shrink-0" /> <span className="flex-1">Thanks! We'll be in touch shortly.</span>{waText && <a href={waLink(waText)} target="_blank" rel="noreferrer" className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-medium"><FaWhatsapp size={14} /> Send on WhatsApp</a>}</div>}
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="name" required autoFocus={autoFocus} autoComplete="name" placeholder="Full name" aria-label="Full name" value={form.name} onChange={handle} className={inputCls} data-testid="booking-panel-name-input" />
        <input name="phone" required pattern={PHONE_PATTERN} type="tel" inputMode="tel" autoComplete="tel" title="Enter a 10-digit mobile number" placeholder="Mobile / WhatsApp number *" aria-label="Mobile or WhatsApp number" value={form.phone} onChange={handle} className={inputCls} data-testid="booking-panel-phone-input" />
      </div>
      <input type="email" name="email" autoComplete="email" placeholder="Email (optional)" aria-label="Email" value={form.email} onChange={handle} className={inputCls} data-testid="booking-panel-email-input" />
      <textarea name="message" rows={2} placeholder={isCourse ? "Any questions about the batch?" : "Tell us about your event and date (optional)"} aria-label="Message" value={form.message} onChange={handle} className={`${inputCls} resize-none`} data-testid="booking-panel-message-input" />
      <button type="submit" disabled={sending} className="w-full py-3.5 rounded-full font-medium transition-colors inline-flex items-center justify-center gap-2 bg-[#D6245F] text-white hover:bg-[#C81F57]" data-testid="booking-panel-submit-btn">
        {sending && <Loader2 size={16} className="animate-spin" />} {sending ? "Sending…" : isCourse ? "Send My Enquiry" : "Check My Availability"}
      </button>
    </form>
  );
};

export default BookingForm;
