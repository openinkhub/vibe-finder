import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api, errorText } from "../lib/api";

const pickMime = () => ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || "";

export const VoiceEnquiry = ({ onResult }) => {
  const [state, setState] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => () => { clearInterval(timerRef.current); streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { toast.error("Voice recording isn't supported in this browser"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => upload(new Blob(chunksRef.current, { type: rec.mimeType || mime || "audio/webm" }));
      rec.start(250);
      recRef.current = rec;
      setSeconds(0);
      setState("recording");
      timerRef.current = setInterval(() => setSeconds((s) => { if (s >= 89) stop(); return s + 1; }), 1000);
    } catch {
      toast.error("Microphone access was blocked — please allow the mic and try again");
    }
  };

  const stop = () => {
    clearInterval(timerRef.current);
    const rec = recRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const upload = async (blob) => {
    setState("processing");
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
      const fd = new FormData();
      fd.append("file", blob, `enquiry.${ext}`);
      const { data } = await api.post("/studio/transcribe", fd, { timeout: 120000 });
      setTranscript(data.transcript);
      onResult?.(data);
      setState("done");
      toast.success("Got it — we filled in the form from your voice note");
    } catch (e) {
      setState("idle");
      toast.error(errorText(e, "Couldn't process the recording — please try again"));
    }
  };

  return (
    <div className="rounded-2xl border border-[#F1DCE3] bg-[#FBE9F0] p-4 sm:p-5" data-testid="voice-enquiry">
      <div className="flex items-center gap-4">
        {state === "recording" ? (
          <button type="button" onClick={stop} className="relative w-14 h-14 shrink-0 rounded-full bg-[#D6245F] text-white flex items-center justify-center shadow-lg shadow-[#E62E6B]/40" aria-label="Stop recording" data-testid="voice-stop-btn">
            <span className="absolute inset-0 rounded-full bg-[#E62E6B] animate-ping opacity-40" />
            <Square size={20} className="relative fill-current" />
          </button>
        ) : (
          <button type="button" onClick={start} disabled={state === "processing"} className="w-14 h-14 shrink-0 rounded-full bg-[#D6245F] text-white flex items-center justify-center shadow-lg shadow-[#E62E6B]/40 hover:scale-105 transition-transform disabled:opacity-60" aria-label="Start recording" data-testid="voice-start-btn">
            {state === "processing" ? <Loader2 size={22} className="animate-spin" /> : <Mic size={22} />}
          </button>
        )}
        <div className="min-w-0">
          <div className="font-display text-lg text-[#4A2530] leading-tight">{state === "recording" ? `Listening… ${seconds}s` : state === "processing" ? "Transcribing & filling the form…" : state === "done" ? "Voice note captured" : "Speak your enquiry"}</div>
          <p className="text-xs sm:text-sm text-[#5C4E52] mt-1" data-testid="voice-hint">
            {state === "recording" ? "Say your name, phone, event date and what you need — tap stop when done." : state === "done" ? "Review the details below, then tap Send Enquiry." : "Tap the mic and talk — AI fills in name, phone, date & message for you."}
          </p>
        </div>
      </div>
      {transcript && (
        <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm text-[#4A2530] bg-white/70 rounded-xl px-3 py-2.5" data-testid="voice-transcript">
          <Sparkles size={14} className="text-[#C8215A] shrink-0 mt-0.5" /> <span className="italic">“{transcript}”</span>
        </div>
      )}
    </div>
  );
};

export default VoiceEnquiry;
