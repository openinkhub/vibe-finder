import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { api, errorText } from "../../lib/api";

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] text-sm focus:outline-none focus:border-[#E62E6B] transition-all";
const EMPTY = { price: "", title: "", desc: "", featured: false };

const Row = ({ item, onSave, onCancel }) => {
  const [f, setF] = useState(item);
  const [busy, setBusy] = useState(false);
  const save = async (e) => { e.preventDefault(); setBusy(true); try { await onSave(f); } finally { setBusy(false); } };
  return (
    <form onSubmit={save} className="bg-white rounded-2xl p-4 border-2 border-[#E62E6B]/40 grid sm:grid-cols-[140px_1fr_auto] gap-3 items-start" data-testid="pricing-edit-form">
      <input required placeholder="₹1,999" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} className={inputCls} data-testid="pricing-price-input" />
      <div className="space-y-2">
        <input required placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} data-testid="pricing-title-input" />
        <input placeholder="Short description" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} className={inputCls} data-testid="pricing-desc-input" />
        <label className="flex items-center gap-2 text-sm text-[#5C4E52]"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} className="accent-[#E62E6B]" data-testid="pricing-featured-input" /> Most booked (featured)</label>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="w-10 h-10 rounded-full bg-[#D6245F] text-white flex items-center justify-center disabled:opacity-60" aria-label="Save" data-testid="pricing-save-btn">{busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}</button>
        <button type="button" onClick={onCancel} className="w-10 h-10 rounded-full border border-[#F1DCE3] text-[#8B7F82] flex items-center justify-center" aria-label="Cancel" data-testid="pricing-cancel-btn"><X size={16} /></button>
      </div>
    </form>
  );
};

export const PricingEditor = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const load = () => api.get("/content/pricing").then((r) => setItems(r.data)).catch((e) => toast.error(errorText(e)));
  useEffect(() => { load(); }, []);

  const save = async (f) => {
    try {
      if (f.id) await api.put(`/content/pricing/${f.id}`, { price: f.price, title: f.title, desc: f.desc, featured: f.featured });
      else await api.post("/content/pricing", { price: f.price, title: f.title, desc: f.desc, featured: f.featured });
      toast.success("Pricing saved — live on the site");
      setEditing(null); setAdding(false); load();
    } catch (e) { toast.error(errorText(e)); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this price card?")) return;
    try { await api.delete(`/content/pricing/${id}`); toast.success("Deleted"); load(); } catch (e) { toast.error(errorText(e)); }
  };

  return (
    <div data-testid="pricing-editor">
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="text-sm text-[#5C4E52]">Edits appear instantly in the Pricing section of the site.</p>
        <button onClick={() => { setAdding(true); setEditing(null); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#D6245F] text-white text-sm font-medium hover:bg-[#C81F57]" data-testid="pricing-add-btn"><Plus size={15} /> Add price</button>
      </div>
      <div className="space-y-3">
        {adding && <Row item={EMPTY} onSave={save} onCancel={() => setAdding(false)} />}
        {items.map((p) => editing === p.id ? (
          <Row key={p.id} item={p} onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <div key={p.id} className="bg-white rounded-2xl p-4 border border-[#F1DCE3] flex items-center gap-4" data-testid={`pricing-row-${p.id}`}>
            <div className="font-display text-2xl text-[#C8215A] w-32 shrink-0">{p.price}</div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg text-[#4A2530] flex items-center gap-2">{p.title} {p.featured && <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-[#FBE9F0] text-[#C8215A] px-2 py-0.5 rounded-full"><Star size={10} className="fill-current" /> featured</span>}</div>
              <div className="text-sm text-[#5C4E52] truncate">{p.desc}</div>
            </div>
            <button onClick={() => { setEditing(p.id); setAdding(false); }} className="w-9 h-9 rounded-full border border-[#F1DCE3] text-[#4A2530] hover:text-[#C8215A] flex items-center justify-center" aria-label="Edit" data-testid={`pricing-edit-${p.id}`}><Pencil size={14} /></button>
            <button onClick={() => remove(p.id)} className="w-9 h-9 rounded-full border border-[#F1DCE3] text-[#8B7F82] hover:text-[#C81F57] flex items-center justify-center" aria-label="Delete" data-testid={`pricing-delete-${p.id}`}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingEditor;
