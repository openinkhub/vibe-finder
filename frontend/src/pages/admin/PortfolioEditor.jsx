import React, { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Loader2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { api, errorText, imgUrl } from "../../lib/api";
import { portfolioFilters } from "../../mock/mock";

const CATS = portfolioFilters.filter((f) => f !== "All Frames");
const inputCls = "px-3 py-2 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] text-sm focus:outline-none focus:border-[#E62E6B]";

export const PortfolioEditor = () => {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("Bridal");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [edit, setEdit] = useState({});
  const fileRef = useRef(null);

  const load = () => api.get("/content/portfolio").then((r) => setItems(r.data)).catch((e) => toast.error(errorText(e)));
  useEffect(() => { load(); }, []);

  const pick = (f) => { setFile(f || null); setPreview(f ? URL.createObjectURL(f) : null); };

  const upload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Choose a photo first"); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("cat", cat); fd.append("caption", caption);
      await api.post("/content/portfolio", fd, { timeout: 120000 });
      toast.success("Photo added to the portfolio");
      pick(null); setCaption(""); if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) { toast.error(errorText(err)); } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this photo from the portfolio?")) return;
    try { await api.delete(`/content/portfolio/${id}`); toast.success("Removed"); load(); } catch (err) { toast.error(errorText(err)); }
  };

  const saveEdit = async () => {
    try { await api.patch(`/content/portfolio/${editing}`, edit); toast.success("Updated"); setEditing(null); load(); } catch (err) { toast.error(errorText(err)); }
  };

  return (
    <div data-testid="portfolio-editor">
      <form onSubmit={upload} className="bg-white rounded-3xl p-5 border border-[#F1DCE3] grid sm:grid-cols-[120px_1fr] gap-4 items-start" data-testid="portfolio-upload-form">
        <button type="button" onClick={() => fileRef.current.click()} className="w-full aspect-[4/5] rounded-2xl border-2 border-dashed border-[#F4B7CE] bg-[#FBE9F0] overflow-hidden flex items-center justify-center text-[#E62E6B]" data-testid="portfolio-pick-btn">
          {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <Upload size={22} />}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0])} className="hidden" data-testid="portfolio-file-input" />
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls} data-testid="portfolio-cat-select">{CATS.map((c) => <option key={c}>{c}</option>)}</select>
            <input placeholder="Caption, e.g. Bridal · Golden Hour" value={caption} onChange={(e) => setCaption(e.target.value)} className={inputCls} data-testid="portfolio-caption-input" />
          </div>
          <p className="text-xs text-[#8B7F82]">JPG, PNG or WebP up to 8 MB. Photos are stored securely and appear instantly in the Portfolio contact sheet.</p>
          <button type="submit" disabled={busy || !file} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E62E6B] text-white text-sm font-medium hover:bg-[#C81F57] disabled:opacity-50" data-testid="portfolio-upload-btn">{busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Upload photo</button>
        </div>
      </form>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="portfolio-admin-grid">
        {items.map((p) => (
          <div key={p.id} className="relative bg-white rounded-2xl overflow-hidden border border-[#F1DCE3] group" data-testid={`portfolio-admin-item-${p.id}`}>
            <img src={imgUrl(p.image)} alt={p.caption} className="w-full h-40 object-cover" loading="lazy" />
            {editing === p.id ? (
              <div className="p-2 space-y-2">
                <select value={edit.cat} onChange={(e) => setEdit({ ...edit, cat: e.target.value })} className={`${inputCls} w-full`} data-testid="portfolio-edit-cat">{CATS.map((c) => <option key={c}>{c}</option>)}</select>
                <input value={edit.caption} onChange={(e) => setEdit({ ...edit, caption: e.target.value })} className={`${inputCls} w-full`} data-testid="portfolio-edit-caption" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 py-1.5 rounded-full bg-[#E62E6B] text-white text-xs flex items-center justify-center gap-1" data-testid="portfolio-edit-save"><Check size={12} /> Save</button>
                  <button onClick={() => setEditing(null)} className="flex-1 py-1.5 rounded-full border border-[#F1DCE3] text-[#8B7F82] text-xs flex items-center justify-center gap-1"><X size={12} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#E62E6B]">{p.cat}</div>
                <div className="text-sm text-[#4A2530] truncate">{p.caption}</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => { setEditing(p.id); setEdit({ cat: p.cat, caption: p.caption }); }} className="flex-1 py-1.5 rounded-full border border-[#F1DCE3] text-[#4A2530] text-xs flex items-center justify-center gap-1 hover:border-[#E62E6B]" data-testid={`portfolio-edit-${p.id}`}><Pencil size={12} /> Edit</button>
                  <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-full border border-[#F1DCE3] text-[#8B7F82] hover:text-[#C81F57] flex items-center justify-center" aria-label="Remove" data-testid={`portfolio-delete-${p.id}`}><Trash2 size={13} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioEditor;
