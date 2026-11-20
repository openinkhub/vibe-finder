import React from "react";
import { useLocation } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Reveal } from "./fx/Reveal";
import { Block } from "./RichBody";
import { extrasFor } from "../content/pageExtras";

// Extra sections, FAQ and outside resources for a page (content in content/pageExtras.js).
export const PageExtras = ({ path }) => {
  const { pathname } = useLocation();
  const x = extrasFor(path || pathname);
  if (!x) return null;
  return (
    <section className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pb-14 md:pb-20" data-testid="page-extras">
      <div className="max-w-3xl space-y-10">
        {x.sections?.map((s, i) => <Block key={s.h} s={s} i={i} />)}
        {x.faq?.length > 0 && (
          <Reveal>
            <div data-testid="page-extras-faq">
              <h2 className="font-display text-2xl sm:text-3xl text-[#4A2530] mb-5">Common questions</h2>
              <div className="space-y-3">
                {x.faq.map(([q, a]) => (
                  <div key={q} className="bg-white rounded-2xl border border-[#F1DCE3] px-5 py-4">
                    <h3 className="font-display text-base sm:text-lg text-[#4A2530]">{q}</h3>
                    <p className="text-sm text-[#5C4E52] mt-1.5 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
        {x.links?.length > 0 && (
          <div data-testid="page-extras-links">
            <h2 className="font-display text-xl sm:text-2xl text-[#4A2530] mb-3">Helpful resources</h2>
            <ul className="space-y-2">
              {x.links.map(([label, url]) => (
                <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm sm:text-base text-[#E62E6B] underline decoration-[#E62E6B]/40 underline-offset-2 hover:decoration-[#E62E6B]">{label} <ExternalLink size={13} /></a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export const extrasFaq = (path) => extrasFor(path)?.faq || [];
