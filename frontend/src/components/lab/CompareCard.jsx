import React, { useState } from "react";
import { TiltCard } from "../fx/TiltCard";

export const CompareCard = ({ before, after, label = "After", beforeLabel = "Before", className = "", testid = "compare-card", initial = 0.5, tilt = true }) => {
  const [v, setV] = useState(initial);
  const pct = Math.round(v * 100);
  const Wrapper = tilt ? TiltCard : "div";
  const wrapProps = tilt ? { max: 8, lift: false } : {};
  return (
    <Wrapper {...wrapProps} className={`relative overflow-hidden rounded-[24px] bg-[#FBE9F0] select-none ${className}`} data-testid={testid}>
      <img src={after} alt={label} className="w-full h-full object-cover block" draggable={false} />
      <div className="absolute inset-0 pointer-events-none" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }} data-testid={`${testid}-before`}>
        <img src={before} alt={beforeLabel} className="w-full h-full object-cover" draggable={false} />
      </div>
      <span className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.15em] uppercase text-[#4A2530] bg-white/90 px-2.5 py-1 rounded-full pointer-events-none">{beforeLabel}</span>
      <span className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.15em] uppercase text-white bg-[#D6245F]/90 px-2.5 py-1 rounded-full pointer-events-none">{label}</span>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(230,46,107,0.5)] pointer-events-none" style={{ left: `${pct}%` }}>
        <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#D6245F] text-white text-xs flex items-center justify-center shadow-lg">◂▸</span>
      </div>
      <input type="range" min="0" max="1" step="0.005" value={v} onChange={(e) => setV(parseFloat(e.target.value))} aria-label="Before / after" className="absolute inset-0 w-full opacity-0 cursor-ew-resize appearance-none" style={{ height: "100%", margin: 0, background: "transparent" }} data-testid={`${testid}-slider`} />
    </Wrapper>
  );
};

export default CompareCard;
