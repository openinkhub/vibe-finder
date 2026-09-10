import { useEffect, useState } from "react";

export const isTouch = () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

export const useIsMobile = (bp = 768) => {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const on = () => setMobile(window.innerWidth < bp);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [bp]);
  return mobile;
};
