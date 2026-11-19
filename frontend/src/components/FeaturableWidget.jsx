import React, { useEffect, useRef } from "react";

const SCRIPT_ID = "featurable-embed-script";
const WIDGET_ID = "featurable-a61c35eb-4509-43b0-bc41-4288aeff166a";

// The Google-reviews widget script is heavy (~90 KB, ~600 ms of work on phones), so it loads
// only when the reviews section is about to scroll into view.
export const FeaturableWidget = () => {
  const ref = useRef(null);
  useEffect(() => {
    const load = () => {
      if (document.getElementById(SCRIPT_ID)) { window.Featurable?.init?.(); return; }
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://cdn.featurable.com/widget/v2/embed.js";
      script.defer = true;
      script.setAttribute("charset", "UTF-8");
      document.body.appendChild(script);
    };
    if (!("IntersectionObserver" in window) || !ref.current) { load(); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); load(); }
    }, { rootMargin: "600px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} id={WIDGET_ID} data-featurable-async className="min-h-[320px]" data-testid="featurable-reviews-widget" />;
};

export default FeaturableWidget;
