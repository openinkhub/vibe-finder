import React, { useState } from "react";
import { Phone, MapPin, Instagram, MessageCircle, Check } from "lucide-react";
import { brand, services } from "../mock/mock";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "Bridal", date: "", message: "" });
  const [sent, setSent] = useState(false);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const prev = JSON.parse(localStorage.getItem("rk_enquiries") || "[]");
    prev.push({ ...form, at: new Date().toISOString() });
    localStorage.setItem("rk_enquiries", JSON.stringify(prev));
    setSent(true);
    setForm({ name: "", email: "", phone: "", service: "Bridal", date: "", message: "" });
    setTimeout(() => setSent(false), 6000);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#E4DBCB] bg-[#FBFAF7] text-[#2B1B20] focus:outline-none focus:border-[#E62E6B] focus:ring-2 focus:ring-[#E62E6B]/15 transition-all";

  return (
    <section id="contact" className="relative bg-[#F4F1EA] py-24 md:py-32 scroll-mt-20">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1fr_1.2fr] gap-12">
        <div>
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Get in touch</span>
          <h2 className="font-display text-[#4A2530] text-4xl md:text-5xl leading-tight mt-5">Let's talk about your date</h2>
          <p className="mt-6 text-[#5C4E52] leading-relaxed max-w-md">Tell us the event, the city and the vibe — we'll come back with availability and a package that fits. Consultation is always free, and there's no visit charge for party, event or wedding bookings.</p>

          <div className="mt-9 space-y-5">
            <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="flex items-center gap-4 group">
              <span className="w-12 h-12 rounded-2xl bg-[#FBE9F0] flex items-center justify-center text-[#E62E6B]"><Phone size={20} /></span>
              <div><div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">Phone</div><div className="text-[#2B1B20] group-hover:text-[#E62E6B] transition-colors">{brand.phone}</div></div>
            </a>
            <div className="flex items-center gap-4">
              <span className="w-12 h-12 rounded-2xl bg-[#FBE9F0] flex items-center justify-center text-[#E62E6B]"><MapPin size={20} /></span>
              <div><div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">Studio</div><div className="text-[#2B1B20]">{brand.location}</div></div>
            </div>
            <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
              <span className="w-12 h-12 rounded-2xl bg-[#FBE9F0] flex items-center justify-center text-[#E62E6B]"><Instagram size={20} /></span>
              <div><div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">Instagram</div><div className="text-[#2B1B20] group-hover:text-[#E62E6B] transition-colors">{brand.instagram}</div></div>
            </a>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href={brand.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-white font-medium hover:bg-[#1eb959] transition-colors"><MessageCircle size={18} /> Chat on WhatsApp</a>
            <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#CDBFC4] text-[#2B1B20] font-medium hover:bg-white transition-colors"><Phone size={18} /> Call now</a>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#E4DBCB]">
          {sent && <div className="mb-5 flex items-center gap-2 bg-[#EAF7EF] text-[#1c7a45] px-4 py-3 rounded-xl text-sm"><Check size={16} /> Thank you! Your enquiry has been received. We'll reach out shortly.</div>}
          <form onSubmit={submit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="block text-sm text-[#5C4E52] mb-2">Name</label><input name="name" value={form.name} onChange={handle} required placeholder="Full name" className={inputCls} /></div>
              <div><label className="block text-sm text-[#5C4E52] mb-2">Email</label><input type="email" name="email" value={form.email} onChange={handle} placeholder="you@email.com" className={inputCls} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="block text-sm text-[#5C4E52] mb-2">Phone</label><input name="phone" value={form.phone} onChange={handle} required placeholder="+91" className={inputCls} /></div>
              <div><label className="block text-sm text-[#5C4E52] mb-2">Service</label>
                <select name="service" value={form.service} onChange={handle} className={inputCls}>
                  {["Bridal", "Engagement", "Non-Bridal", "Party", "Editorial", "Fashion", "Courses"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-sm text-[#5C4E52] mb-2">Event date</label><input type="date" name="date" value={form.date} onChange={handle} className={inputCls} /></div>
            <div><label className="block text-sm text-[#5C4E52] mb-2">Message</label><textarea name="message" value={form.message} onChange={handle} rows={4} placeholder="Tell us about your event & vision..." className={`${inputCls} resize-none`} /></div>
            <button type="submit" className="w-full py-4 rounded-full bg-[#2B1B20] text-white font-medium hover:bg-[#4A2530] transition-colors">Send Enquiry</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
