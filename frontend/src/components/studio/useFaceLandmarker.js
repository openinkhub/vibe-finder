import { useCallback, useRef, useState } from "react";

const WASM_PATH = "/mediapipe/wasm";
const MODEL_PATH = "/mediapipe/face_landmarker.task";

const withTimeout = (p, ms, label) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms))]);

export const useFaceLandmarker = () => {
  const lmRef = useRef(null);
  const delegateRef = useRef(null);
  const pendingRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState("");

  const create = useCallback(async (delegate) => {
    const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
    setProgress("Downloading face engine…");
    const vision = await withTimeout(FilesetResolver.forVisionTasks(WASM_PATH), 120000, "Engine download");
    setProgress(`Starting ${delegate} face model…`);
    const lm = await withTimeout(
      FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate },
        runningMode: "IMAGE",
        numFaces: 1,
      }),
      delegate === "GPU" ? 15000 : 60000,
      `${delegate} model init`
    );
    delegateRef.current = delegate;
    return lm;
  }, []);

  const load = useCallback(async () => {
    if (lmRef.current) return lmRef.current;
    if (pendingRef.current) return pendingRef.current;
    setStatus("loading");
    pendingRef.current = (async () => {
      try {
        let lm;
        try { lm = await create("GPU"); } catch (e) { console.warn("GPU delegate failed, using CPU", e); lm = await create("CPU"); }
        lmRef.current = lm;
        setStatus("ready");
        setProgress("");
        return lm;
      } catch (e) {
        console.error("FaceLandmarker failed", e);
        setStatus("error");
        setProgress("");
        return null;
      } finally {
        pendingRef.current = null;
      }
    })();
    return pendingRef.current;
  }, [create]);

  const fallbackToCpu = useCallback(async () => {
    if (delegateRef.current === "CPU") return null;
    try { lmRef.current?.close(); } catch { /* ignore */ }
    lmRef.current = null;
    const lm = await create("CPU");
    lmRef.current = lm;
    return lm;
  }, [create]);

  const detectImage = useCallback(async (img) => {
    let lm = lmRef.current || (await load());
    if (!lm) throw new Error("engine unavailable");
    try {
      await lm.setOptions({ runningMode: "IMAGE" });
      return lm.detect(img);
    } catch (e) {
      console.warn("detect failed, retrying on CPU", e);
      lm = await fallbackToCpu();
      if (!lm) throw e;
      await lm.setOptions({ runningMode: "IMAGE" });
      return lm.detect(img);
    }
  }, [load, fallbackToCpu]);

  const get = useCallback(() => lmRef.current, []);

  return { load, detectImage, fallbackToCpu, get, status, progress };
};
