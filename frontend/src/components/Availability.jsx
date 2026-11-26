import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Clock, Check } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { api } from "../lib/api";

export const useSlots = (month) => {
  const [slots, setSlots] = useState([]);
  const key = format(month, "yyyy-MM");
  const reload = () => api.get("/availability", { params: { month: key } }).then((r) => setSlots(r.data)).catch(() => setSlots([]));
  useEffect(() => { reload(); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return { slots, reload };
};

export const fmtSlot = (s) => (s.full_day ? "Full day booked" : `${s.start} – ${s.end} booked`);

export const Availability = ({ compact = false, slots: externalSlots, month: externalMonth, onMonthChange, renderSlotExtra }) => {
  const [innerMonth, setInnerMonth] = useState(() => new Date());
  const month = externalMonth || innerMonth;
  const setMonth = onMonthChange || setInnerMonth;
  const { slots: fetched } = useSlots(month);
  const slots = externalSlots || fetched;
  const [selected, setSelected] = useState(null);

  const byDate = useMemo(() => slots.reduce((m, s) => ((m[s.date] = [...(m[s.date] || []), s]), m), {}), [slots]);
  const bookedDays = Object.keys(byDate).filter((d) => byDate[d].some((s) => s.full_day)).map((d) => new Date(d + "T00:00:00"));
  const partialDays = Object.keys(byDate).filter((d) => !byDate[d].some((s) => s.full_day)).map((d) => new Date(d + "T00:00:00"));
  const selKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const daySlots = selKey ? byDate[selKey] || [] : [];

  return (
    <div className={`bg-white rounded-[28px] border border-[#F1DCE3] ${compact ? "p-4" : "p-5 sm:p-6"}`} data-testid="availability-calendar">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-[#4A2530]"><CalendarDays size={18} className="text-[#C8215A]" /><span className="font-display text-lg">Availability</span></div>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-[#6E6266]">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#E62E6B]" /> Booked</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F4B7CE]" /> Partly</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-[#F1DCE3]" /> Free</span>
        </div>
      </div>
      <div className="grid sm:grid-cols-[auto_1fr] gap-4 items-start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          month={month}
          onMonthChange={setMonth}
          modifiers={{ booked: bookedDays, partial: partialDays }}
          modifiersClassNames={{ booked: "!bg-[#E62E6B] !text-white rounded-full", partial: "!bg-[#F4B7CE] !text-[#4A2530] rounded-full" }}
          classNames={{ day_today: "ring-1 ring-[#E62E6B] text-[#C8215A] rounded-full bg-transparent", day_selected: "!ring-2 !ring-[#4A2530] rounded-full" }}
          className="p-0 mx-auto"
          data-testid="availability-daypicker"
        />
        <div className="min-h-[120px] rounded-2xl bg-[#FBFAF7] border border-[#F1DCE3] p-4" data-testid="availability-day-detail">
          {!selected ? (
            <p className="text-sm text-[#6E6266]">Tap a date to see booked hours. Everything not marked is open for you.</p>
          ) : (
            <>
              <div className="font-display text-base text-[#4A2530]">{format(selected, "EEEE, d MMMM yyyy")}</div>
              {daySlots.length === 0 ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-[#1c7a45]" data-testid="availability-free"><Check size={15} /> Fully available — request any time.</p>
              ) : (
                <ul className="mt-2 space-y-1.5" data-testid="availability-slots">
                  {daySlots.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-2 text-sm text-[#4A2530] bg-white rounded-lg px-3 py-2 border border-[#F1DCE3]">
                      <span className="flex items-center gap-2"><Clock size={14} className="text-[#C8215A]" /> {fmtSlot(s)}{s.note ? <span className="text-[#6E6266]"> · {s.note}</span> : null}</span>
                      {renderSlotExtra?.(s)}
                    </li>
                  ))}
                  {!daySlots.some((s) => s.full_day) && <li className="text-xs text-[#1c7a45] pt-1">Other hours are open — mention your preferred time in the enquiry.</li>}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Availability;
