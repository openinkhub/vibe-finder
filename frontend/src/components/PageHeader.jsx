import React from "react";

const PageHeader = ({ eyebrow, title, accent, subtitle }) => {
  return (
    <section className="relative bg-[#F4F1EA] pt-36 md:pt-44 pb-16 md:pb-20 overflow-hidden grain">
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#F4B7CE]/40 blur-3xl" />
      <div className="absolute top-20 -left-32 w-[360px] h-[360px] rounded-full bg-[#E9DFF0]/50 blur-3xl" />
      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10">
        <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#E62E6B]">
          <span className="w-6 h-px bg-[#E62E6B]" /> {eyebrow}
        </span>
        <h1 className="font-display text-[#4A2530] text-5xl md:text-6xl lg:text-7xl leading-[1.03] mt-5 max-w-4xl">
          {title} {accent && <span className="italic text-[#E62E6B]">{accent}</span>}
        </h1>
        {subtitle && <p className="mt-6 text-lg text-[#5C4E52] max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
};

export default PageHeader;
