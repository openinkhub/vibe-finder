import React, { useEffect, useState } from "react";
import { Phone, MapPin, Instagram, MessageCircle, Check, Loader2, Sparkles, X } from "lucide-react";
import { brand } from "../mock/mock";
import { api, errorText, imgUrl } from "../lib/api";
import { VoiceEnquiry } from "./VoiceEnquiry";
import { BookMeCompact } from "./BookMeCompact";
import { Availability } from "./Availability";
import { Reveal } from "./fx/Reveal";
import { TiltCard } from "./fx/TiltCard";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "Bridal", date: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [look, setLook] = useState(() => sessionStorage.getItem("rk_selected_look") || "");
  const [lookImage, setLookImage] = useState(() => sessionStorage.getItem("rk_selected_look_image") || "");
  const [source, setSource] = useState("form");
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    const sync = () => { setLook(sessionStorage.getItem("rk_selected_look") || ""); setLookImage(sessionStorage.getItem("rk_selected_look_image") || ""); };
    window.addEventListener("focus", sync);
    const id = setInterval(sync, 1500);
    return () => { window.removeEventListener("focus", sync); clearInterval(id); };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await api.post("/enquiries", { ...form, email: form.email || null, date: form.date || null, message: form.message || null, look: look || null, look_image: lookImage || null, source });
      setSent(true);
      setForm({ name: "", email: "", phone: "", service: "Bridal", date: "", message: "" });
      sessionStorage.removeItem("rk_selected_look");
      sessionStorage.removeItem("rk_selected_look_image");
      setLook("");
      setLookImage("");
      setSource("form");
      setTimeout(() => setSent(false), 8000);
    } catch (err) {
      setError(errorText(err, "Couldn't send your enquiry — please try again or WhatsApp us."));
    } finally {
      setSending(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] text-base focus:outline-none focus:border-[#E62E6B] focus:ring-2 focus:ring-[#E62E6B]/15 transition-all";
  const contactRow = "flex items-center gap-4 group";
  const iconBox = "w-12 h-12 rounded-2xl bg-[#FBE9F0] flex items-center justify-center text-[#E62E6B] group-hover:bg-[#E62E6B] group-hover:text-white transition-colors";

  return (
    <section id="contact" className="relative bg-[#F4F1EA] py-20 md:py-32 scroll-mt-20" data-testid="contact-section">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-12">
        <Reveal className="min-w-0">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Get in touch</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 sm:mt-5">Let's talk about your date</h2>
          <p className="mt-5 sm:mt-6 text-sm sm:text-base text-[#5C4E52] leading-relaxed max-w-md">Tell us the event, the city and the vibe — we'll come back with availability and a package that fits. Consultation is always free, and there's no visit charge for party, event or wedding bookings.</p>

          <div className="mt-8 sm:mt-9 space-y-5">
            <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className={contactRow} data-testid="contact-phone-link">
              <span className={iconBox}><Phone size={20} /></span>
              <div><div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">Phone</div><div className="text-[#4A2530] group-hover:text-[#E62E6B] transition-colors">{brand.phone}</div></div>
            </a>
            <div className={contactRow}>
              <span className={iconBox}><MapPin size={20} /></span>
              <div><div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">Studio</div><div className="text-[#4A2530]">{brand.location}</div></div>
            </div>
            <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className={contactRow} data-testid="contact-instagram-link">
              <span className={iconBox}><Instagram size={20} /></span>
              <div><div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">Instagram</div><div className="text-[#4A2530] group-hover:text-[#E62E6B] transition-colors break-all">{brand.instagram}</div></div>
            </a>
          </div>

          <div className="mt-8 sm:mt-9 flex flex-wrap gap-3">
            <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-white font-medium hover:bg-[#1eb959] hover:-translate-y-0.5 transition-all" data-testid="contact-whatsapp-btn"><MessageCircle size={18} /> Chat on WhatsApp</a>
            <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#E62E6B] text-[#E62E6B] font-medium hover:bg-[#E62E6B] hover:text-white transition-colors" data-testid="contact-call-btn"><Phone size={18} /> Call now</a>
          </div>

          <div className="mt-8 sm:mt-9 space-y-5">
            <BookMeCompact onBook={() => document.querySelector('[data-testid="contact-name-input"]')?.focus()} />
            <Availability />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="min-w-0">
          <TiltCard max={3} lift={false} glare={false} className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-[#F1DCE3] shadow-[0_30px_80px_-40px_rgba(230,46,107,0.45)]">
            {sent && <div className="mb-5 flex items-center gap-2 bg-[#EAF7EF] text-[#1c7a45] px-4 py-3 rounded-xl text-sm" data-testid="contact-success"><Check size={16} /> Thank you! Your enquiry has been received. We'll reach out shortly.</div>}
            {error && <div className="mb-5 flex items-center gap-2 bg-[#FBE9F0] text-[#C81F57] px-4 py-3 rounded-xl text-sm" data-testid="contact-error"><X size={16} /> {error}</div>}
            {look && (
              <div className="mb-5 flex items-center justify-between gap-2 bg-[#FBE9F0] text-[#4A2530] px-4 py-3 rounded-xl text-sm" data-testid="contact-look-chip">
                <span className="flex items-center gap-2">{lookImage ? <img src={imgUrl(lookImage)} alt={look} className="w-10 h-10 rounded-lg object-cover border border-white" data-testid="contact-look-thumb" /> : <Sparkles size={15} className="text-[#E62E6B]" />} Booking look: <span className="font-semibold">{look}</span></span>
                <button type="button" onClick={() => { sessionStorage.removeItem("rk_selected_look"); sessionStorage.removeItem("rk_selected_look_image"); setLook(""); setLookImage(""); }} className="text-[#8B7F82] hover:text-[#E62E6B]" aria-label="Remove look" data-testid="contact-look-remove"><X size={15} /></button>
              </div>
            )}
            <div className="mb-6">
              <VoiceEnquiry onResult={({ fields }) => { setForm((f) => ({ ...f, name: fields.name || f.name, phone: fields.phone || f.phone, email: fields.email || f.email, service: fields.service || f.service, date: fields.date || f.date, message: fields.message || f.message })); setSource("voice"); }} />
            </div>
            <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="block text-sm text-[#5C4E52] mb-2">Name</label><input name="name" value={form.name} onChange={handle} required placeholder="Full name" className={inputCls} data-testid="contact-name-input" /></div>
                <div><label className="block text-sm text-[#5C4E52] mb-2">Email</label><input type="email" name="email" value={form.email} onChange={handle} placeholder="you@email.com" className={inputCls} data-testid="contact-email-input" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="block text-sm text-[#5C4E52] mb-2">Phone</label><input name="phone" value={form.phone} onChange={handle} required placeholder="+91" className={inputCls} data-testid="contact-phone-input" /></div>
                <div><label className="block text-sm text-[#5C4E52] mb-2">Service</label>
                  <select name="service" value={form.service} onChange={handle} className={inputCls} data-testid="contact-service-select">
                    {["Bridal", "Engagement", "Non-Bridal", "Party", "Editorial", "Fashion", "Courses"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-sm text-[#5C4E52] mb-2">Event date</label><input type="date" name="date" value={form.date} onChange={handle} className={inputCls} data-testid="contact-date-input" /></div>
              <div><label className="block text-sm text-[#5C4E52] mb-2">Message</label><textarea name="message" value={form.message} onChange={handle} rows={4} placeholder="Tell us about your event & vision..." className={`${inputCls} resize-none`} data-testid="contact-message-input" /></div>
              <button type="submit" disabled={sending} className="w-full py-4 rounded-full bg-[#E62E6B] text-white font-medium hover:bg-[#C81F57] transition-colors shadow-xl shadow-[#E62E6B]/30 disabled:opacity-60 inline-flex items-center justify-center gap-2" data-testid="contact-submit-btn">{sending && <Loader2 size={16} className="animate-spin" />} {sending ? "Sending…" : "Send Enquiry"}</button>
            </form>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
};

export default Contact;
