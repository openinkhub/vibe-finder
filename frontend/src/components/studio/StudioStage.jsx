import React from "react";
import { Camera, Upload, Sparkles, ScanFace, Loader2, Wand2 } from "lucide-react";

const btn = "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50";

export const StudioStage = ({ canvasRef, videoRef, source, busy, generating, progress, msg, look, view, aiImage, beforeUrl, compare, setCompare, onCamera, onUpload, onSample }) => {
  const showCompare = source?.type === "image" && !busy && compare != null;
  const pct = Math.round((compare ?? 0.5) * 100);
  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#FBE9F0] min-h-[380px] sm:min-h-[460px] flex items-center justify-center select-none" data-testid="studio-stage">
      <video ref={videoRef} playsInline muted className="hidden" />
      <canvas ref={canvasRef} className={`w-full max-w-full h-auto max-h-[70vh] object-contain block ${source ? "" : "hidden"} ${view === "ai" && aiImage ? "invisible" : ""}`} data-testid="studio-canvas" />

      {source && view === "ai" && aiImage && (
        <img src={aiImage} alt={`AI ${look.name} look`} className="absolute inset-0 w-full h-full object-contain" data-testid="studio-ai-image" />
      )}

      {showCompare && beforeUrl && (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }} data-testid="studio-before-layer">
            <img src={beforeUrl} alt="Before" className="w-full h-full object-contain" />
            <span className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.15em] uppercase text-[#4A2530] bg-white/90 px-2.5 py-1 rounded-full">Before</span>
          </div>
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(230,46,107,0.5)] pointer-events-none" style={{ left: `${pct}%` }}>
            <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#D6245F] text-white text-xs flex items-center justify-center shadow-lg">◂▸</span>
          </div>
          <input
            type="range" min="0" max="1" step="0.005" value={compare}
            onChange={(e) => setCompare(parseFloat(e.target.value))}
            aria-label="Before / after comparison"
            className="absolute inset-x-0 bottom-0 top-0 w-full h-full opacity-0 cursor-ew-resize appearance-none"
            style={{ background: "transparent", height: "100%", margin: 0 }}
            data-testid="studio-compare-slider"
          />
          <span className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.15em] uppercase text-white bg-[#D6245F]/90 px-2.5 py-1 rounded-full pointer-events-none">{view === "ai" ? "AI look" : "After"} · {look.name}</span>
        </>
      )}

      {source && !busy && !showCompare && (
        <span className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.15em] uppercase text-white bg-[#D6245F]/90 backdrop-blur px-3 py-1.5 rounded-full">{source.type === "video" ? "● Live" : view === "ai" ? "AI look" : "Photo"} · {look.name}</span>
      )}

      {!source && (
        <div className="text-center px-6 py-10">
          <div className="mx-auto w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#C8215A] shadow-lg shadow-[#E62E6B]/20 animate-pulse"><ScanFace size={36} /></div>
          <h3 className="font-display text-xl sm:text-2xl text-[#4A2530] mt-5">Start your face scan</h3>
          <p className="text-sm text-[#5C4E52] mt-2 max-w-xs mx-auto">Use your camera, upload a selfie, or try it on our model first.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onCamera} disabled={busy} className={`${btn} px-6 py-3 bg-[#D6245F] text-white hover:bg-[#C81F57] shadow-lg shadow-[#E62E6B]/30`} data-testid="studio-camera-btn"><Camera size={17} /> Use camera</button>
            <button onClick={onUpload} disabled={busy} className={`${btn} px-6 py-3 bg-white text-[#4A2530] border border-[#F1DCE3] hover:border-[#E62E6B]`} data-testid="studio-upload-btn"><Upload size={17} /> Upload selfie</button>
            <button onClick={onSample} disabled={busy} className={`${btn} px-6 py-3 bg-[#F4B7CE] text-[#4A2530] hover:bg-[#D6245F] hover:text-white`} data-testid="studio-sample-btn"><Sparkles size={17} /> Try on model</button>
          </div>
        </div>
      )}

      {(busy || generating) && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-[#C8215A]" data-testid={generating ? "studio-generating" : "studio-loading"}>
          {generating ? <Wand2 size={34} className="animate-pulse" /> : <Loader2 size={34} className="animate-spin" />}
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-center px-6">{generating ? "Painting your photoreal look with AI…" : progress || msg || "Preparing…"}</span>
          <span className="font-mono text-[10px] text-[#6E6266]">{generating ? "Usually 10–25 seconds" : "First load downloads a 15 MB on-device engine"}</span>
        </div>
      )}
    </div>
  );
};

export default StudioStage;
