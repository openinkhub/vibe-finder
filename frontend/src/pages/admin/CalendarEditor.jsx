import React, { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, errorText } from "../../lib/api";
import { Availability, useSlots, fmtSlot } from "../../components/Availability";

const inputCls = "px-3 py-2.5 rounded-xl border border-[#F1DCE3] bg-[#FBFAF7] text-[#4A2530] text-sm focus:outline-none focus:border-[#E62E6B]";

export const CalendarEditor = () => {
  const [month, setMonth] = useState(() => new Date());
  const { slots, reload } = useSlots(month);
  const [f, setF] = useState({ date: format(new Date(), "yyyy-MM-dd"), full_day: false, start: "10:00", end: "14:00", note: "" });
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/availability", { ...f, start: f.full_day ? null : f.start, end: f.full_day ? null : f.end, note: f.note || null });
      toast.success("Marked as booked — visible on the site now");
      const d = new Date(f.date + "T00:00:00");
      if (format(d, "yyyy-MM") !== format(month, "yyyy-MM")) setMonth(d); else reload();
    } catch (err) { toast.error(errorText(err)); } finally { setBusy(false); }
  };
  const remove = async (id) => {
    try { await api.delete(`/availability/${id}`); toast.success("Slot freed"); reload(); } catch (err) { toast.error(errorText(err)); }
  };

  return (
    <div className="space-y-6" data-testid="calendar-editor">
      <form onSubmit={add} className="bg-white rounded-3xl p-5 border border-[#F1DCE3]" data-testid="slot-form">
        <div className="font-display text-lg text-[#4A2530] mb-3">Mark a booked date / hours</div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-[#8B7F82]">Date<input type="date" required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inputCls} data-testid="slot-date-input" /></label>
          <label className="flex items-center gap-2 text-sm text-[#4A2530] pb-2.5"><input type="checkbox" checked={f.full_day} onChange={(e) => setF({ ...f, full_day: e.target.checked })} className="accent-[#E62E6B]" data-testid="slot-fullday-input" /> Full day</label>
          {!f.full_day && (
            <>
              <label className="flex flex-col gap-1 text-xs text-[#8B7F82]">From<input type="time" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} className={inputCls} data-testid="slot-start-input" /></label>
              <label className="flex flex-col gap-1 text-xs text-[#8B7F82]">To<input type="time" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} className={inputCls} data-testid="slot-end-input" /></label>
            </>
          )}
          <label className="flex flex-col gap-1 text-xs text-[#8B7F82] flex-1 min-w-[160px]">Note (private label, shown as-is)<input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="e.g. Wedding · Whitefield" className={inputCls} data-testid="slot-note-input" /></label>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D6245F] text-white text-sm font-medium hover:bg-[#C81F57] disabled:opacity-60" data-testid="slot-add-btn">{busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Mark booked</button>
        </div>
      </form>

      <Availability slots={slots} month={month} onMonthChange={setMonth} renderSlotExtra={(s) => (
        <button onClick={() => remove(s.id)} className="w-7 h-7 rounded-full text-[#8B7F82] hover:text-[#C81F57] hover:bg-[#FBE9F0] flex items-center justify-center" aria-label="Remove slot" data-testid={`slot-delete-${s.id}`}><Trash2 size={13} /></button>
      )} />

      <div className="bg-white rounded-3xl p-5 border border-[#F1DCE3]" data-testid="slot-list">
        <div className="font-display text-lg text-[#4A2530] mb-3">Booked in {format(month, "MMMM yyyy")} · {slots.length}</div>
        {slots.length === 0 && <p className="text-sm text-[#8B7F82]">Nothing booked this month yet.</p>}
        <ul className="divide-y divide-[#FBE9F0]">
          {slots.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm text-[#4A2530]" data-testid={`slot-row-${s.id}`}>
              <span><span className="font-mono text-xs text-[#C8215A] mr-2">{s.date}</span>{fmtSlot(s)}{s.note ? <span className="text-[#8B7F82]"> · {s.note}</span> : null}</span>
              <button onClick={() => remove(s.id)} className="w-8 h-8 rounded-full text-[#8B7F82] hover:text-[#C81F57] hover:bg-[#FBE9F0] flex items-center justify-center" aria-label="Remove" data-testid={`slot-remove-${s.id}`}><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CalendarEditor;
