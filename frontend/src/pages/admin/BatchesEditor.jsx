import React, { useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, errorText } from "../../lib/api";
import { pagesByGroup } from "../../lib/pages";
import { useBatches, formatBatchDate } from "../../components/BatchBanner";

const Row = ({ page, batch, reload }) => {
  const [date, setDate] = useState(batch?.date || "");
  const [note, setNote] = useState(batch?.note || "");
  const [seats, setSeats] = useState(batch?.seats || 5);
  const [busy, setBusy] = useState(false);
  const slug = page.path.slice(1);
  const save = async () => {
    if (!date) return toast.error("Pick a date first");
    setBusy(true);
    try { await api.put(`/content/batches/${slug}`, { date, note: note || null, seats: seats || null }); await reload(); toast.success(`${page.name}: next batch ${formatBatchDate(date)}`); }
    catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  };
  const clear = async () => {
    setBusy(true);
    try { await api.delete(`/content/batches/${slug}`); setDate(""); setNote(""); setSeats(5); await reload(); toast.success("Banner removed"); }
    catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  };
  const input = "px-3 py-2 rounded-xl border border-[#F1DCE3] bg-white text-sm text-[#4A2530] focus:outline-none focus:border-[#E62E6B]";
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#F1DCE3] grid md:grid-cols-[1fr_150px_1fr_110px_auto] gap-3 items-center" data-testid={`batch-row-${slug}`}>
      <div>
        <div className="font-medium text-[#4A2530] text-sm">{page.name}</div>
        <div className="text-xs text-[#8B7F82]">{batch ? `Live: ${formatBatchDate(batch.date)} · ${batch.seats || 5} seats` : "No banner shown"}</div>
      </div>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} data-testid={`batch-date-${slug}`} />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note · e.g. Weekend batch, Bangalore studio" maxLength={160} className={input} data-testid={`batch-note-${slug}`} />
      <input type="number" min={1} max={999} value={seats} onChange={(e) => setSeats(e.target.value)} placeholder="Seats (5)" className={input} data-testid={`batch-seats-${slug}`} />
      <div className="flex gap-2">
        <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E62E6B] text-white text-xs font-medium hover:bg-[#C81F57] disabled:opacity-60" data-testid={`batch-save-${slug}`}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</button>
        {batch && <button onClick={clear} disabled={busy} className="w-9 h-9 rounded-full border border-[#F1DCE3] text-[#8B7F82] hover:text-[#E62E6B] flex items-center justify-center" aria-label="Remove" data-testid={`batch-clear-${slug}`}><Trash2 size={14} /></button>}
      </div>
    </div>
  );
};

export const BatchesEditor = () => {
  const [map, reload] = useBatches();
  return (
    <div data-testid="batches-editor">
      <p className="text-sm text-[#5C4E52] mb-5">Set the next start date and seats left for each course. The page shows a "Next batch starts …" banner with a live countdown and seat count under its hero automatically; the banner hides on its own once the date passes. Leave seats blank to default to 5.</p>
      <div className="space-y-2">
        {pagesByGroup("Academy").map((p) => <Row key={`${p.path}-${map[p.path]?.date || ""}`} page={p} batch={map[p.path]} reload={reload} />)}
      </div>
    </div>
  );
};
