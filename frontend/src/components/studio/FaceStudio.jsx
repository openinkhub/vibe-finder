import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Upload, Sparkles, Download, RotateCcw, Wand2, Share2, SlidersHorizontal, Layers, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { studioLooks, sampleFace, brand } from "../../mock/mock";
import { api, errorText } from "../../lib/api";
import { useFaceLandmarker } from "./useFaceLandmarker";
import { paintMakeup } from "./makeupPainter";
import { StudioControls } from "./StudioControls";
import { StudioStage } from "./StudioStage";
import { LipstickViewer } from "./LipstickViewer";
import { Reveal } from "../fx/Reveal";
import { TiltCard } from "../fx/TiltCard";
import { useNavigate } from "react-router-dom";
import { scrollToId } from "../Navbar";

const MAX_DIM = 1000;
const AI_DIM = 768;
const DEFAULT_LOOK = { ...studioLooks[0], intensity: 0.9, liner: true, gloss: true };

const FaceStudio = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(0);
  const streamRef = useRef(null);
  const landmarksRef = useRef(null);
  const lookRef = useRef(null);
  const sectionRef = useRef(null);
  const { load, detectImage, fallbackToCpu, status, progress } = useFaceLandmarker();
  const [source, setSource] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  const [view, setView] = useState("overlay");
  const [compare, setCompare] = useState(null);
  const [beforeUrl, setBeforeUrl] = useState(null);
  const [look, setLook] = useState(DEFAULT_LOOK);
  const [gallery, setGallery] = useState([]);
  const [booking, setBooking] = useState(false);
  lookRef.current = look;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { load(); io.disconnect(); }
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

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
  useEffect(() => { setAiImage(null); setView("overlay"); }, [look.name, look.lips, look.blush, look.eyes, look.liner, look.gloss]);

  const loadImage = async (src) => {
    stopCamera();
    setBusy(true);
    setAiImage(null);
    setView("overlay");
    setCompare(null);
    setMsg("Loading face engine…");
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.onload = () => res(i);
        i.onerror = () => rej(new Error("Couldn't read that image."));
        i.src = src;
      });
      const s = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
      const c = canvasRef.current;
      c.width = Math.round(img.naturalWidth * s);
      c.height = Math.round(img.naturalHeight * s);
      imgRef.current = img;
      landmarksRef.current = null;
      setSource({ type: "image" });
      setMsg("Mapping your face…");
      const res = await detectImage(img);
      landmarksRef.current = res.faceLandmarks?.[0] || null;
      setSource({ type: "image", t: Date.now() });
      const before = document.createElement("canvas");
      before.width = c.width; before.height = c.height;
      before.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      setBeforeUrl(before.toDataURL("image/jpeg", 0.9));
      if (landmarksRef.current) { setCompare(0.5); setMsg("Face mapped · 478 points — drag the slider to compare, or generate the AI look"); }
      else setMsg("No face found — try a clear, front-facing photo");
    } catch (e) {
      console.error(e);
      setMsg(e?.message?.includes("image") ? e.message : "Face engine couldn't start in this browser — please retry or try another browser.");
    } finally {
      setBusy(false);
    }
  };

  const startCamera = async () => {
    stopCamera();
    setBusy(true);
    setAiImage(null);
    setView("overlay");
    setCompare(null);
    setMsg("Loading face engine…");
    let lm = await load();
    if (!lm) { setMsg("Face engine failed to load. Please retry."); setBusy(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 1280 } }, audio: false });
      streamRef.current = stream;
      const v = videoRef.current;
      v.srcObject = stream;
      await v.play();
      await lm.setOptions({ runningMode: "VIDEO" });
      setSource({ type: "video" });
      setMsg("Live · move closer and face the light · tap Generate AI look for a photoreal snapshot");
      setBusy(false);
      const c = canvasRef.current;
      let failed = 0;
      const tick = async () => {
        if (v.readyState >= 2) {
          if (c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
          const ctx = c.getContext("2d");
          ctx.save();
          ctx.translate(c.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(v, 0, 0, c.width, c.height);
          try {
            const res = lm.detectForVideo(v, performance.now());
            if (res.faceLandmarks?.[0]) paintMakeup(ctx, res.faceLandmarks[0], c.width, c.height, lookRef.current);
          } catch (e) {
            ctx.restore();
            if (failed++ === 0) {
              const cpu = await fallbackToCpu().catch(() => null);
              if (cpu) { lm = cpu; await lm.setOptions({ runningMode: "VIDEO" }); }
            }
            if (failed > 3 || !streamRef.current) { setMsg("Face tracking stopped — try uploading a photo."); return; }
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
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

  const snapshotFromVideo = () => {
    const v = videoRef.current, c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    ctx.translate(c.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.92);
  };

  const generateAI = async () => {
    if (!source) return;
    if (source.type === "video") {
      const snap = snapshotFromVideo();
      await loadImage(snap);
    }
    const img = imgRef.current;
    if (!img) return;
    setGenerating(true);
    try {
      const s = Math.min(1, AI_DIM / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const { data } = await api.post("/studio/generate", { image: c.toDataURL("image/jpeg", 0.88), look: { name: look.name, lips: look.lips, blush: look.blush, eyes: look.eyes, intensity: look.intensity, liner: look.liner, gloss: look.gloss } }, { timeout: 120000 });
      setAiImage(data.image);
      setGallery((g) => [{ id: `${Date.now()}`, image: data.image, look: look.name, lips: look.lips, at: new Date() }, ...g].slice(0, 12));
      setView("ai");
      setCompare(0.5);
      setMsg("AI look ready — drag to compare with the original");
      toast.success("Your photoreal look is ready");
    } catch (e) {
      const t = errorText(e, "AI generation failed — please try again");
      setMsg(t);
      toast.error(t);
    } finally {
      setGenerating(false);
    }
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) loadImage(URL.createObjectURL(f));
    e.target.value = "";
  };

  const currentBlob = () => new Promise((res) => {
    if (view === "ai" && aiImage) fetch(aiImage).then((r) => r.blob()).then(res);
    else canvasRef.current.toBlob(res, "image/png");
  });
  const fileName = () => `rekha-${view === "ai" ? "ai-" : ""}look-${look.name.toLowerCase().replace(/\s+/g, "-")}.png`;

  const download = async () => {
    const b = await currentBlob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const share = async () => {
    const b = await currentBlob();
    const file = new File([b], fileName(), { type: b.type || "image/png" });
    const text = `Hi Rekha! I tried the "${look.name}" look in your virtual studio and I'd love to book it.`;
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], text, title: "My Rekha Krishnamurthy look" }); return; } catch (e) { if (e?.name === "AbortError") return; }
    }
    await download();
    window.open(`https://api.whatsapp.com/send?phone=${brand.whatsapp.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(text + " (photo attached)")}`, "_blank", "noopener");
    toast("Image saved — attach it in the WhatsApp chat that just opened");
  };

  const openGalleryItem = (g) => { setAiImage(g.image); setView("ai"); if (source?.type === "image") setCompare(0.5); setMsg(`Viewing saved AI look · ${g.look}`); };

  const bookLook = async () => {
    const name = view === "ai" && aiImage ? (gallery.find((g) => g.image === aiImage)?.look || look.name) : look.name;
    sessionStorage.setItem("rk_selected_look", name);
    sessionStorage.removeItem("rk_selected_look_image");
    if (view === "ai" && aiImage) {
      setBooking(true);
      try {
        const { data } = await api.post("/studio/looks", { image: aiImage, look: name }, { timeout: 60000 });
        sessionStorage.setItem("rk_selected_look_image", data.url);
        toast.success("Look attached to your enquiry");
      } catch (e) {
        toast.error(errorText(e, "Couldn't attach the image — booking the look by name instead"));
      } finally { setBooking(false); }
    }
    if (document.getElementById("contact")) scrollToId("contact"); else navigate("/contact");
  };
  const reset = () => { stopCamera(); setSource(null); landmarksRef.current = null; setMsg(""); setAiImage(null); setView("overlay"); setCompare(null); setBeforeUrl(null); setLook(DEFAULT_LOOK); };

  const btn = "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50";
  const canCompare = source?.type === "image" && !!landmarksRef.current;

  return (
    <section id="studio" ref={sectionRef} className="relative bg-[#EBE6DB] py-20 md:py-32 scroll-mt-20 overflow-hidden" data-testid="face-studio-section">
      <div className="absolute -top-24 -left-24 w-[320px] h-[320px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="max-w-2xl">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Virtual try-on · AR face scan · AI look</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-4 sm:mt-5">Scan your face, <span className="italic text-[#E62E6B]">try the look</span> before the trial</h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5C4E52]">Your camera maps 478 facial points and paints the look instantly. Then tap <span className="font-semibold text-[#4A2530]">Generate AI look</span> for a photoreal re-render, drag to compare before / after, and share it straight to Rekha.</p>
        </Reveal>

        <div className="mt-10 md:mt-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-10 items-start">
          <Reveal delay={0.1} className="min-w-0">
            <div className="bg-white rounded-[28px] p-3 sm:p-4 border border-[#F1DCE3] shadow-[0_30px_80px_-40px_rgba(230,46,107,0.45)]">
              <StudioStage
                canvasRef={canvasRef} videoRef={videoRef} source={source} busy={busy} generating={generating} progress={progress} msg={msg}
                look={look} view={view} aiImage={aiImage} beforeUrl={beforeUrl} compare={compare} setCompare={setCompare}
                onCamera={startCamera} onUpload={() => fileRef.current.click()} onSample={() => loadImage(sampleFace)}
              />

              {source && !busy && (
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                  <button onClick={generateAI} disabled={generating} className={`${btn} px-5 py-2.5 bg-[#E62E6B] text-white hover:bg-[#C81F57] shadow-lg shadow-[#E62E6B]/30`} data-testid="studio-generate-ai-btn"><Wand2 size={15} /> {aiImage ? "Regenerate AI look" : "Generate AI look"}</button>
                  {aiImage && (
                    <div className="inline-flex rounded-full border border-[#F1DCE3] p-1 bg-[#FBFAF7]" data-testid="studio-view-toggle">
                      <button onClick={() => setView("overlay")} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${view === "overlay" ? "bg-[#4A2530] text-white" : "text-[#5C4E52]"}`} data-testid="studio-view-overlay"><Layers size={13} /> Instant</button>
                      <button onClick={() => setView("ai")} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${view === "ai" ? "bg-[#E62E6B] text-white" : "text-[#5C4E52]"}`} data-testid="studio-view-ai"><Wand2 size={13} /> AI look</button>
                    </div>
                  )}
                  {canCompare && (
                    <button onClick={() => setCompare(compare == null ? 0.5 : null)} className={`${btn} px-4 py-2.5 border ${compare != null ? "border-[#E62E6B] text-[#E62E6B]" : "border-[#F1DCE3] text-[#4A2530]"}`} data-testid="studio-compare-toggle"><SlidersHorizontal size={15} /> {compare != null ? "Hide compare" : "Before / After"}</button>
                  )}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button onClick={startCamera} disabled={busy} className={`${btn} px-4 py-2.5 ${source ? "bg-[#FBE9F0] text-[#4A2530] hover:bg-[#F4B7CE]" : "bg-[#E62E6B] text-white hover:bg-[#C81F57]"}`} data-testid="studio-camera-btn-2"><Camera size={15} /> Camera</button>
                <button onClick={() => fileRef.current.click()} disabled={busy} className={`${btn} px-4 py-2.5 bg-[#FBE9F0] text-[#4A2530] hover:bg-[#F4B7CE]`} data-testid="studio-upload-btn-2"><Upload size={15} /> Upload</button>
                <button onClick={() => loadImage(sampleFace)} disabled={busy} className={`${btn} px-4 py-2.5 bg-[#FBE9F0] text-[#4A2530] hover:bg-[#F4B7CE]`} data-testid="studio-sample-btn-2"><Sparkles size={15} /> Model</button>
                <div className="flex-1" />
                {source && <button onClick={share} className={`${btn} px-4 py-2.5 bg-[#25D366] text-white hover:bg-[#1eb959]`} data-testid="studio-share-btn"><Share2 size={15} /> Share</button>}
                {source && <button onClick={download} className={`${btn} px-4 py-2.5 border border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]`} data-testid="studio-download-btn"><Download size={15} /> Save</button>}
                {source && <button onClick={reset} className={`${btn} w-10 h-10 border border-[#F1DCE3] text-[#8B7F82] hover:text-[#E62E6B]`} aria-label="Reset" data-testid="studio-reset-btn"><RotateCcw size={15} /></button>}
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" data-testid="studio-file-input" />
              </div>
              {gallery.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#F1DCE3]" data-testid="look-gallery">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8B7F82]">Your AI looks · {gallery.length}</span>
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#E62E6B]">Tap one to view & book</span>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    {gallery.map((g) => (
                      <button key={g.id} onClick={() => openGalleryItem(g)} className={`relative shrink-0 w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 transition-all ${aiImage === g.image && view === "ai" ? "border-[#E62E6B] shadow-lg shadow-[#E62E6B]/30" : "border-transparent hover:border-[#F4B7CE]"}`} data-testid={`gallery-item-${g.id}`} aria-label={`View ${g.look}`}>
                        <img src={g.image} alt={g.look} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#4A2530]/80 to-transparent text-white text-[9px] font-mono px-1.5 pb-1 pt-4 truncate text-left">{g.look}</span>
                        {aiImage === g.image && view === "ai" && <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#E62E6B] text-white flex items-center justify-center"><Check size={11} /></span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-3 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8B7F82] min-h-[14px]" data-testid="studio-status">{!busy && (msg || (status === "ready" ? "Engine ready · runs on-device, nothing is uploaded" : status === "loading" ? `${progress || "Preparing face engine…"}` : status === "error" ? "Face engine unavailable in this browser" : "Runs on-device · nothing is uploaded"))}</p>
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
                  <button onClick={bookLook} disabled={booking} className="px-5 py-2.5 rounded-full bg-[#E62E6B] text-white text-sm font-medium hover:bg-[#C81F57] transition-colors inline-flex items-center gap-2 disabled:opacity-60" data-testid="studio-book-btn">{booking && <Loader2 size={14} className="animate-spin" />} Book this look</button>
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
