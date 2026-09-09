import React, { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Check } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { brand, services } from "../mock/mock";

const Contact = () => {
  const [form, setForm] = useState({ name: "", phone: "", service: "Bridal Makeup", date: "", message: "" });
  const [sent, setSent] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    // Frontend-only mock: persist to localStorage
    const prev = JSON.parse(localStorage.getItem("rk_enquiries") || "[]");
    prev.push({ ...form, at: new Date().toISOString() });
    localStorage.setItem("rk_enquiries", JSON.stringify(prev));
    setSent(true);
    setForm({ name: "", phone: "", service: "Bridal Makeup", date: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's create your"
        accent="perfect look"
        subtitle="Book a free consultation. Share your date and vision, and Rekha will get back to you personally."
      />

      <section className="bg-[#F4F1EA] pb-28">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1fr_1.2fr] gap-10">
          {/* Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-[#E4DBCB]">
              <h3 className="font-display text-2xl font-bold text-[#2B1B20]">Get in touch</h3>
              <div className="mt-6 space-y-5">
                <a href={`tel:${brand.phone.replace(/\s/g,"")}`} className="flex items-center gap-4 group">
                  <span className="w-12 h-12 rounded-2xl bg-[#FBE9F0] flex items-center justify-center text-[#E62E6B]"><Phone size={20} /></span>
                  <div><div className="text-xs uppercase tracking-wider text-[#8B7F82]">Call</div><div className="text-[#2B1B20] group-hover:text-[#E62E6B] transition-colors">{brand.phone}</div></div>
                </a>
                <a href={`mailto:${brand.email}`} className="flex items-center gap-4 group">
                  <span className="w-12 h-12 rounded-2xl bg-[#FBE9F0] flex items-center justify-center text-[#E62E6B]"><Mail size={20} /></span>
                  <div><div className="text-xs uppercase tracking-wider text-[#8B7F82]">Email</div><div className="text-[#2B1B20] group-hover:text-[#E62E6B] transition-colors">{brand.email}</div></div>
                </a>
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-[#FBE9F0] flex items-center justify-center text-[#E62E6B]"><MapPin size={20} /></span>
                  <div><div className="text-xs uppercase tracking-wider text-[#8B7F82]">Studio</div><div className="text-[#2B1B20]">{brand.location}</div></div>
                </div>
              </div>
              <a href={`https://wa.me/${brand.whatsapp.replace(/[^0-9]/g,"")}`} target="_blank" rel="noreferrer" className="mt-7 flex items-center justify-center gap-2 w-full py-4 rounded-full bg-[#25D366] text-white font-medium hover:bg-[#1eb959] transition-colors">
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#E4DBCB]">
            <h3 className="font-display text-2xl font-bold text-[#2B1B20]">Book a free consultation</h3>
            {sent && (
              <div className="mt-5 flex items-center gap-2 bg-[#EAF7EF] text-[#1c7a45] px-4 py-3 rounded-xl text-sm">
                <Check size={16} /> Thank you! Your enquiry has been received. Rekha will reach out shortly.
              </div>
            )}
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-[#5C4E52] mb-2">Your name</label>
                  <input name="name" value={form.name} onChange={handle} required placeholder="Full name" className="w-full px-4 py-3 rounded-xl border border-[#E4DBCB] bg-[#FBFAF7] focus:outline-none focus:border-[#E62E6B] focus:ring-2 focus:ring-[#E62E6B]/15 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-[#5C4E52] mb-2">Phone</label>
                  <input name="phone" value={form.phone} onChange={handle} required placeholder="+91" className="w-full px-4 py-3 rounded-xl border border-[#E4DBCB] bg-[#FBFAF7] focus:outline-none focus:border-[#E62E6B] focus:ring-2 focus:ring-[#E62E6B]/15 transition-all" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-[#5C4E52] mb-2">Service</label>
                  <select name="service" value={form.service} onChange={handle} className="w-full px-4 py-3 rounded-xl border border-[#E4DBCB] bg-[#FBFAF7] focus:outline-none focus:border-[#E62E6B] focus:ring-2 focus:ring-[#E62E6B]/15 transition-all">
                    {services.map((s) => <option key={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#5C4E52] mb-2">Event date</label>
                  <input type="date" name="date" value={form.date} onChange={handle} className="w-full px-4 py-3 rounded-xl border border-[#E4DBCB] bg-[#FBFAF7] focus:outline-none focus:border-[#E62E6B] focus:ring-2 focus:ring-[#E62E6B]/15 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#5C4E52] mb-2">Message</label>
                <textarea name="message" value={form.message} onChange={handle} rows={4} placeholder="Tell us about your event & vision..." className="w-full px-4 py-3 rounded-xl border border-[#E4DBCB] bg-[#FBFAF7] focus:outline-none focus:border-[#E62E6B] focus:ring-2 focus:ring-[#E62E6B]/15 transition-all resize-none" />
              </div>
              <button type="submit" className="w-full py-4 rounded-full text-white font-medium transition-colors" style={{ backgroundColor: "#8A1E3F" }}>
                Send enquiry
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
