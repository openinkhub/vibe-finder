import React, { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { api, errorText, imgUrl } from "../../lib/api";

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] text-sm focus:outline-none focus:border-[#E62E6B]";
const EMPTY = { title: "", desc: "", cta: "Enquire" };

const Row = ({ item, onSave, onCancel }) => {
  const [f, setF] = useState(item);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const save = async (e) => { e.preventDefault(); setBusy(true); try { await onSave(f, file); } finally { setBusy(false); } };
  return (
    <form onSubmit={save} className="bg-white rounded-2xl p-4 border-2 border-[#E62E6B]/40 grid sm:grid-cols-[88px_1fr_auto] gap-3 items-start" data-testid="service-edit-form">
      <button type="button" onClick={() => fileRef.current.click()} className="w-[88px] h-[88px] rounded-xl overflow-hidden bg-[#FBE9F0] border border-dashed border-[#F4B7CE] flex items-center justify-center text-[#C8215A]" data-testid="service-pick-btn">
        {file ? <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" /> : item.image ? <img src={imgUrl(item.image)} alt="" className="w-full h-full object-cover" /> : <Upload size={18} />}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} data-testid="service-file-input" />
      <div className="space-y-2">
        <input required placeholder="Service title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} data-testid="service-title-input" />
        <textarea placeholder="Description" rows={2} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} className={`${inputCls} resize-none`} data-testid="service-desc-input" />
        <input placeholder="Button label (e.g. Book bridal)" value={f.cta} onChange={(e) => setF({ ...f, cta: e.target.value })} className={inputCls} data-testid="service-cta-input" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="w-10 h-10 rounded-full bg-[#D6245F] text-white flex items-center justify-center disabled:opacity-60" aria-label="Save" data-testid="service-save-btn">{busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}</button>
        <button type="button" onClick={onCancel} className="w-10 h-10 rounded-full border border-[#F1DCE3] text-[#8B7F82] flex items-center justify-center" aria-label="Cancel"><X size={16} /></button>
      </div>
    </form>
  );
};

export const ServicesEditor = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const load = () => api.get("/content/services").then((r) => setItems(r.data)).catch((e) => toast.error(errorText(e)));
  useEffect(() => { load(); }, []);

  const save = async (f, file) => {
    const fd = new FormData();
    fd.append("title", f.title); fd.append("desc", f.desc || ""); fd.append("cta", f.cta || "Enquire");
    if (file) fd.append("file", file);
    try {
      if (f.id) await api.put(`/content/services/${f.id}`, fd, { timeout: 120000 }); else await api.post("/content/services", fd, { timeout: 120000 });
      toast.success("Service saved — live on the site"); setEditing(null); setAdding(false); load();
    } catch (e) { toast.error(errorText(e)); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try { await api.delete(`/content/services/${id}`); toast.success("Deleted"); load(); } catch (e) { toast.error(errorText(e)); }
  };

  return (
    <div data-testid="services-editor">
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="text-sm text-[#5C4E52]">Edit titles, descriptions, button labels and photos of the Services list.</p>
        <button onClick={() => { setAdding(true); setEditing(null); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#D6245F] text-white text-sm font-medium hover:bg-[#C81F57]" data-testid="service-add-btn"><Plus size={15} /> Add service</button>
      </div>
      <div className="space-y-3">
        {adding && <Row item={EMPTY} onSave={save} onCancel={() => setAdding(false)} />}
        {items.map((s) => editing === s.id ? (
          <Row key={s.id} item={s} onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <div key={s.id} className="bg-white rounded-2xl p-3 sm:p-4 border border-[#F1DCE3] flex items-center gap-4" data-testid={`service-row-${s.id}`}>
            <img src={imgUrl(s.image)} alt={s.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg text-[#4A2530]"><span className="font-mono text-xs text-[#C8215A] mr-2">{s.no}</span>{s.title}</div>
              <div className="text-sm text-[#5C4E52] truncate">{s.desc}</div>
            </div>
            <button onClick={() => { setEditing(s.id); setAdding(false); }} className="w-9 h-9 rounded-full border border-[#F1DCE3] text-[#4A2530] hover:text-[#C8215A] flex items-center justify-center" aria-label="Edit" data-testid={`service-edit-${s.id}`}><Pencil size={14} /></button>
            <button onClick={() => remove(s.id)} className="w-9 h-9 rounded-full border border-[#F1DCE3] text-[#8B7F82] hover:text-[#C81F57] flex items-center justify-center" aria-label="Delete" data-testid={`service-delete-${s.id}`}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesEditor;
