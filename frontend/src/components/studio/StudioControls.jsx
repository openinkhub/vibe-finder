import React from "react";
import { Check } from "lucide-react";
import { studioLooks, studioShades } from "../../mock/mock";

const Swatches = ({ label, colors, value, onPick, testid }) => (
  <div>
    <div className="flex items-center justify-between mb-2.5">
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6E6266]">{label}</span>
      <button onClick={() => onPick(null)} className={`font-mono text-[10px] tracking-wider uppercase transition-colors ${value ? "text-[#E62E6B]" : "text-[#C9B7BD]"}`} data-testid={`${testid}-clear`}>
        {value ? "Remove" : "Off"}
      </button>
    </div>
    <div className="flex flex-wrap gap-2.5">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onPick(c)}
          aria-label={`${label} shade ${c}`}
          data-testid={`${testid}-${c.slice(1)}`}
          style={{ background: c }}
          className={`w-9 h-9 rounded-full ring-offset-2 ring-offset-white transition-transform duration-200 hover:scale-110 active:scale-95 flex items-center justify-center ${value === c ? "ring-2 ring-[#E62E6B] scale-110" : "ring-1 ring-black/0 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.15)]"}`}
        >
          {value === c && <Check size={14} className="text-white drop-shadow" />}
        </button>
      ))}
    </div>
  </div>
);

export const StudioControls = ({ look, setLook }) => {
  const set = (patch) => setLook((l) => ({ ...l, ...patch, name: patch.name ?? "Custom" }));
  return (
    <div className="space-y-7">
      <div>
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6E6266]">Signature looks</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {studioLooks.map((l) => (
            <button
              key={l.name}
              onClick={() => set({ ...l })}
              data-testid={`look-${l.name.toLowerCase().replace(/\s+/g, "-")}`}
              className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${look.name === l.name ? "bg-[#D6245F] border-[#E62E6B] text-white shadow-lg shadow-[#E62E6B]/25" : "bg-white border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]"}`}
            >
              <span className="flex -space-x-1.5">
                {[l.lips, l.blush, l.eyes].map((c) => <span key={c} className="w-4 h-4 rounded-full border border-white" style={{ background: c }} />)}
              </span>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <Swatches label="Lips" colors={studioShades.lips} value={look.lips} onPick={(c) => set({ lips: c })} testid="shade-lips" />
      <Swatches label="Blush" colors={studioShades.blush} value={look.blush} onPick={(c) => set({ blush: c })} testid="shade-blush" />
      <Swatches label="Eyeshadow" colors={studioShades.eyes} value={look.eyes} onPick={(c) => set({ eyes: c })} testid="shade-eyes" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6E6266]">Intensity</span>
          <span className="font-mono text-xs text-[#E62E6B]">{Math.round(look.intensity * 100)}%</span>
        </div>
        <input
          type="range" min="0.2" max="1" step="0.05" value={look.intensity}
          onChange={(e) => set({ intensity: parseFloat(e.target.value) })}
          className="w-full accent-[#E62E6B]"
          data-testid="intensity-slider"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[["liner", "Eyeliner"], ["gloss", "Lip gloss"]].map(([k, label]) => (
          <button key={k} onClick={() => set({ [k]: !look[k] })} data-testid={`toggle-${k}`} className={`px-4 py-2 rounded-full text-sm border transition-colors ${look[k] ? "bg-[#D6245F] border-[#E62E6B] text-white" : "bg-white border-[#F1DCE3] text-[#5C4E52]"}`}>
            {label} {look[k] ? "on" : "off"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudioControls;
