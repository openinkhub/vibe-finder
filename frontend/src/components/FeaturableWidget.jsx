import React, { useEffect } from "react";

const SCRIPT_ID = "featurable-embed-script";
const WIDGET_ID = "featurable-a61c35eb-4509-43b0-bc41-4288aeff166a";

export const FeaturableWidget = () => {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) {
      window.Featurable?.init?.();
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://cdn.featurable.com/widget/v2/embed.js";
    script.defer = true;
    script.setAttribute("charset", "UTF-8");
    document.body.appendChild(script);
  }, []);

  return <div id={WIDGET_ID} data-featurable-async data-testid="featurable-reviews-widget" />;
};

export default FeaturableWidget;
