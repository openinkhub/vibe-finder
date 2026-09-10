import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../fx/Reveal";
import { FaceModel3D } from "./FaceModel3D";
import { CompareCard } from "./CompareCard";
import { LAB_LOOKS } from "./faceTexture";
import { api, imgUrl } from "../../lib/api";
import { scrollToId } from "../Navbar";

export const useShowcase = () => {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/studio/showcase", { timeout: 180000 }).then((r) => setData(r.data)).catch(() => setData({ before: "/sample-face.jpg", looks: [] })); }, []);
  return data;
};

const LookLab = () => {
  const [active, setActive] = useState(LAB_LOOKS[1]);
  const showcase = useShowcase();
  const after = showcase?.looks?.find((l) => l.key === active.key)?.url;

  return (
    <section id="looklab" className="relative bg-[#FBE9F0] py-20 md:py-32 scroll-mt-20 overflow-hidden" data-testid="looklab-section">
      <div className="absolute -bottom-32 -right-24 w-[380px] h-[380px] rounded-full bg-[#E62E6B]/15 blur-3xl" />
      <div className="relative max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10">
        <Reveal className="max-w-2xl">
          <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#E62E6B]">Look lab · interactive 3D</span>
          <h2 className="font-display text-[#4A2530] text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-4 sm:mt-5">Four signatures, <span className="italic text-[#E62E6B]">one face</span></h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#5C4E52]">Tap a look — the porcelain model changes its makeup live, and the portrait beside it reveals the real transformation. Drag both.</p>
        </Reveal>

        <div className="mt-8 md:mt-10 flex flex-wrap gap-2" data-testid="looklab-buttons">
          {LAB_LOOKS.map((l) => (
            <button key={l.key} onClick={() => setActive(l)} className={`flex items-center gap-2 pl-2 pr-5 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${active.key === l.key ? "bg-[#E62E6B] border-[#E62E6B] text-white shadow-lg shadow-[#E62E6B]/25" : "bg-white border-[#F1DCE3] text-[#4A2530] hover:border-[#E62E6B]"}`} data-testid={`looklab-${l.key}`}>
              <span className="flex -space-x-1.5">{[l.lips, l.blush, l.eyes].map((c) => <span key={c} className="w-4 h-4 rounded-full border border-white" style={{ background: c }} />)}</span>
              {l.name}
            </button>
          ))}
        </div>

        <div className="mt-6 md:mt-8 grid lg:grid-cols-2 gap-5 lg:gap-8 items-stretch">
          <Reveal delay={0.05} className="min-w-0">
            <div className="relative h-[440px] sm:h-[520px] lg:h-full lg:min-h-[560px] rounded-[28px] bg-white border border-[#F1DCE3] overflow-hidden cursor-grab active:cursor-grabbing" data-testid="face-model-wrap">
              <FaceModel3D look={active} />
              <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.2em] uppercase text-[#8B7F82]">3D model · drag to rotate</div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div><div className="font-display text-2xl text-[#4A2530]">{active.name}</div><div className="font-mono text-[10px] uppercase tracking-wider text-[#8B7F82]">Lips {active.lips} · Cheeks {active.blush} · Eyes {active.eyes}</div></div>
                <button onClick={() => scrollToId("studio")} className="shrink-0 px-4 py-2 rounded-full bg-[#E62E6B] text-white text-xs font-medium hover:bg-[#C81F57]" data-testid="looklab-tryon-btn">Try on my face</button>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.12} className="min-w-0">
            {after ? (
              <CompareCard before={showcase.before} after={imgUrl(after)} label={active.name} className="h-[440px] sm:h-[520px] lg:h-full lg:min-h-[560px] shadow-[0_30px_80px_-30px_rgba(230,46,107,0.45)]" testid="looklab-compare" />
            ) : (
              <div className="h-[440px] sm:h-[520px] lg:h-full lg:min-h-[560px] rounded-[24px] bg-white border border-[#F1DCE3] flex items-center justify-center text-[#8B7F82] font-mono text-[11px] uppercase tracking-widest" data-testid="looklab-compare-loading">{showcase ? "Portrait unavailable" : "Preparing portraits…"}</div>
            )}
          </Reveal>
        </div>

        <div className="mt-6 flex justify-end">
          <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E62E6B] hover:gap-2.5 transition-all" data-testid="looklab-portfolio-link">See the scroll transformation & parallax gallery <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
};

export default LookLab;
