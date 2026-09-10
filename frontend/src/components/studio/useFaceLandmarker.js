import { useCallback, useRef, useState } from "react";

export const useFaceLandmarker = () => {
  const ref = useRef(null);
  const [status, setStatus] = useState("idle");

  const load = useCallback(async () => {
    if (ref.current) return ref.current;
    setStatus("loading");
    try {
      const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
      const make = (delegate) =>
        FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/mediapipe/face_landmarker.task", delegate },
          runningMode: "IMAGE",
          numFaces: 1,
        });
      let lm;
      try { lm = await make("GPU"); } catch { lm = await make("CPU"); }
      ref.current = lm;
      setStatus("ready");
      return lm;
    } catch (e) {
      console.error("FaceLandmarker failed", e);
      setStatus("error");
      return null;
    }
  }, []);

  return { load, status };
};
