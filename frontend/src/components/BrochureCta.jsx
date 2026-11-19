import React, { useState } from "react";
import { FileText, Download, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, errorText } from "../lib/api";
import { enquiryMessage, openWhatsApp, PHONE_PATTERN } from "../lib/whatsapp";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Reveal } from "./fx/Reveal";

export const BrochureCta = ({ page }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState("download");
  const [busy, setBusy] = useState(false);
  const isCourse = page.group === "Academy";

  const submit = async (e) => {
    e.preventDefault();
    openWhatsApp(enquiryMessage(`I've requested the ${page.name} brochure.`, [["Name", name], ["Mobile", phone], ["Email", email]]));
    setBusy(true);
    try {
      if (mode === "download") {
        const res = await api.post("/brochure/request", { path: page.path, name: name || null, phone, email, mode }, { responseType: "blob" });
        const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
        const a = document.createElement("a");
        a.href = url; a.download = `${page.name.replace(/\s+/g, "-")}-Brochure.pdf`; document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
        toast.success("Brochure downloaded!");
      } else {
        await api.post("/brochure/request", { path: page.path, name: name || null, phone, email, mode });
        toast.success("Brochure sent to your email!");
      }
      setOpen(false); setEmail(""); setName(""); setPhone("");
    } catch (err) { toast.error(errorText(err)); } finally { setBusy(false); }
  };

  return (
    <section className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pb-10 md:pb-14" data-testid="brochure-cta-section">
      <Reveal>
        <div className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-[24px] px-6 sm:px-8 py-6 sm:py-7 border ${isCourse ? "bg-[#4A2530] text-white border-transparent" : "bg-white border-[#F1DCE3]"}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isCourse ? "bg-[#D6245F] text-white" : "bg-[#FBE9F0] text-[#E62E6B]"}`}><FileText size={20} /></div>
          <div className="flex-1 min-w-0">
            <div className={`font-mono text-[10px] tracking-[0.24em] uppercase ${isCourse ? "text-[#F4B7CE]" : "text-[#E62E6B]"}`}>{isCourse ? "Course brochure" : "Service brochure"}</div>
            <div className={`font-display text-xl sm:text-2xl mt-1 ${isCourse ? "text-white" : "text-[#4A2530]"}`}>Get the full {page.name} brochure</div>
            <div className={`text-sm mt-1 ${isCourse ? "text-white/80" : "text-[#5C4E52]"}`}>Highlights, details & fees — as a PDF, downloaded now or emailed to you.</div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D6245F] text-white font-medium hover:bg-[#C81F57] transition-colors shrink-0" data-testid="brochure-open-btn"><Download size={16} /> Get brochure</button>
            </DialogTrigger>
            <DialogContent data-testid="brochure-dialog">
              <DialogHeader>
                <DialogTitle>Get the {page.name} brochure</DialogTitle>
                <DialogDescription>Enter your mobile number and email — download it now, or have it sent to your inbox.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label htmlFor="brochure-name">Name (optional)</Label>
                  <input id="brochure-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-[#F1DCE3] focus:outline-none focus:border-[#E62E6B]" data-testid="brochure-name-input" />
                </div>
                <div>
                  <Label htmlFor="brochure-phone">Mobile number *</Label>
                  <input id="brochure-phone" type="tel" inputMode="tel" autoComplete="tel" required pattern={PHONE_PATTERN} title="Enter a 10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98XXX XXXXX" className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-[#F1DCE3] focus:outline-none focus:border-[#E62E6B]" data-testid="brochure-phone-input" />
                </div>
                <div>
                  <Label htmlFor="brochure-email">Email</Label>
                  <input id="brochure-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-[#F1DCE3] focus:outline-none focus:border-[#E62E6B]" data-testid="brochure-email-input" />
                </div>
                <RadioGroup value={mode} onValueChange={setMode} className="grid grid-cols-1 gap-2" data-testid="brochure-mode-group">
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${mode === "download" ? "border-[#E62E6B] bg-[#FBE9F0]" : "border-[#F1DCE3]"}`}>
                    <RadioGroupItem value="download" id="mode-download" data-testid="brochure-mode-download" /> <Download size={15} className="text-[#E62E6B]" /> Download PDF now
                  </label>
                  <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${mode === "email" ? "border-[#E62E6B] bg-[#FBE9F0]" : "border-[#F1DCE3]"}`}>
                    <RadioGroupItem value="email" id="mode-email" data-testid="brochure-mode-email" /> <Mail size={15} className="text-[#E62E6B]" /> Email it to me instead
                  </label>
                </RadioGroup>
                <button type="submit" disabled={busy} className="w-full py-3 rounded-full bg-[#D6245F] text-white font-medium hover:bg-[#C81F57] disabled:opacity-60 inline-flex items-center justify-center gap-2" data-testid="brochure-submit-btn">
                  {busy && <Loader2 size={16} className="animate-spin" />} {busy ? "Please wait…" : "Get Brochure"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Reveal>
    </section>
  );
};
