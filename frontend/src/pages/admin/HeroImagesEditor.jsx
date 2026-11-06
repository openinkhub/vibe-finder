import React, { useRef, useState } from "react";
import { Upload, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { api, errorText } from "../../lib/api";
import { allPages } from "../../lib/pages";
import { usePageImages, heroImage, heroImageAlt, refreshPageImages } from "../../hooks/usePageImages";

const GROUPS = ["Portfolio", "Services", "Academy", "Experience", "Service area", "Service Location", "Explore", "Header"];

const Row = ({ page, map }) => {
  const [busy, setBusy] = useState(false);
  const [alt, setAlt] = useState(() => map[page.path]?.alt_text || "");
  const fileRef = useRef(null);
  const slug = page.path.slice(1);
  const custom = !!map[page.path];
  const upload = async (file) => {
    if (!file) return;
    const fd = new FormData(); fd.append("file", file); fd.append("alt_text", alt);
    setBusy(true);
    try { await api.put(`/content/page-images/${slug}`, fd, { timeout: 120000 }); await refreshPageImages(); toast.success(`${page.name} hero updated — live on its page and the home page`); }
    catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  };
  const reset = async () => {
    setBusy(true);
    try { await api.delete(`/content/page-images/${slug}`); await refreshPageImages(); setAlt(""); toast.success("Reset to default image"); }
    catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  };
  return (
    <div className="bg-white rounded-2xl p-3 border border-[#F1DCE3] flex items-center gap-4" data-testid={`hero-row-${slug}`}>
      <img src={heroImage(page, map)} alt={heroImageAlt(page, map)} className="w-20 h-16 rounded-xl object-cover shrink-0 bg-[#FBE9F0]" data-testid={`hero-img-${slug}`} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[#4A2530] text-sm truncate">{page.name} <span className="text-[#8B7F82] font-normal">· {page.group}</span></div>
        <div className="text-xs text-[#8B7F82] truncate">{page.path}{custom && <span className="ml-2 text-[#E62E6B]">custom</span>}</div>
        <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder={`Alt text, e.g. ${page.name}`} className="mt-1.5 w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#F1DCE3] bg-[#FBFAF7] focus:outline-none focus:border-[#E62E6B]" data-testid={`hero-alt-${slug}`} />
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} data-testid={`hero-file-${slug}`} />
      <button onClick={() => fileRef.current.click()} disabled={busy} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#E62E6B] text-white text-xs font-medium hover:bg-[#C81F57] disabled:opacity-60" data-testid={`hero-upload-${slug}`}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Change</button>
      {custom && <button onClick={reset} disabled={busy} className="w-9 h-9 rounded-full border border-[#F1DCE3] text-[#8B7F82] hover:text-[#E62E6B] flex items-center justify-center" aria-label="Reset" data-testid={`hero-reset-${slug}`}><RotateCcw size={14} /></button>}
    </div>
  );
};

export const HeroImagesEditor = () => {
  const map = usePageImages();
  const [group, setGroup] = useState("Portfolio");
  return (
    <div data-testid="hero-images-editor">
      <p className="text-sm text-[#5C4E52] mb-5">One image per page. Changing a page's hero also updates every card on the home page that links to it (portfolio grid, services rows, cards). Photos are automatically resized and compressed to WebP, and the alt text you set here is used everywhere that image appears.</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {GROUPS.map((g) => <button key={g} onClick={() => setGroup(g)} className={`px-3.5 py-2 rounded-full text-xs font-medium border ${group === g ? "bg-[#4A2530] border-[#4A2530] text-white" : "bg-white border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]"}`} data-testid={`hero-group-${g.toLowerCase().replace(/\s+/g, "-")}`}>{g}</button>)}
      </div>
      <div className="space-y-2">
        {allPages.filter((p) => p.group === group && p.image).map((p) => <Row key={p.path} page={p} map={map} />)}
      </div>
    </div>
  );
};
