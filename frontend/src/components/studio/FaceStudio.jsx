import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Upload, Sparkles, Download, RotateCcw, ScanFace, Loader2 } from "lucide-react";
import { studioLooks, sampleFace } from "../../mock/mock";
import { useFaceLandmarker } from "./useFaceLandmarker";
import { paintMakeup } from "./makeupPainter";
import { StudioControls } from "./StudioControls";
import { LipstickViewer } from "./LipstickViewer";
import { Reveal } from "../fx/Reveal";
import { TiltCard } from "../fx/TiltCard";
import { scrollToId } from "../Navbar";

const MAX_DIM = 1000;

const FaceStudio = () => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(0);
  const streamRef = useRef(null);
  const landmarksRef = useRef(null);
  const lookRef = useRef(null);
  const { load, status } = useFaceLandmarker();
  const [source, setSource] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [look, setLook] = useState({ ...studioLooks[2], intensity: 0.8, liner: true, gloss: true });
  lookRef.current = look;

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const renderImage = useCallback(() => {
    const c = canvasRef.current, img = imgRef.current;
    if (!c || !img) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    if (landmarksRef.current) paintMakeup(ctx, landmarksRef.current, c.width, c.height, lookRef.current);
  }, []);

  useEffect(() => { if (source?.type === "image") renderImage(); }, [look, source, renderImage]);
  useEffect(() => () => stopCamera(), [stopCamera]);

  const loadImage = async (src) => {
    stopCamera();
    setBusy(true);
    setMsg("Loading face engine…");
    const lm = await load();
    if (!lm) { setMsg("Face engine failed to load. Please retry."); setBusy(false); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const s = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
      const c = canvasRef.current;
      c.width = Math.round(img.naturalWidth * s);
      c.height = Math.round(img.naturalHeight * s);
      imgRef.current = img;
      await lm.setOptions({ runningMode: "IMAGE" });
      const res = lm.detect(img);
      landmarksRef.current = res.faceLandmarks?.[0] || null;
      setMsg(landmarksRef.current ? "Face mapped · 478 points — pick a look" : "No face found — try a clear, front-facing photo");
      setSource({ type: "image" });
      setBusy(false);
    };
    img.onerror = () => { setMsg("Couldn't read that image."); setBusy(false); };
    img.src = src;
  };

  const startCamera = async () => {
    stopCamera();
    setBusy(true);
    setMsg("Loading face engine…");
    const lm = await load();
    if (!lm) { setMsg("Face engine failed to load."); setBusy(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 1280 } }, audio: false });
      streamRef.current = stream;
      const v = videoRef.current;
      v.srcObject = stream;
      await v.play();
      await lm.setOptions({ runningMode: "VIDEO" });
      setSource({ type: "video" });
      setMsg("Live · move closer and face the light");
      setBusy(false);
      const c = canvasRef.current;
      const tick = () => {
        if (v.readyState >= 2) {
          if (c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
          const ctx = c.getContext("2d");
          ctx.save();
          ctx.translate(c.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(v, 0, 0, c.width, c.height);
          const res = lm.detectForVideo(v, performance.now());
          if (res.faceLandmarks?.[0]) paintMakeup(ctx, res.faceLandmarks[0], c.width, c.height, lookRef.current);
          ctx.restore();
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      setMsg("Camera access was blocked — upload a photo instead.");
      setBusy(false);
    }
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) loadImage(URL.createObjectURL(f));
    e.target.value = "";
  };

  const download = () => {
    canvasRef.current.toBlob((b) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `rekha-look-${look.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  };

  const reset = () => { stopCamera(); setSource(null); landmarksRef.current = null; setMsg(""); setLook({ ...studioLooks[2], intensity: 0.8, liner: true, gloss: true }); };

  const btn = "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50";

  return (
    <section id="studio" className="relative bg-[#EBE6DB] py-20 md:py-32 scroll-mt-20 overflow-hidden" data-testid="face-studio-section">
      <div className="absolute -top-24 -left-24 w-[320px] h-[320px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="max-w-2xl">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Virtual try-on · AR face scan</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-4 sm:mt-5">Scan your face, <span className="italic text-[#E62E6B]">try the look</span> before the trial</h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5C4E52]">Your camera maps 478 facial points in real time. Swap lip, blush and eye shades, dial the intensity, and inspect the bullet in 3D — then book the real thing.</p>
        </Reveal>

        <div className="mt-10 md:mt-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-10 items-start">
          <Reveal delay={0.1} className="min-w-0">
            <div className="bg-white rounded-[28px] p-3 sm:p-4 border border-[#F1DCE3] shadow-[0_30px_80px_-40px_rgba(230,46,107,0.45)]">
              <div className="relative rounded-2xl overflow-hidden bg-[#FBE9F0] min-h-[380px] sm:min-h-[460px] flex items-center justify-center" data-testid="studio-stage">
                <video ref={videoRef} playsInline muted className="hidden" />
                <canvas ref={canvasRef} className={`w-full max-w-full h-auto max-h-[70vh] object-contain block ${source ? "" : "hidden"}`} data-testid="studio-canvas" />
                {!source && (
                  <div className="text-center px-6 py-10">
                    <div className="mx-auto w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#E62E6B] shadow-lg shadow-[#E62E6B]/20 animate-pulse">
                      <ScanFace size={36} />
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl text-[#4A2530] mt-5">Start your face scan</h3>
                    <p className="text-sm text-[#5C4E52] mt-2 max-w-xs mx-auto">Use your camera, upload a selfie, or try it on our model first.</p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                      <button onClick={startCamera} disabled={busy} className={`${btn} px-6 py-3 bg-[#E62E6B] text-white hover:bg-[#C81F57] shadow-lg shadow-[#E62E6B]/30`} data-testid="studio-camera-btn"><Camera size={17} /> Use camera</button>
                      <button onClick={() => fileRef.current.click()} disabled={busy} className={`${btn} px-6 py-3 bg-white text-[#4A2530] border border-[#F1DCE3] hover:border-[#E62E6B]`} data-testid="studio-upload-btn"><Upload size={17} /> Upload selfie</button>
                      <button onClick={() => loadImage(sampleFace)} disabled={busy} className={`${btn} px-6 py-3 bg-[#F4B7CE] text-[#4A2530] hover:bg-[#E62E6B] hover:text-white`} data-testid="studio-sample-btn"><Sparkles size={17} /> Try on model</button>
                    </div>
                  </div>
                )}
                {busy && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-[#E62E6B]" data-testid="studio-loading">
                    <Loader2 size={34} className="animate-spin" />
                    <span className="font-mono text-[11px] tracking-[0.2em] uppercase">{msg || "Preparing…"}</span>
                  </div>
                )}
                {source && !busy && (
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white bg-[#E62E6B]/90 backdrop-blur px-3 py-1.5 rounded-full">{source.type === "video" ? "● Live" : "Photo"} · {look.name}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                <button onClick={startCamera} disabled={busy} className={`${btn} px-4 py-2.5 bg-[#E62E6B] text-white hover:bg-[#C81F57]`} data-testid="studio-camera-btn-2"><Camera size={15} /> Camera</button>
                <button onClick={() => fileRef.current.click()} disabled={busy} className={`${btn} px-4 py-2.5 bg-[#FBE9F0] text-[#4A2530] hover:bg-[#F4B7CE]`} data-testid="studio-upload-btn-2"><Upload size={15} /> Upload</button>
                <button onClick={() => loadImage(sampleFace)} disabled={busy} className={`${btn} px-4 py-2.5 bg-[#FBE9F0] text-[#4A2530] hover:bg-[#F4B7CE]`} data-testid="studio-sample-btn-2"><Sparkles size={15} /> Model</button>
                <div className="flex-1" />
                {source && <button onClick={download} className={`${btn} px-4 py-2.5 border border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]`} data-testid="studio-download-btn"><Download size={15} /> Save</button>}
                {source && <button onClick={reset} className={`${btn} w-10 h-10 border border-[#F1DCE3] text-[#8B7F82] hover:text-[#E62E6B]`} aria-label="Reset" data-testid="studio-reset-btn"><RotateCcw size={15} /></button>}
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" data-testid="studio-file-input" />
              </div>
              <p className="mt-3 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8B7F82] min-h-[14px]" data-testid="studio-status">{!busy && (msg || (status === "ready" ? "Engine ready" : "Runs on-device · nothing is uploaded"))}</p>
            </div>
          </Reveal>

          <div className="space-y-6 min-w-0">
            <Reveal delay={0.15}>
              <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-[#F1DCE3]">
                <StudioControls look={look} setLook={setLook} />
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <TiltCard max={6} className="bg-white rounded-[28px] border border-[#F1DCE3] overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8B7F82]">3D shade viewer</span>
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#E62E6B]">Drag · Pinch · Zoom</span>
                </div>
                <div className="h-56 sm:h-64 cursor-grab active:cursor-grabbing overflow-hidden relative" data-testid="lipstick-viewer-wrap">
                  <LipstickViewer shade={look.lips || "#E62E6B"} caseColor={look.blush || "#F4B7CE"} />
                </div>
                <div className="px-6 pb-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display text-lg text-[#4A2530]">{look.name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">Lip bullet · {look.lips || "off"}</div>
                  </div>
                  <button onClick={() => scrollToId("contact")} className="px-5 py-2.5 rounded-full bg-[#E62E6B] text-white text-sm font-medium hover:bg-[#C81F57] transition-colors" data-testid="studio-book-btn">Book this look</button>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaceStudio;
