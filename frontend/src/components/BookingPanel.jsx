import React from "react";
import { CalendarCheck, GraduationCap } from "lucide-react";
import { enquiryServiceFor } from "../lib/pages";
import { Reveal } from "./fx/Reveal";
import { BookingForm } from "./BookingForm";

export const BookingPanel = ({ page }) => {
  const isCourse = page.group === "Academy";
  return (
    <section className="max-w-[1320px] mx-auto px-5 sm:px-6 md:px-10 pb-14 md:pb-20" id="book-form" data-testid={`booking-panel-${isCourse ? "course" : "service"}`}>
      <Reveal>
        <div className={`rounded-[28px] p-6 sm:p-10 grid md:grid-cols-[1fr_1.1fr] gap-8 items-center ${isCourse ? "bg-[#4A2530] text-white" : "bg-white border border-[#F1DCE3] shadow-[0_30px_80px_-40px_rgba(230,46,107,0.35)]"}`}>
          <div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isCourse ? "bg-[#E62E6B]" : "bg-[#FBE9F0] text-[#C8215A]"}`}>{isCourse ? <GraduationCap size={20} /> : <CalendarCheck size={20} />}</div>
            <div className={`font-mono text-[10px] tracking-[0.24em] uppercase ${isCourse ? "text-[#F4B7CE]" : "text-[#C8215A]"}`}>{isCourse ? "Enquire about the next batch" : "Check availability"}</div>
            <h3 className={`font-display text-2xl sm:text-3xl mt-2 ${isCourse ? "text-white" : "text-[#4A2530]"}`}>{isCourse ? `Save your spot in ${page.name}` : `Ready to book ${page.name.toLowerCase()} makeup?`}</h3>
            <p className={`text-sm mt-3 ${isCourse ? "text-white/75" : "text-[#5C4E52]"}`}>{isCourse ? "Each batch has only a few seats. Leave your details and we'll hold a spot while you decide." : "Share your details and we'll confirm your date across Bangalore."}</p>
          </div>
          <BookingForm isCourse={isCourse} service={enquiryServiceFor(page)} />
        </div>
      </Reveal>
    </section>
  );
};
