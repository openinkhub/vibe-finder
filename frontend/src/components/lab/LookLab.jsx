import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Camera, ScanFace, X, Loader2, RotateCcw } from "lucide-react";
import { Reveal } from "../fx/Reveal";
import { FaceMesh3D } from "./FaceMesh3D";
import { CompareCard } from "./CompareCard";
import { LAB_LOOKS } from "./faceTexture";
import { useFaceLandmarker } from "../studio/useFaceLandmarker";
import { paintMakeup } from "../studio/makeupPainter";
import { api } from "../../lib/api";
import { sampleFace } from "../../mock/mock";

const MAX = 768;

export { useShowcase } from "../../hooks/useShowcase";

const fitCanvas = (source, w, h) => {
  const s = Math.min(1, MAX / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * s); c.height = Math.round(h * s);
  c.getContext("2d").drawImage(source, 0, 0, c.width, c.height);
  return c;
};

const LookLab = () => {
  const [active, setActive] = useState(LAB_LOOKS[1]);
  const [scan, setScan] = useState(null);
  const [version, setVersion] = useState(0);
  const [afterUrl, setAfterUrl] = useState(null);
  const [mode, setMode] = useState("idle");
  const [msg, setMsg] = useState("");
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const { load, detectImage, status, progress } = useFaceLandmarker();

  const buildScan = useCallback(async (source, w, h, isSample) => {
    setMode("processing");
    try {
      const base = fitCanvas(source, w, h);
      const res = await detectImage(base);
      const landmarks = res.faceLandmarks?.[0];
      if (!landmarks) { setMsg("No face found — face the camera straight on with good light."); setMode(isSample ? "idle" : "camera"); return; }
      const painted = document.createElement("canvas");
      painted.width = base.width; painted.height = base.height;
      setScan({ base, painted, landmarks, aspect: base.width / base.height, isSample, beforeUrl: base.toDataURL("image/jpeg", 0.9) });
      setMsg(isSample ? "Showing our model — scan your own face to see the looks on you" : "Your face, mapped in 3D · 468 points — tap a look");
      setMode("idle");
    } catch (e) {
      console.error(e);
      setMsg("Face engine couldn't start in this browser.");
      setMode("idle");
    }
  }, [detectImage]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(async (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      await load();
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => buildScan(img, img.naturalWidth, img.naturalHeight, true);
      img.src = sampleFace;
    }, { rootMargin: "500px" });
    io.observe(el);
    return () => io.disconnect();
  }, [load, buildScan]);

  useEffect(() => {
    if (!scan) return;
    const ctx = scan.painted.getContext("2d");
    ctx.clearRect(0, 0, scan.painted.width, scan.painted.height);
    ctx.drawImage(scan.base, 0, 0);
    paintMakeup(ctx, scan.landmarks, scan.painted.width, scan.painted.height, active);
    setVersion((v) => v + 1);
    setAfterUrl(scan.painted.toDataURL("image/jpeg", 0.9));
  }, [scan, active]);

  const stopCamera = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };
  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    setMode("camera");
    setMsg("");
    try {
      await load();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 1280 } }, audio: false });
      streamRef.current = stream;
      const v = videoRef.current;
      v.srcObject = stream;
      await v.play();
    } catch {
      setMsg("Camera access was blocked — allow the camera and try again.");
      setMode("idle");
    }
  };

  const capture = async () => {
    const v = videoRef.current;
    if (!v || v.readyState < 2) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    ctx.translate(c.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    stopCamera();
    await buildScan(c, c.width, c.height, false);
  };

  const cancelCamera = () => { stopCamera(); setMode("idle"); };
  const resetToModel = () => {
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => buildScan(img, img.naturalWidth, img.naturalHeight, true);
    img.src = sampleFace;
  };

  const boxCls = "relative h-[440px] sm:h-[520px] lg:h-full lg:min-h-[560px] rounded-[28px] overflow-hidden";

  return (
    <section id="looklab" ref={sectionRef} className="relative bg-[#FBE9F0] py-20 md:py-32 scroll-mt-20 overflow-hidden" data-testid="looklab-section">
      <div className="absolute -bottom-32 -right-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="max-w-2xl">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Look lab · MediaPipe 3D face scan</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-4 sm:mt-5">Scan your face, <span className="italic text-[#E62E6B]">see it in 3D</span> — in four looks</h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5C4E52]">One camera capture builds a 468-point 3D model of your face. Tap Natural, Bridal, Editorial or Glam and the filter is painted straight onto the model — rotate it, then compare before / after beside it. Nothing is uploaded.</p>
        </Reveal>

        <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-2" data-testid="looklab-buttons">
          {LAB_LOOKS.map((l) => (
            <button key={l.key} onClick={() => setActive(l)} className={`flex items-center gap-2 pl-2 pr-5 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${active.key === l.key ? "bg-[#E62E6B] border-[#E62E6B] text-white shadow-lg shadow-[#E62E6B]/25" : "bg-white border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]"}`} data-testid={`looklab-${l.key}`}>
              <span className="flex -space-x-1.5">{[l.lips, l.blush, l.eyes].map((c) => <span key={c} className="w-4 h-4 rounded-full border border-white" style={{ background: c }} />)}</span>
              {l.name}
            </button>
          ))}
          <div className="flex-1" />
          {mode !== "camera" && <button onClick={startCamera} disabled={mode === "processing"} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A2530] text-white text-sm font-medium hover:bg-[#E62E6B] transition-colors disabled:opacity-60" data-testid="looklab-scan-btn"><ScanFace size={16} /> Scan my face</button>}
          {scan && !scan.isSample && mode === "idle" && <button onClick={resetToModel} className="w-10 h-10 rounded-full border border-[#F1DCE3] bg-white text-[#8B7F82] hover:text-[#E62E6B] flex items-center justify-center" aria-label="Back to model" data-testid="looklab-reset-btn"><RotateCcw size={15} /></button>}
        </div>

        <div className="mt-6 md:mt-8 grid lg:grid-cols-2 gap-5 lg:gap-8 items-stretch">
          <Reveal delay={0.05} className="min-w-0">
            <div className={`${boxCls} bg-white border border-[#F1DCE3] ${mode === "camera" ? "" : "cursor-grab active:cursor-grabbing"}`} data-testid="face-model-wrap">
              <video ref={videoRef} playsInline muted className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${mode === "camera" ? "" : "hidden"}`} data-testid="looklab-video" />
              {mode === "camera" && (
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div className="self-center mt-8 w-52 h-64 sm:w-60 sm:h-72 rounded-[45%] border-2 border-dashed border-white/80 shadow-[0_0_0_9999px_rgba(74,37,48,0.35)]" />
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={cancelCamera} className="w-12 h-12 rounded-full bg-white/90 text-[#4A2530] flex items-center justify-center" aria-label="Cancel" data-testid="looklab-cancel-btn"><X size={18} /></button>
                    <button onClick={capture} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#E62E6B] text-white font-medium shadow-lg shadow-[#E62E6B]/40" data-testid="looklab-capture-btn"><Camera size={18} /> Capture</button>
                  </div>
                </div>
              )}
              {mode !== "camera" && scan && <FaceMesh3D key={scan.beforeUrl} landmarks={scan.landmarks} canvas={scan.painted} aspect={scan.aspect} version={version} />}
              {(mode === "processing" || (!scan && mode !== "camera")) && (
                <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-[#E62E6B]" data-testid="looklab-loading">
                  <Loader2 size={32} className="animate-spin" />
                  <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-center px-6">{mode === "processing" ? "Building your 3D face model…" : progress || (status === "error" ? "Face engine unavailable" : "Loading face engine…")}</span>
                </div>
              )}
              {mode !== "camera" && <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.2em] uppercase text-[#8B7F82]">3D face mesh · drag to rotate</div>}
              {mode !== "camera" && scan && (
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 pointer-events-none">
                  <div><div className="font-display text-2xl text-[#4A2530]">{active.name}</div><div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">{scan.isSample ? "Our model" : "Your scan"} · 468 points</div></div>
                  <Link to="/book-bridal-makeup-package-karnataka" className="pointer-events-auto shrink-0 px-4 py-2 rounded-full bg-[#E62E6B] text-white text-xs font-medium hover:bg-[#C81F57]" data-testid="looklab-tryon-btn">Live try-on</Link>
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.12} className="min-w-0">
            {scan && afterUrl ? (
              <CompareCard key={scan.beforeUrl + active.key} before={scan.beforeUrl} after={afterUrl} label={active.name} className={`${boxCls} shadow-[0_30px_80px_-30px_rgba(230,46,107,0.45)]`} testid="looklab-compare" />
            ) : (
              <div className={`${boxCls} bg-white border border-[#F1DCE3] flex items-center justify-center text-[#8B7F82] font-mono text-[11px] uppercase tracking-widest`} data-testid="looklab-compare-loading">Preparing portrait…</div>
            )}
          </Reveal>
        </div>
        <p className="mt-3 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8B7F82] min-h-[14px]" data-testid="looklab-status">{msg}</p>

        <div className="mt-4 flex justify-end">
          <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E62E6B] hover:gap-2.5 transition-all" data-testid="looklab-portfolio-link">See the scroll transformation & parallax gallery <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
};

export default LookLab;
